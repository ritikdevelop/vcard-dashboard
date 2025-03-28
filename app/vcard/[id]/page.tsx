import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";

interface VCardPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: VCardPageProps): Promise<Metadata> {
  const { id } = await params; // Access params directly

  const publicLink = await db.vCardPublic.findUnique({
    where: {
      publicId: id,
    },
    include: {
      vCard: true,
    },
  });

  if (!publicLink) {
    return {
      title: "vCard Not Found",
    };
  }

  return {
    title: `${publicLink.vCard.name} | Digital vCard`,
    description: publicLink.vCard.bio || `Digital vCard for ${publicLink.vCard.name}`,
  };
}

export default async function VCardPage({ params }: VCardPageProps) {
  const { id } = await params; // Access params directly

  const publicLink = await db.vCardPublic.findUnique({
    where: { publicId: id },
    include: {
      vCard: {
        include: {
          socialLinks: true,
        },
      },
    },
  });

  if (!publicLink) {
    notFound(); // Show a 404 page if the vCard is not found
  }

  const vCard = publicLink.vCard;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">{vCard.name}</h1>
      <p className="text-muted-foreground">
        {vCard.position} at {vCard.company}
      </p>
      <p>Email: {vCard.email}</p>
      <p>Phone: {vCard.phone}</p>
      <p>Website: {vCard.website}</p>
      <p>Bio: {vCard.bio}</p>

      <h2 className="mt-4 text-xl font-semibold">Social Links</h2>
      <ul>
        {vCard.socialLinks.map((link) => (
          <li key={link.platform}>
            <a href={link.url} target="_blank" rel="noopener noreferrer">
              {link.platform}: {link.url}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

