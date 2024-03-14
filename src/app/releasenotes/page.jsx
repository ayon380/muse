// pages/release-notes.js

import React from "react";

const ReleaseNotes = () => {
  const releaseNotes = [
    {version: "v0.58", description: "->Redesigned Comments Posts for Mobile"},
    { version: "v0.57", description: "Redesinged Messaging UI Bug Fixes Added Release Notes" },
    { version: "v0.56", description: "Added Messaging Phone Support" },
    { version: "v0.55", description: "Added initial Mobile View" },
    {
      version: "v0.54",
      description: "Added BottomNav -> Added Zustand -> Bug Fixes",
    },
    {
      version: "v0.53",
      description: "Added Animations -> Added Restrict Account",
    },
    {
      version: "v0.52",
      description: "Redesigned Profile Pages -> Added Media Support in Chats",
    },
    { version: "v0.51", description: "Added Reel Pagination" },
    {
      version: "v0.50",
      description: "Added Comment Section -> Added Reply Section",
    },
    {
      version: "v0.48",
      description: "Some UI Enhancements -> Comments Refreshing Fixed",
    },
    { version: "v0.47", description: "Added Notifications Support" },
    { version: "v0.46", description: "Changes Start URL" },
    { version: "v0.45", description: "Changed display mode to fullscreen" },
    { version: "v0.44", description: "Fixed Icons" },
    { version: "v0.43", description: "Added PWA Support -> Improved SEO" },
    { version: "v0.42", description: "" }, // Fill in the description if available
    { version: "v0.41", description: "Added Background images" },
    { version: "v0.4", description: "Fixed Import error" },
    { version: "v0.35", description: "Added Reels" },
    { version: "v0.34", description: "Fixed Messaging Bug" },
    { version: "v0.33", description: "Fixed API Bug" },
    {
      version: "v0.32",
      description:
        "Added initial Reel, Feeds APIS -> Added Upload Reel Component -> Fixed Some Bugs",
    },
    {
      version: "v0.31",
      description: "Added Posts -> Fixed SideBar -> Bug Fixes",
    },
    { version: "v0.31", description: "Fixed Group Chats" },
    { version: "v0.3", description: "Refactored Full Repo to uid" },
    {
      version: "v0.29",
      description: "Added Terms and Conditions -> Added Settings",
    },
    { version: "v0.28", description: "Added Speed Insights" },
    { version: "v0.27", description: "Messaging Bug Fixes" },
    {
      version: "v0.26",
      description: "Added Group Chats -> Migrated to Chats from following",
    },
    {
      version: "v0.25",
      description:
        "Added Copy Delete -> Added Rea convert this to jsx next js page of release notes with good ui",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 bg-white w-screen">
      <div className="muse font-lucy text-center  text-8xl">Muse</div>
      <h1 className="text-3xl font-bold mb-4">Release Notes</h1>
      <ul className="divide-y divide-gray-200">
        {releaseNotes.map((release, index) => (
          <li key={index} className="py-4">
            <div className="text-lg font-semibold">{release.version}</div>
            <div className="text-gray-600">{release.description}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ReleaseNotes;
