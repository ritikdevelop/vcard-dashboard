import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { nanoid } from "nanoid"; // Import nanoid

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    //! Get all vCards for the current user
    const vcards = await db.vCard.findMany({
      where: {
        userId: session.user.id,
      },
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

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    //! Validate required fields
    if (!data.name || !data.email || !data.phone) {
      return NextResponse.json({ error: "Name, email, and phone are required fields" }, { status: 400 });
    }

    //! Create new vCard
    const vcard = await db.vCard.create({
      data: {
        userId: session.user.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        website: data.website || null,
        company: data.company || null,
        position: data.position || null,
        address: data.address || null,
        bio: data.bio || null,
        enableNFC: data.enableNFC || false,
        template: data.template || "template1",
        primaryColor: data.primaryColor || "#4285F4",
        profileImageUrl: data.profileImageUrl || null,
      },
    });

    //! Generate a unique public URL for the vCard
    try {
      const publicId = generatePublicId();
      await db.vCardPublic.create({
        data: {
          vCardId: vcard.id,
          publicId,
        },
      });
    } catch (error) {
      console.error("Error creating publicId:", error);
    }

    return NextResponse.json(vcard);
  } catch (error) {
    console.error("Error creating vCard:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

//! Helper function to generate a unique public ID
function generatePublicId() {
  return nanoid(); // Use nanoid for unique ID generation
}

