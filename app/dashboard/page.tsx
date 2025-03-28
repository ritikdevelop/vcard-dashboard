"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CreditCard, Users, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from "@/lib/db" // Import database

export default function DashboardPage() {
  const [nfcScans, setNfcScans] = useState(0)

  useEffect(() => {
    const fetchNfcScans = async () => {
      try {
        const response = await fetch("/api/nfc-scans");
        if (!response.ok) {
          if (response.status === 404) {
            console.warn("API endpoint not found.");
            setNfcScans(0); // Default value
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Response is not JSON");
        }
        const data = await response.json();
        setNfcScans(data.nfcScans || 0);
      } catch (error) {
        console.error("Failed to fetch NFC scans:", error);
      }
    };

    fetchNfcScans();
  }, [])

  return (
    <div className="grid gap-4 md:gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Manage your digital vCards and NFC integrations</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total vCards</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/cards" className="w-full">
              <Button variant="outline" className="w-full">
                View all
              </Button>
            </Link>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">+1 from last month</p>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/team" className="w-full">
              <Button variant="outline" className="w-full">
                Manage team
              </Button>
            </Link>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">NFC Scans</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nfcScans}</div>
            <p className="text-xs text-muted-foreground">+24% from last month</p>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/analytics" className="w-full">
              <Button variant="outline" className="w-full">
                View analytics
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your vCard activity for the past 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center border rounded-md">
              <p className="text-sm text-muted-foreground">Activity chart will appear here</p>
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent vCards</CardTitle>
            <CardDescription>Your recently created or updated vCards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {["John Doe", "Marketing Team", "Sarah Johnson"].map((name, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-medium text-primary">{name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{name}</p>
                    <p className="text-xs text-muted-foreground">Updated 2 days ago</p>
                  </div>
                  <Link href={`/dashboard/cards/${i + 1}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ArrowUpRight className="h-4 w-4" />
                      <span className="sr-only">View details</span>
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/cards" className="w-full">
              <Button variant="outline" className="w-full">
                View all vCards
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

