"use client";

import { useEffect, useState } from "react";

interface VCard {
  id: string;
  name: string;
  position: string | null;
  company: string | null;
  phone: string;
  email: string;
  website: string | null;
  bio: string | null;
  profileImageUrl: string | null;
  address: string | null;
  template: string | null;
  socialLinks: {
    id: string;
    platform: string;
    url: string;
  }[];
}

interface VCardPageProps {
  vCard: VCard;
}

export default function VCardClientPage({ vCard }: VCardPageProps) {
  console.log(vCard); // Debugging: Check the vCard data
  const [selectedTemplate, setSelectedTemplate] = useState(
    vCard.template || "template1"
  );

  useEffect(() => {
    const updateScanLog = async () => {
      try {
        const deviceType = getDeviceType();
        await fetch(`/api/scan-log`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            vCardId: vCard.id,
            scanType: "QR",
            deviceType: deviceType,
          }),
        });
      } catch (error) {
        console.error("Failed to update scan log:", error);
      }
    };

    updateScanLog();

    function getDeviceType() {
      const width = window.innerWidth;
      if (width < 768) {
        return "Mobile";
      } else if (width < 1024) {
        return "Tablet";
      } else {
        return "Desktop";
      }
    }
  }, [vCard.id]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-lg bg-white shadow-lg">
        {/* Template Selection */}
        <div className="p-4 border-b">
          <label
            htmlFor="template-select"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Select Template
          </label>
          <select
            id="template-select"
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="template1">Classic Blue</option>
            <option value="template2">Curved Blue</option>
            {/* Add more templates as needed */}
          </select>
        </div>

        {/* Render Selected Template */}
        {selectedTemplate === "template1" && (
          <div className="flex flex-col">
            <div className="bg-[#4285F4] p-6 text-white text-center">
              {vCard.profileImageUrl ? (
                <div className="mx-auto h-24 w-24 overflow-hidden rounded-full border-4 border-white mb-4">
                  <img
                    src={vCard.profileImageUrl || "/placeholder.svg"}
                    alt={vCard.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-white mb-4">
                  <span className="text-3xl font-bold text-[#4285F4]">
                    {vCard.name.charAt(0)}
                  </span>
                </div>
              )}
              <h1 className="text-2xl font-bold">{vCard.name}</h1>
              {(vCard.position || vCard.company) && (
                <p className="text-sm">
                  {vCard.position}
                  {vCard.position && vCard.company ? " - " : ""}
                  {vCard.company}
                </p>
              )}
            </div>

            <div className="flex border-b">
              <a
                href={`tel:${vCard.phone}`}
                className="flex-1 p-3 text-center border-r hover:bg-gray-50"
              >
                <span className="block text-xs text-gray-500">Phone</span>
                <span className="font-medium">Call</span>
              </a>
              <a
                href={`mailto:${vCard.email}`}
                className="flex-1 p-3 text-center border-r hover:bg-gray-50"
              >
                <span className="block text-xs text-gray-500">Email</span>
                <span className="font-medium">Send</span>
              </a>
              {vCard.website && (
                <a
                  href={vCard.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 p-3 text-center hover:bg-gray-50"
                >
                  <span className="block text-xs text-gray-500">Website</span>
                  <span className="font-medium">Visit</span>
                </a>
              )}
            </div>

            {vCard.bio && (
              <div className="p-4">
                <h2 className="text-sm font-medium text-gray-500 mb-2">
                  About
                </h2>
                <p className="text-sm">{vCard.bio}</p>
              </div>
            )}

            {vCard.socialLinks.length > 0 && (
              <div className="p-4 border-t">
                <h2 className="text-sm font-medium text-gray-500 mb-2">
                  Connect
                </h2>
                <div className="flex flex-wrap gap-2">
                  {vCard.socialLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs"
                    >
                      {link.platform}
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 flex justify-center">
              <button
                onClick={() => {
                  // Create vCard file
                  const vCardData = [
                    "BEGIN:VCARD",
                    "VERSION:3.0",
                    `FN:${vCard.name}`,
                    `TEL:${vCard.phone}`,
                    `EMAIL:${vCard.email}`,
                    vCard.website ? `URL:${vCard.website}` : "",
                    vCard.company ? `ORG:${vCard.company}` : "",
                    vCard.position ? `TITLE:${vCard.position}` : "",
                    vCard.address ? `ADR:;;${vCard.address};;;` : "",
                    "END:VCARD",
                  ].join("\n");

                  const blob = new Blob([vCardData], { type: "text/vcard" });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = `${vCard.name.replace(/\s+/g, "_")}.vcf`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                }}
                className="rounded-full bg-[#4285F4] px-4 py-2 text-sm font-medium text-white hover:bg-[#3367d6]"
              >
                Save to contacts
              </button>
            </div>
          </div>
        )}

        {selectedTemplate === "template2" && (
          <div className="flex flex-col">
            <div className="relative bg-[#4285F4] p-6 pb-16 text-white text-center">
              <h1 className="text-2xl font-bold">{vCard.name}</h1>
              {(vCard.position || vCard.company) && (
                <p className="text-sm">
                  {vCard.position}
                  {vCard.position && vCard.company ? " - " : ""}
                  {vCard.company}
                </p>
              )}
              <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                {vCard.profileImageUrl ? (
                  <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white">
                    <img
                      src={vCard.profileImageUrl || "/placeholder.svg"}
                      alt={vCard.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-white">
                    <span className="text-3xl font-bold text-[#4285F4]">
                      {vCard.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <div className="h-12"></div>
            </div>

            {vCard.bio && (
              <div className="p-4 mt-12">
                <p className="text-center text-sm">{vCard.bio}</p>
              </div>
            )}

            <div className="flex justify-center gap-4 p-4">
              <a
                href={`tel:${vCard.phone}`}
                className="flex h-12 w-12 items-center justify-center rounded-md bg-[#4285F4] text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
              </a>
              <a
                href={`mailto:${vCard.email}`}
                className="flex h-12 w-12 items-center justify-center rounded-md bg-[#4285F4] text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </a>
              {vCard.website && (
                <a
                  href={vCard.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 w-12 items-center justify-center rounded-md bg-[#4285F4] text-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                  </svg>
                </a>
              )}
            </div>

            <div className="p-4 space-y-4">
              <div className="flex items-center gap-4 rounded-md border p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-500"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                <div>
                  <div className="text-xs text-gray-500">
                    Mobile Phone (Work)
                  </div>
                  <div>{vCard.phone}</div>
                </div>
              </div>

              {vCard.socialLinks.length > 0 && (
                <div className="space-y-2">
                  {vCard.socialLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 rounded-md border p-3 hover:bg-gray-50"
                    >
                      <div className="h-6 w-6 flex items-center justify-center rounded-full bg-gray-100">
                        <span className="text-xs uppercase">
                          {link.platform.charAt(0)}
                        </span>
                      </div>
                      <div className="capitalize">{link.platform}</div>
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 flex justify-end">
              <button
                onClick={() => {
                  // Create vCard file
                  const vCardData = [
                    "BEGIN:VCARD",
                    "VERSION:3.0",
                    `FN:${vCard.name}`,
                    `TEL:${vCard.phone}`,
                    `EMAIL:${vCard.email}`,
                    vCard.website ? `URL:${vCard.website}` : "",
                    vCard.company ? `ORG:${vCard.company}` : "",
                    vCard.position ? `TITLE:${vCard.position}` : "",
                    vCard.address ? `ADR:;;${vCard.address};;;` : "",
                    "END:VCARD",
                  ].join("\n");

                  const blob = new Blob([vCardData], { type: "text/vcard" });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = `${vCard.name.replace(/\s+/g, "_")}.vcf`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                }}
                className="rounded-full bg-[#4285F4] px-4 py-2 text-sm font-medium text-white hover:bg-[#3367d6] flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                Save to contacts
              </button>
            </div>
          </div>
        )}

        {/* Add other templates as needed */}
      </div>
    </div>
  );
}
