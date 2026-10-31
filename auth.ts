import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import EmailProvider from 'next-auth/providers/nodemailer';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { compare } from 'bcryptjs';
import { randomInt } from 'node:crypto';
import nodemailer from 'nodemailer';
import { z } from 'zod';
import { prisma } from './src/lib/prisma';

const credentialsSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(72),
});

const emailServer = {
  host: process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_SERVER_PORT) || 587,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
};
const emailTransport = nodemailer.createTransport(emailServer);

const emailProvider = EmailProvider({
  id: 'email',
  server: emailServer,
  from: process.env.EMAIL_FROM,
  maxAge: 10 * 60,
  generateVerificationToken() {
    return randomInt(0, 1_000_000).toString().padStart(6, '0');
  },
  async sendVerificationRequest({ identifier, token }) {
    if (process.env.NODE_ENV !== 'production') console.log('YOUR OTP CODE IS:', token);

    try {
      if (!emailServer.auth.user || !emailServer.auth.pass || !process.env.EMAIL_FROM) {
        throw new Error('Email authentication is not configured. Set the EMAIL_SERVER_* and EMAIL_FROM variables.');
      }

      await emailTransport.sendMail({
        to: identifier,
        from: process.env.EMAIL_FROM,
        subject: 'Flavour & Fragrances — Verification Code',
        text: `Your Flavour & Fragrances verification code is ${token}. It expires in 10 minutes.`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #E8E5DF; border-radius: 8px; background: #FAF9F6; color: #0F1E19;">
            <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #9A7738; margin: 0 0 12px;">Flavour & Fragrances</p>
            <h2 style="font-size: 20px; font-weight: 600; color: #0C1612; margin: 0 0 16px;">Authentication Code</h2>
            <p style="font-size: 14px; color: #4A5568; line-height: 1.5; margin: 0 0 20px;">Use the verification code below to complete your sign-in request:</p>
            <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 6px; padding: 18px; text-align: center; margin-bottom: 20px;">
              <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #0C1612; font-family: monospace;">${token}</span>
            </div>
            <p style="font-size: 12px; color: #718096; margin: 0;">This code expires in 10 minutes. If you did not request this code, please safely ignore this message.</p>
          </div>
        `,
      });
    } catch (error) {
      console.error('Nodemailer failed to send the verification OTP email:', error);
      if (process.env.NODE_ENV === 'production') throw error;

      console.warn(`Email OTP delivery failed for ${identifier}; use the OTP printed above.`);
    }
  },
});

function isAdminEmail(email?: string | null) {
  if (!email) return false;
  const allowlist = (process.env.ADMIN_SEED_EMAIL || '')
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
  return allowlist.includes(email.trim().toLowerCase());
}

const googleProvider = GoogleProvider({
  clientId: process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET || '',
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 30 },
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase().trim() },
        });
        if (!user?.passwordHash || !(await compare(parsed.data.password, user.passwordHash))) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
    emailProvider,
    googleProvider,
  ],
  callbacks: {
    signIn({ account, profile }) {
      if (account?.provider === 'google') {
        return profile?.email_verified === true;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        const customUser = user as { id?: string; email?: string | null; role?: string; isAdmin?: boolean };
        token.role = customUser.role || 'Customer';
        const hasAdminRole = ['Super Admin', 'Admin', 'Staff'].includes(customUser.role as string);
        const isAllowlisted = isAdminEmail(customUser.email);
        token.isAdmin = hasAdminRole || isAllowlisted;
      } else if (token.sub && !token.role) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true, email: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.isAdmin = ['Super Admin', 'Admin', 'Staff'].includes(dbUser.role) || isAdminEmail(dbUser.email);
        }
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        if (token.sub) session.user.id = token.sub;
        const customSessionUser = session.user as { id?: string; email?: string | null; role?: string; isAdmin?: boolean };
        customSessionUser.role = (token.role as string) || 'Customer';
        customSessionUser.isAdmin = token.isAdmin === true;
      }
      return session;
    },
  },
  trustHost: true,
});
