import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is a member of the team
    const userMembership = await db.teamMember.findFirst({
      where: {
        teamId: params.id,
        userId: session.user.id,
      },
    })

    if (!userMembership) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all members of the team
    const members = await db.teamMember.findMany({
      where: {
        teamId: params.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        permissions: true,
      },
    })

    return NextResponse.json(members)
  } catch (error) {
    console.error("Error fetching team members:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is an admin of the team
    const userMembership = await db.teamMember.findFirst({
      where: {
        teamId: params.id,
        userId: session.user.id,
        permissions: {
          manageTeam: true,
        },
      },
      include: {
        permissions: true,
      },
    })

    if (!userMembership || !userMembership.permissions?.manageTeam) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    // Validate required fields
    if (!data.email || !data.role) {
      return NextResponse.json({ error: "Email and role are required" }, { status: 400 })
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: {
        email: data.email,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user is already a member of the team
    const existingMembership = await db.teamMember.findFirst({
      where: {
        teamId: params.id,
        userId: user.id,
      },
    })

    if (existingMembership) {
      return NextResponse.json({ error: "User is already a member of this team" }, { status: 400 })
    }

    // Create new team member
    const member = await db.teamMember.create({
      data: {
        teamId: params.id,
        userId: user.id,
        role: data.role,
        permissions: {
          create: {
            createCards: data.permissions?.createCards || false,
            editCards: data.permissions?.editCards || false,
            deleteCards: data.permissions?.deleteCards || false,
            manageTeam: data.permissions?.manageTeam || false,
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        permissions: true,
      },
    })

    return NextResponse.json(member)
  } catch (error) {
    console.error("Error adding team member:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

