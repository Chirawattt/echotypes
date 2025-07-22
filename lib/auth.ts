import type { JWT } from "next-auth/jwt"
import GoogleProvider from "next-auth/providers/google"
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const authOptions: any = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async signIn({ user, account }: { user: any; account: any; profile?: any }) {
      if (account?.provider === 'google') {
        try {
          // Check if user exists, if not create them
          const { error: fetchError } = await supabase
            .from('Users')
            .select('id')
            .eq('email', user.email)
            .single();

          if (fetchError && fetchError.code === 'PGRST116') {
            // User doesn't exist, create them
            const { error: createError } = await supabase
              .from('Users')
              .insert({
                email: user.email,
                name: null, // Will be set during registration
                image: user.image,
                emailVerified: new Date().toISOString(),
              });

            if (createError) {
              console.error('Error creating user:', createError);
              return false;
            }
          } else if (fetchError) {
            console.error('Error checking user:', fetchError);
            return false;
          }
        } catch (error) {
          console.error('SignIn error:', error);
          return false;
        }
        return true;
      }
      return false;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async redirect({ url, baseUrl }: { url: any; baseUrl: any }) {
      // Store login timestamp for welcome toast detection
      if (url === baseUrl) {
        // This is a successful login redirect to home page
        // The client will read this timestamp via localStorage
        return `${baseUrl}?loginTimestamp=${Date.now()}`;
      }
      return baseUrl;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: { session: any; token: JWT }) {
      if (session?.user && token.sub) {
        // Get user from our database
        const { data: user } = await supabase
          .from('Users')
          .select('id, name, email, image')
          .eq('email', session.user.email)
          .single();

        if (user) {
          session.user.id = user.id;
          if (user.name) {
            session.user.name = user.name;
          }
        }
      }
      return session;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user, account }: { token: JWT; user?: any; account?: any }) {
      if (user && account) {
        token.sub = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
}