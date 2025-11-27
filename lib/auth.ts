import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { compare } from 'bcryptjs';
import connectDB from './mongodb';
import User from './models/User';
import Account from './models/Account';
import SubscriptionPlan from './models/SubscriptionPlan';
import UserSubscription from './models/UserSubscription';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        try {
          await connectDB();
        } catch (error) {
          console.error('Database connection error in authorize:', error);
          throw new Error('Database connection failed');
        }

        const user = await User.findOne({ email: credentials.email.toLowerCase() });

        if (!user || !user.password_hash) {
          throw new Error('Invalid credentials');
        }

        const isPasswordValid = await compare(credentials.password, user.password_hash);

        if (!isPasswordValid) {
          throw new Error('Invalid credentials');
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          await connectDB();
        } catch (error) {
          console.error('Database connection error in signIn:', error);
          return false;
        }

        const existingUser = await User.findOne({ email: user.email!.toLowerCase() });

        if (!existingUser) {
          const newUser = await User.create({
            email: user.email!.toLowerCase(),
            name: user.name,
            image: user.image,
            email_verified: new Date(),
          });

          user.id = newUser._id.toString();

          await Account.create({
            user_id: newUser._id.toString(),
            type: account.type,
            provider: account.provider,
            provider_account_id: account.providerAccountId,
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            expires_at: account.expires_at,
            token_type: account.token_type,
            scope: account.scope,
            id_token: account.id_token,
          });

          const freePlan = await SubscriptionPlan.findOne({ name: 'Free' });

          if (freePlan) {
            await UserSubscription.create({
              user_id: newUser._id.toString(),
              plan_id: freePlan._id.toString(),
              status: 'active',
            });
          }
        } else {
          user.id = existingUser._id.toString();
        }
      }

      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
