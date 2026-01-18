import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

// Admin users with their passwords (stored in env vars)
const ADMIN_USERS: Record<string, { name: string; passwordEnvVar: string }> = {
  'howard@chatmaninc.com': { name: 'Howard Chatman', passwordEnvVar: 'ADMIN_PASSWORD' },
  'ecko@chatmaninc.com': { name: 'Ecko Chatman', passwordEnvVar: 'ADMIN_PASSWORD_ECKO' },
};

// Admin emails list for quick lookup
const ADMIN_EMAILS = Object.keys(ADMIN_USERS);

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    // Credentials provider for admin login
    CredentialsProvider({
      name: 'Admin Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const adminUser = ADMIN_USERS[credentials.email];
        if (!adminUser) {
          return null;
        }

        // Get the password from the appropriate env var
        const expectedPassword = process.env[adminUser.passwordEnvVar];
        if (credentials.password !== expectedPassword) {
          return null;
        }

        return {
          id: credentials.email,
          email: credentials.email,
          name: adminUser.name,
          role: 'admin',
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Only allow admin emails
      if (user.email && ADMIN_EMAILS.includes(user.email)) {
        return true;
      }
      return false;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = ADMIN_EMAILS.includes(user.email || '') ? 'admin' : 'user';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  session: {
    strategy: 'jwt',
  },
};
