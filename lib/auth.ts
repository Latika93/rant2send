import { NextAuthOptions, getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user?.email) return false;
      await connectDB();
      const existing = await User.findOne({ email: user.email });
      if (!existing) {
        await User.create({
          email: user.email,
          name: user.name ?? null,
          image: user.image ?? null,
          credits: 10,
          totalUsage: 0,
        });
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        await connectDB();
        const dbUser = await User.findOne({ email: user.email }).select("_id").lean();
        if (dbUser) (token as { userId?: string }).userId = dbUser._id.toString();
      }
      return token;
    },
    async session({ session, token }) {
      const userId = (token as { userId?: string }).userId;
      if (session?.user && userId) {
        await connectDB();
        const dbUser = await User.findOne({ _id: userId }).select("credits").lean();
        if (dbUser) {
          (session.user as { id?: string; credits?: number }).id = userId;
          (session.user as { id?: string; credits?: number }).credits = dbUser.credits;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET,
};

export async function getSession() {
  return getServerSession(authOptions);
}
