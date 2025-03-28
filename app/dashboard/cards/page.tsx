"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlusCircle, Search, MoreHorizontal, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export default function CardsPage() {
  const [vCards, setVCards] = useState<{ id: string; name: string; position: string; company: string; email: string; phone: string; nfcEnabled: boolean; }[]>([]);

  useEffect(() => {
    const fetchVCards = async () => {
      try {
        const response = await fetch("/api/vcards");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setVCards(data);
      } catch (error) {
        console.error("Failed to fetch vCards:", error);
      }
    };

    fetchVCards();
  }, []);

  return (
    <div className="grid gap-4 md:gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">vCards</h1>
          <p className="text-muted-foreground">
            Manage your digital vCards and NFC integrations
          </p>
        </div>
        <Link href="/dashboard/cards/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New vCard
          </Button>
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search vCards..."
            className="w-full pl-8"
          />
        </div>
        <Button variant="outline">Filter</Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {vCards.map((card) => (
          <Card key={card.id} className="overflow-hidden">
            <CardHeader className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle>{card.name}</CardTitle>
                  <CardDescription>
                    {card.position} at {card.company}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>
                      <Link
                        href={`/dashboard/cards/${card.id}`}
                        className="flex w-full"
                      >
                        View
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link
                        href={`/dashboard/cards/${card.id}/edit`}
                        className="flex w-full"
                      >
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Link
                        href={`/dashboard/cards/${card.id}/qr`}
                        className="flex w-full"
                      >
                        Generate QR Code
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link
                        href={`/dashboard/cards/${card.id}/nfc`}
                        className="flex w-full"
                      >
                        NFC Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Email:</span>
                  <span>{card.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Phone:</span>
                  <span>{card.phone}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between border-t p-4">
              <div>
                {card.nfcEnabled ? (
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200"
                  >
                    NFC Enabled
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-gray-50 text-gray-700 hover:bg-gray-50 border-gray-200"
                  >
                    NFC Disabled
                  </Badge>
                )}
              </div>
              <Link href={`/dashboard/cards/${card.id}/qr`}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <QrCode className="h-4 w-4" />
                  <span className="sr-only">QR Code</span>
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
