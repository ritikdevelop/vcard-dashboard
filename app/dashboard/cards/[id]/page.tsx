"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Edit, QrCode, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function CardDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null)
  const [vCard, setVCard] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVCard = async () => {
      try {
        const resolvedParams = await params
        setId(resolvedParams.id)

        // Fetch vCard data from the API
        const response = await fetch(`/api/vcards/${resolvedParams.id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch vCard data")
        }

        const data = await response.json()
        setVCard(data)
      } catch (error) {
        console.error("Error fetching vCard:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchVCard()
  }, [params])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!vCard) {
    return <div>Error: vCard not found</div>
  }

  return (
    <div className="grid gap-4 md:gap-8">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/cards/${id}`}>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{vCard.name}</h1>
          <p className="text-muted-foreground">
            {vCard.position} at {vCard.company}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/cards/${id}/edit`}>
            <Button variant="outline" size="sm" className="gap-1">
              <Edit className="h-3.5 w-3.5" />
              <span>Edit</span>
            </Button>
          </Link>
          <Button size="sm" className="gap-1">
            <Share2 className="h-3.5 w-3.5" />
            <span>Share</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Personal and business contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xl font-semibold text-primary">{vCard.name.charAt(0)}</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold">{vCard.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {vCard.position} at {vCard.company}
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">Email:</span>
                <span>{vCard.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Phone:</span>
                <span>{vCard.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Website:</span>
                <span>{vCard.website}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Address:</span>
                <span>{vCard.address}</span>
              </div>
            </div>

            <Separator />

            <div className="space-y-1">
              <span className="font-medium">Bio:</span>
              <p className="text-sm">{vCard.bio}</p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Social Media</CardTitle>
              <CardDescription>Connected social media accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {Object.entries(vCard.socialLinks || {}).map(([platform, url]) => (
                  <div key={platform} className="flex items-center justify-between">
                    <span className="capitalize">{platform}</span>
                    <Link href={url as string} target="_blank" rel="noopener noreferrer">
                      <Button variant="link" className="h-auto p-0">
                        {typeof url === "string" ? url.split("/").pop() : ""}
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>NFC Settings</CardTitle>
              <CardDescription>Configure NFC card integration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>NFC Status</span>
                  {vCard.nfcEnabled ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200">
                      Enabled
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-gray-50 text-gray-700 hover:bg-gray-50 border-gray-200">
                      Disabled
                    </Badge>
                  )}
                </div>

                <div className="rounded-lg border p-4">
                  <div className="text-center space-y-2">
                    <QrCode className="mx-auto h-24 w-24 text-primary" />
                    <p className="text-sm">Scan this QR code to view this vCard</p>
                    <Button variant="outline" size="sm" className="w-full">
                      Download QR Code
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Link href={`/dashboard/cards/${id}/nfc`} className="w-full">
                <Button variant="outline" className="w-full">
                  Configure NFC
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

