import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_OAUTH_CLIENT_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.AUTH_SECRET,
  callbacks: {
    async jwt({ token, profile }) {
      if (profile?.email)  token.email   = profile.email;
      if (profile?.name)   token.name    = profile.name;
      if ((profile as Record<string, unknown>)?.picture) token.picture = (profile as Record<string, unknown>).picture as string;
      return token;
    },
    async session({ session, token }) {
      if (token.email)   session.user.email = token.email as string;
      if (token.name)    session.user.name  = token.name  as string;
      if (token.picture) session.user.image = token.picture as string;
      return session;
    },
  },
});
