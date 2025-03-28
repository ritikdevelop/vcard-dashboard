"use client"

import { useEffect, useState } from "react"
import { PlusCircle, Search, MoreHorizontal, Mail, Phone, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { db } from "@/lib/db" // Import database

export default function TeamPage() {
  const { toast } = useToast()
  const [teamMembers, setTeamMembers] = useState([])

  useEffect(() => {
    const fetchTeamMembers = async () => {
      const response = await db.teamMember.findMany({
        include: {
          permissions: true,
        },
      })
      setTeamMembers(response)
    }

    fetchTeamMembers()
  }, [])

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<number | null>(null)

  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Viewer",
  })

  const [permissions, setPermissions] = useState({
    createCards: false,
    editCards: false,
    deleteCards: false,
    manageTeam: false,
  })

  const handleAddMember = () => {
    // In a real app, you would send this to your API
    toast({
      title: "Team Member Added",
      description: `${newMember.name} has been added to your team.`,
      variant: "success",
    })

    setIsAddDialogOpen(false)
    setNewMember({
      name: "",
      email: "",
      phone: "",
      role: "Viewer",
    })
  }

  const handleOpenPermissions = (memberId: number) => {
    const member = teamMembers.find((m) => m.id === memberId)
    if (member) {
      setPermissions(member.permissions)
      setSelectedMember(memberId)
      setIsPermissionsDialogOpen(true)
    }
  }

  const handleSavePermissions = () => {
    // In a real app, you would update permissions via API
    toast({
      title: "Permissions Updated",
      description: "Team member permissions have been updated successfully.",
      variant: "success",
    })

    setIsPermissionsDialogOpen(false)
  }

  const handleRemoveMember = (name: string) => {
    // In a real app, you would send this to your API
    toast({
      title: "Team Member Removed",
      description: `${name} has been removed from your team.`,
      variant: "success",
    })
  }

  return (
    <div className="grid gap-4 md:gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground">Manage team members and their access to vCards</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Team Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Team Member</DialogTitle>
              <DialogDescription>Add a new member to your team and set their permissions.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newMember.phone}
                  onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select value={newMember.role} onValueChange={(value) => setNewMember({ ...newMember, role: value })}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Administrator">Administrator</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Editor">Editor</SelectItem>
                    <SelectItem value="Viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddMember}>Add Member</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search team members..." className="w-full pl-8" />
        </div>
        <Button variant="outline">Filter</Button>
      </div>

      <div className="grid gap-4">
        {teamMembers.map((member) => (
          <Card key={member.id}>
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-medium text-primary">{member.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{member.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{member.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Cards:</span>
                    <span className="text-sm">{member.cardsCreated}</span>
                  </div>
                  <div>
                    {member.status === "active" ? (
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-800"
                      >
                        Active
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-800"
                      >
                        Pending
                      </Badge>
                    )}
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
                      <DropdownMenuItem onClick={() => handleOpenPermissions(member.id)}>
                        Manage Permissions
                      </DropdownMenuItem>
                      <DropdownMenuItem>Edit Member</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>View Cards</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive" onClick={() => handleRemoveMember(member.name)}>
                        Remove Member
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted">
                    {member.permissions.createCards ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <X className="h-3 w-3 text-red-600" />
                    )}
                  </div>
                  <span className="text-xs">Create vCards</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted">
                    {member.permissions.editCards ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <X className="h-3 w-3 text-red-600" />
                    )}
                  </div>
                  <span className="text-xs">Edit vCards</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted">
                    {member.permissions.deleteCards ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <X className="h-3 w-3 text-red-600" />
                    )}
                  </div>
                  <span className="text-xs">Delete vCards</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted">
                    {member.permissions.manageTeam ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <X className="h-3 w-3 text-red-600" />
                    )}
                  </div>
                  <span className="text-xs">Manage Team</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isPermissionsDialogOpen} onOpenChange={setIsPermissionsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Permissions</DialogTitle>
            <DialogDescription>Set what this team member can do within your organization.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Create vCards</Label>
                <p className="text-sm text-muted-foreground">Allow this member to create new vCards</p>
              </div>
              <Switch
                checked={permissions.createCards}
                onCheckedChange={(checked) => setPermissions({ ...permissions, createCards: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Edit vCards</Label>
                <p className="text-sm text-muted-foreground">Allow this member to edit existing vCards</p>
              </div>
              <Switch
                checked={permissions.editCards}
                onCheckedChange={(checked) => setPermissions({ ...permissions, editCards: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Delete vCards</Label>
                <p className="text-sm text-muted-foreground">Allow this member to delete vCards</p>
              </div>
              <Switch
                checked={permissions.deleteCards}
                onCheckedChange={(checked) => setPermissions({ ...permissions, deleteCards: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Manage Team</Label>
                <p className="text-sm text-muted-foreground">Allow this member to add, edit, and remove team members</p>
              </div>
              <Switch
                checked={permissions.manageTeam}
                onCheckedChange={(checked) => setPermissions({ ...permissions, manageTeam: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPermissionsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePermissions}>Save Permissions</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

