import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    //! Get all teams the user is a member of
    const teams = await db.teamMember.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        team: true,
        permissions: true,
      },
    })

    return NextResponse.json(teams)
  } catch (error) {
    console.error("Error fetching teams:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    // Validate required fields
    if (!data.name) {
      return NextResponse.json({ error: "Team name is required" }, { status: 400 })
    }

    // Create new team
    const team = await db.team.create({
      data: {
        name: data.name,
        description: data.description || null,
        members: {
          create: {
            userId: session.user.id,
            role: "admin",
            permissions: {
              create: {
                createCards: true,
                editCards: true,
                deleteCards: true,
                manageTeam: true,
              },
            },
          },
        },
      },
      include: {
        members: {
          include: {
            permissions: true,
          },
        },
      },
    })

    return NextResponse.json(team)
  } catch (error) {
    console.error("Error creating team:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

