"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Upload,
  Check,
  Copy,
  LinkIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Template designs
const templates = [
  {
    id: "template1",
    name: "Classic Blue",
    previewImage: "/templates/template1.png",
    primaryColor: "#4285F4",
    layout: "vertical",
  },
  {
    id: "template2",
    name: "Curved Blue",
    previewImage: "/templates/template2.png",
    primaryColor: "#4285F4",
    layout: "curved",
  },
  {
    id: "template3",
    name: "Centered White",
    previewImage: "/templates/template3.png",
    primaryColor: "#4285F4",
    layout: "centered",
  },
  {
    id: "template4",
    name: "Modern Blue",
    previewImage: "/templates/template4.png",
    primaryColor: "#4285F4",
    layout: "modern",
  },
  {
    id: "template5",
    name: "Clean White",
    previewImage: "/templates/template5.png",
    primaryColor: "#4285F4",
    layout: "clean",
  },
];

export default function NewCardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [vCardCreated, setVCardCreated] = useState(false);
  const [vCardLink, setVCardLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0].id);
  const [currentTemplateIndex, setCurrentTemplateIndex] = useState(0);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    website: "",
    company: "",
    position: "",
    address: "",
    bio: "",
    enableNFC: false,
    socialLinks: {
      linkedin: "",
      twitter: "",
      facebook: "",
      instagram: "h",
    },
    template: templates[0].id,
    primaryColor: templates[0].primaryColor,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [name]: value,
      },
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, enableNFC: checked }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload to a server
      // For now, we'll just create a local URL
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);

      toast({
        title: "Profile Image Uploaded",
        description: "Your profile image has been successfully uploaded.",
        style: { backgroundColor: "green", color: "white" },
        className: "bg-green-500 text-white",
      });
    }
  };

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setFormData((prev) => ({
        ...prev,
        template: templateId,
        primaryColor: template.primaryColor,
      }));

      // Find the index of the selected template
      const index = templates.findIndex((t) => t.id === templateId);
      setCurrentTemplateIndex(index);
    }
  };

  const handleNextTemplate = () => {
    const nextIndex = (currentTemplateIndex + 1) % templates.length;
    setCurrentTemplateIndex(nextIndex);
    handleTemplateChange(templates[nextIndex].id);
  };

  const handlePrevTemplate = () => {
    const prevIndex =
      (currentTemplateIndex - 1 + templates.length) % templates.length;
    setCurrentTemplateIndex(prevIndex);
    handleTemplateChange(templates[prevIndex].id);
  };

  const handleCopyLink = () => {
    navigator.clipboard
      .writeText(vCardLink)
      .then(() => {
        setCopied(true);
        toast({
          title: "Link Copied",
          description: "The vCard link has been copied to your clipboard.",
          style: { backgroundColor: "green", color: "white" },
          className: "bg-green-500 text-white",
        });
        setTimeout(() => {
          setCopied(false);
        }, 2000); // Reset copied state after 2 seconds
      })
      .catch((err) => {
        console.error("Failed to copy link: ", err);
        toast({
          title: "Error",
          description: "Failed to copy the vCard link.",
          className: "bg-red-500 text-white",
        });
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // In a real app, you would send this data to your API
      const payload = {
        ...formData,
        profileImage: profileImage,
      };

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Generate a unique ID for the vCard (in a real app, this would come from the backend)
      const vCardId = Date.now().toString();

      // Generate the vCard link
      const newVCardLink = `${window.location.origin}/vcard/${vCardId}`;
      setVCardLink(newVCardLink);
      setVCardCreated(true);

      // Success toast
      toast({
        title: "vCard Created",
        description: (
          <div>
            <p>Your vCard has been successfully created.</p>
            <p className="mt-2">
              <strong>vCard Link:</strong>{" "}
              <a
                href={newVCardLink}
                className="underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {newVCardLink}
              </a>
            </p>
            <p className="mt-2 text-sm">Use this link with your NFC tool.</p>
          </div>
        ),
        style: { backgroundColor: "green", color: "white" },
        className: "bg-green-500 text-white",
        duration: 10000, // Show for 10 seconds due to the link
      });
    } catch (error) {
      // Error toast
      toast({
        title: "Error Creating vCard",
        description:
          "There was a problem creating your vCard. Please try again.",
        style: { backgroundColor: "red", color: "white" },
        className: "bg-red-500 text-white",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-4 md:gap-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/cards">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Create New vCard
          </h1>
          <p className="text-muted-foreground">
            Add contact information to create a new digital vCard
          </p>
        </div>
      </div>

      {vCardCreated && (
        <Alert className="bg-green-50 border-green-200 text-green-900">
          <LinkIcon className="h-4 w-4" />
          <AlertTitle>vCard Created Successfully</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>
              Your vCard has been created and is ready to be shared or
              programmed to an NFC card.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Input value={vCardLink} readOnly className="flex-1" />
              <Button size="sm" onClick={handleCopyLink}>
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                <span className="ml-2">{copied ? "Copied" : "Copy"}</span>
              </Button>
            </div>
            <div className="flex gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/dashboard/cards")}
              >
                View All vCards
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/dashboard/cards/1/nfc`)}
              >
                Configure NFC
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <Tabs defaultValue="template" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="template">Template</TabsTrigger>
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="work">Work Details</TabsTrigger>
              <TabsTrigger value="social">Social Media</TabsTrigger>
            </TabsList>
            <form onSubmit={handleSubmit}>
              <TabsContent value="template" className="space-y-4 pt-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">
                    Choose a Template Design
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Select a template design for your vCard. This will determine
                    how your vCard appears when shared.
                  </p>

                  <div className="relative mt-6 overflow-hidden rounded-lg border">
                    <div className="flex items-center justify-center p-4">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute left-2 z-10 h-8 w-8 rounded-full bg-background/80"
                        onClick={handlePrevTemplate}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      <div className="relative h-[400px] w-full max-w-[250px] overflow-hidden rounded-lg border">
                        <img
                          src={`https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-03-27%20103835-hHYQ5gPvz7mBv5qBUciWE8vWxyyqqm.png`}
                          alt={`Template ${currentTemplateIndex + 1}`}
                          className="absolute inset-0 h-full w-full object-cover"
                          style={{
                            objectPosition: `${-currentTemplateIndex * 20}% 0`,
                          }}
                        />
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 z-10 h-8 w-8 rounded-full bg-background/80"
                        onClick={handleNextTemplate}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex justify-center p-4">
                      <div className="flex space-x-2">
                        {templates.map((template, index) => (
                          <button
                            key={template.id}
                            type="button"
                            className={`h-2.5 w-2.5 rounded-full ${
                              currentTemplateIndex === index
                                ? "bg-primary"
                                : "bg-gray-300"
                            }`}
                            onClick={() => {
                              setCurrentTemplateIndex(index);
                              handleTemplateChange(template.id);
                            }}
                            aria-label={`Select template ${index + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label>Template Name</Label>
                    <p className="text-sm font-medium">
                      {templates[currentTemplateIndex].name}
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="basic" className="space-y-4 pt-4">
                <div className="flex flex-col items-center gap-4 mb-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profileImage || ""} alt="Profile" />
                    <AvatarFallback className="text-2xl">
                      {formData.name
                        ? formData.name.charAt(0).toUpperCase()
                        : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid w-full gap-2">
                    <Label htmlFor="profile-image">Profile Image</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="profile-image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="flex-1"
                      />
                      <Button type="button" size="icon" variant="outline">
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    name="website"
                    placeholder="https://example.com"
                    value={formData.website}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    placeholder="A short description about yourself"
                    value={formData.bio}
                    onChange={handleChange}
                  />
                </div>
              </TabsContent>
              <TabsContent value="work" className="space-y-4 pt-4">
                <div className="grid gap-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    name="company"
                    placeholder="Acme Inc"
                    value={formData.company}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    name="position"
                    placeholder="CEO"
                    value={formData.position}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    name="address"
                    placeholder="123 Main St, City, State, ZIP"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
              </TabsContent>
              <TabsContent value="social" className="space-y-4 pt-4">
                <div className="grid gap-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    name="linkedin"
                    placeholder="https://linkedin.com/in/username"
                    value={formData.socialLinks.linkedin}
                    onChange={handleSocialChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input
                    id="twitter"
                    name="twitter"
                    placeholder="https://twitter.com/username"
                    value={formData.socialLinks.twitter}
                    onChange={handleSocialChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    name="facebook"
                    placeholder="https://facebook.com/username"
                    value={formData.socialLinks.facebook}
                    onChange={handleSocialChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    name="instagram"
                    placeholder="https://instagram.com/username"
                    value={formData.socialLinks.instagram}
                    onChange={handleSocialChange}
                  />
                </div>
              </TabsContent>

              <Separator className="my-4" />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="nfc-toggle">Enable NFC</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow this vCard to be programmed to NFC cards for tap
                    sharing
                  </p>
                </div>
                <Switch
                  id="nfc-toggle"
                  checked={formData.enableNFC}
                  onCheckedChange={handleSwitchChange}
                />
              </div>

              <div className="mt-6 flex justify-end">
                <Button type="submit" className="gap-2" disabled={isSubmitting}>
                  <Save className="h-4 w-4" />
                  {isSubmitting ? "Saving..." : "Save vCard"}
                </Button>
              </div>
            </form>
          </Tabs>
        </div>

        <div>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">vCard Preview</h2>
                <p className="text-sm text-muted-foreground">
                  This is how your vCard will appear when shared
                </p>
              </div>
              <div className="mt-6 rounded-lg border p-4">
                {formData.name ? (
                  <div className="relative h-[400px] w-full max-w-[250px] mx-auto overflow-hidden rounded-lg border">
                    <div
                      className="absolute inset-0 flex flex-col"
                      style={{
                        backgroundColor:
                          currentTemplateIndex % 2 === 0
                            ? "#ffffff"
                            : "#f8f9fa",
                      }}
                    >
                      {/* Template Preview based on selected template */}
                      {templates[currentTemplateIndex].layout ===
                        "vertical" && (
                        <div className="flex flex-col h-full">
                          <div className="bg-[#4285F4] p-4 text-white text-center">
                            <div className="mx-auto h-16 w-16 rounded-full bg-white flex items-center justify-center overflow-hidden mb-2">
                              {profileImage ? (
                                <img
                                  src={profileImage || "/placeholder.svg"}
                                  alt="Profile"
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="text-xl font-semibold text-[#4285F4]">
                                  {formData.name
                                    ? formData.name.charAt(0).toUpperCase()
                                    : "?"}
                                </span>
                              )}
                            </div>
                            <h3 className="text-lg font-semibold">
                              {formData.name || "Your Full Name"}
                            </h3>
                            <p className="text-sm">
                              {formData.position
                                ? `${formData.position}`
                                : "Position"}
                              {formData.company
                                ? ` - ${formData.company}`
                                : " - Company Name"}
                            </p>
                          </div>

                          <div className="flex border-b">
                            <div className="flex-1 p-2 text-center border-r text-sm">
                              Phone
                            </div>
                            <div className="flex-1 p-2 text-center border-r text-sm">
                              Email
                            </div>
                            <div className="flex-1 p-2 text-center text-sm">
                              Website
                            </div>
                          </div>

                          <div className="p-3 text-sm">
                            <p>{formData.bio || "Personal Description"}</p>
                          </div>

                          <div className="mt-auto p-2 flex justify-end">
                            <div className="bg-[#4285F4] text-white text-xs rounded-full px-3 py-1 flex items-center">
                              Save to contacts
                            </div>
                          </div>
                        </div>
                      )}

                      {templates[currentTemplateIndex].layout !==
                        "vertical" && (
                        <div className="flex flex-col h-full items-center justify-center p-4 text-center">
                          <div className="mx-auto h-24 w-24 rounded-full bg-white flex items-center justify-center overflow-hidden mb-4 border-2 border-[#4285F4]">
                            {profileImage ? (
                              <img
                                src={profileImage || "/placeholder.svg"}
                                alt="Profile"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-2xl font-semibold text-[#4285F4]">
                                {formData.name
                                  ? formData.name.charAt(0).toUpperCase()
                                  : "?"}
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-semibold">
                            {formData.name || "Your Full Name"}
                          </h3>
                          <p className="text-sm text-gray-600 mb-4">
                            {formData.position
                              ? `${formData.position}`
                              : "Position"}
                            {formData.company
                              ? ` - ${formData.company}`
                              : " - Company Name"}
                          </p>

                          <p className="text-sm mb-4">
                            {formData.bio || "Personal Description"}
                          </p>

                          <div className="grid grid-cols-3 gap-2 w-full max-w-[200px]">
                            <div className="bg-[#4285F4] text-white text-xs rounded-md p-2 text-center">
                              Phone
                            </div>
                            <div className="bg-[#4285F4] text-white text-xs rounded-md p-2 text-center">
                              Email
                            </div>
                            <div className="bg-[#4285F4] text-white text-xs rounded-md p-2 text-center">
                              Website
                            </div>
                          </div>

                          <div className="mt-auto pt-4">
                            <div className="bg-[#4285F4] text-white text-xs rounded-full px-3 py-1 flex items-center">
                              Save to contacts
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex h-[300px] items-center justify-center text-center">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Fill out the form to see a preview of your vCard
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
