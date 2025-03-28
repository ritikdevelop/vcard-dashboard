import type { NextAuthOptions, Session } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"


declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: string | null // Add role to the session
    }
  }

  interface JWT {
    id: string
    name?: string | null
    email?: string | null
    picture?: string | null
    role?: string | null // Add role to the JWT
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string | null // Add role to the User
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error("Missing email or password")
          return null
        }

        const user = await db.user.findUnique({
          where: {
            email: credentials.email,
          },
        })

        if (!user || !user.password) {
          console.error("User not found or password missing")
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          console.error("Invalid password")
          return null
        }

        console.log("User authorized:", user)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async session({ token, session }) {
      if (token) {
        session.user = {
          id: token.id as string,
          name: token.name as string,
          email: token.email as string,
          image: token.picture as string,
          role: token.role as string, // Add role to the session
        }
      }

      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.name = user.name
        token.email = user.email
        token.picture = user.image
        token.role = user.role // Add role to the token
      } else if (!token.role) {
        // Fetch user data from the database only if the role is not already in the token
        const dbUser = await db.user.findFirst({
          where: {
            email: token.email,
          },
        })

        if (dbUser) {
          token.id = dbUser.id
          token.name = dbUser.name
          token.email = dbUser.email
          token.picture = dbUser.image
          token.role = dbUser.role // Ensure role is fetched from the database
        }
      }

      return token
    },
  },
}

export const auth = () => getServerSession(authOptions)

export async function GET(request: Request) {
  try {
    // Temporarily bypass auth for testing
    const vcards = await db.vCard.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(vcards);
  } catch (error) {
    console.error("Error fetching vCards:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

