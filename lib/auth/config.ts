import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

// Admin users whitelist
const ADMIN_EMAILS = [
  'howard@chatmaninc.com',
];

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    // Fallback credentials provider for development
    CredentialsProvider({
      name: 'Admin Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // In production, use proper password hashing
        // This is a simple check for the admin email
        if (
          credentials?.email &&
          ADMIN_EMAILS.includes(credentials.email) &&
          credentials.password === process.env.ADMIN_PASSWORD
        ) {
          return {
            id: '1',
            email: credentials.email,
            name: 'Howard Chatman',
            role: 'admin',
          };
        }
        return null;
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
