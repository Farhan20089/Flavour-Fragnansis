import 'next-auth';
import 'next-auth/jwt';

export type UserRole = 'Super Admin' | 'Admin' | 'Staff' | 'Customer';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: UserRole | string;
      isAdmin: boolean;
    };
  }

  interface User {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: UserRole | string;
    isAdmin?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: UserRole | string;
    isAdmin?: boolean;
  }
}
