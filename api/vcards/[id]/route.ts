import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

// Define the generatePublicId function
function generatePublicId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const vcard = await db.vCard.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        socialLinks: true,
      },
    })

    if (!vcard) {
      return NextResponse.json({ error: "vCard not found" }, { status: 404 })
    }

    //! Generate a unique public URL for the vCard
    const publicId = generatePublicId();
    await db.vCardPublic.create({
      data: {
        vCardId: vcard.id,
        publicId,
      },
    });

    return NextResponse.json(vcard)
  } catch (error) {
    console.error("Error fetching vCard:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    // Check if vCard exists and belongs to user
    const existingVCard = await db.vCard.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingVCard) {
      return NextResponse.json({ error: "vCard not found" }, { status: 404 })
    }

    // Update vCard
    const updatedVCard = await db.vCard.update({
      where: {
        id: params.id,
      },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        website: data.website || null,
        company: data.company || null,
        position: data.position || null,
        address: data.address || null,
        bio: data.bio || null,
        enableNFC: data.enableNFC || false,
        template: data.template || existingVCard.template,
        primaryColor: data.primaryColor || existingVCard.primaryColor,
        profileImageUrl: data.profileImageUrl || existingVCard.profileImageUrl,
      },
    })

    // Update social links
    if (data.socialLinks) {
      // Delete existing social links
      await db.socialLink.deleteMany({
        where: {
          vCardId: params.id,
        },
      })

      // Create new social links
      if (data.socialLinks.linkedin) {
        await db.socialLink.create({
          data: {
            vCardId: params.id,
            platform: "linkedin",
            url: data.socialLinks.linkedin,
          },
        })
      }

      if (data.socialLinks.twitter) {
        await db.socialLink.create({
          data: {
            vCardId: params.id,
            platform: "twitter",
            url: data.socialLinks.twitter,
          },
        })
      }

      if (data.socialLinks.facebook) {
        await db.socialLink.create({
          data: {
            vCardId: params.id,
            platform: "facebook",
            url: data.socialLinks.facebook,
          },
        })
      }

      if (data.socialLinks.instagram) {
        await db.socialLink.create({
          data: {
            vCardId: params.id,
            platform: "instagram",
            url: data.socialLinks.instagram,
          },
        })
      }
    }

    return NextResponse.json(updatedVCard)
  } catch (error) {
    console.error("Error updating vCard:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if vCard exists and belongs to user
    const existingVCard = await db.vCard.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingVCard) {
      return NextResponse.json({ error: "vCard not found" }, { status: 404 })
    }

    // Delete social links
    await db.socialLink.deleteMany({
      where: {
        vCardId: params.id,
      },
    })

    // Delete public link
    await db.vCardPublic.deleteMany({
      where: {
        vCardId: params.id,
      },
    })

    // Delete vCard
    await db.vCard.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting vCard:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

