<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# SK Group of Company

View the app in AI Studio: https://ai.studio/apps/4e4715fe-c6b6-45f6-bd63-52b81cc24aae

## Local development

**Prerequisite:** Node.js 20.9 or later.

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env`.
3. Set `AUTH_SECRET` to a fresh secret, for example:
   `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"`
4. Keep `DATABASE_URL="file:./dev.db"` to use the local SQLite account database.
5. Set `ADMIN_SEED_EMAIL` to the admin email address or comma-separated admin allowlist.
6. Set `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` to the Google OAuth client
   credentials, and add `http://localhost:3000/api/auth/callback/google` as an
   authorized redirect URI in Google Cloud Console.
7. Configure `EMAIL_SERVER_HOST`, `EMAIL_SERVER_PORT`, `EMAIL_SERVER_USER`,
   `EMAIL_SERVER_PASSWORD`, and `EMAIL_FROM` for SMTP delivery. For Gmail, use
   `smtp.gmail.com`, port `587`, and a Google App Password (not your account password).
   The Admin Portal emails a six-digit code that expires after 10 minutes, and the
   code is also printed to the server terminal for each request.
8. Run `npm run dev`. The predev step applies committed Prisma migrations before starting Next.js.

The App Router storefront is served alongside `/login`, `/signup`, `/account`, and the
NextAuth API routes. Production startup applies pending database migrations as well.
Set `GEMINI_API_KEY` if Gemini-powered features are enabled.
Admin authentication uses Auth.js; Firebase Auth is not initialized. Client-side
Cloud Firestore writes remain disabled because Firestore rules require Firebase
Auth credentials; local state and existing API-backed persistence remain in use.
