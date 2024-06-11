import { version } from "os";
import React from "react";

const ReleaseNotes = () => {
  const releaseNotes = [
    {
      version: "v0.85",
      descriptions: [
        "Added Dynamic Theming of Meta Tag",
        "Improved Smoothness",
        "New UI",
      ],
      commit: "TBD",
      date: "2024-06-11",
    },
    {
      version: "v0.83",
      descriptions: [
        "-> All new UI Design",
        "New Android Options Menu in Share (Beta)",
      ],
      commit: "TBD",
      date: "2024-06-09",
    },
    {
      version: "v0.81",
      descriptions: [
        "Added Media Viewer Component",
        "Added Download option for Media Files",
        "Fixed Chat UI Bugs",
      ],
      commit: "TBD",
      date: "2024-06-06",
    },
    {
      version: "v0.78",
      descriptions: [
        " Added Reels Comment",
        "Reels Share Menu",
        "Mesage Post Bug Fixed",
      ],
      commit: "7c14820",
      date: "2024-06-05",
    },
    {
      version: "v0.76",
      descriptions: ["Added Tagged Users in Posts", "Added Chat Themes"],
      commit: "e3cdd58",
      date: "2024-04-17",
    },
    {
      version: "v0.72",
      descriptions: [
        "Migrated to Zustand Metadata Global Store for reduction in API Calls to backend",
        "Bug Fixes",
        " Added Last Seen in Chat",
      ],
      commit: "e3cdd58",
      date: "2024-04-05",
    },
    {
      version: "v0.71",
      descriptions: ["Added REport functionality into post cards"],
      commit: "ayon380",
      date: "2024-04-04",
    },
    {
      version: "v0.70",
      descriptions: ["Fixed Nodemailer password"],
      commit: "ayon380",
      date: "2024-04-04",
    },
    {
      version: "v0.69",
      descriptions: ["Added Initaial user REport", "Fixed NodeMailer"],
      commit: "ayon380",
      date: "2024-04-04",
    },
    {
      version: "v0.68",
      descriptions: ["Fixed Vulnerability"],
      commit: "ayon380",
      date: "2024-04-02",
    },
    {
      version: "v0.67",
      descriptions: ["Fixed Vulnerability"],
      commit: "ayon380",
      date: "2024-04-01",
    },
    {
      version: "v0.66",
      commit: "ayon380",
      descriptions: ["Bug Fixes"],
      date: "2024-03-31",
    },
    {
      version: "v0.65",
      descriptions: ["Bug Fixes"],
      commit: "ayon380",
      date: "2024-03-31",
    },
    {
      version: "v0.64",
      descriptions: ["Added Saved Posts"],
      commit: "ayon380",
      date: "2024-03-27",
    },
    {
      version: "v0.6",
      descriptions: [
        "added Following Follower Pages",
        "Added REply",
        "Added Groups Info",
      ],
      commit: "ayon380",
      date: "2024-03-22",
    },
    {
      version: "v0.62",
      descriptions: ["Added Landing Page"],
      commit: "ayon380",
      date: "2024-03-22",
    },
    {
      version: "v0.61",
      descriptions: ["Added Explore", "Landing Page"],
      commit: "e3cdd58",
      date: "2024-03-19",
    },
    {
      version: "v0.60",
      descriptions: ["-> Added Edit and Delete Posts", "Bug Fixes"],
      commit: "e3cdd58",
      date: "2024-03-15",
    },
    {
      version: "v0.59",
      descriptions: ["-> Optimized Profile Pages", "Bug Fixes"],
      commit: "1246669",
      date: "2024-03-15",
    },
    {
      version: "v0.58",
      descriptions: ["->Redesigned Comments Posts for Mobile"],
      commit: "78f1c39",
      date: "2024-03-14",
    },
    {
      version: "v0.57",
      descriptions: [
        "Redesinged Messaging UI",
        "Bug Fixes",
        "Added Release Notes",
      ],
      commit: "2b82121",
      date: "2024-03-14",
    },
    {
      version: "v0.56",
      descriptions: ["-> Added Messaging Phone Support"],
      commit: "05fd762",
      date: "2024-03-13",
    },
    {
      version: "v0.55",
      descriptions: ["-> Added initial Mobile View"],
      commit: "51144d3",
      date: "2024-03-13",
    },
    {
      version: "v0.54",
      descriptions: ["Added BottomNav", "Added Zustand", "Bug Fixes"],
      commit: "855c48e",
      date: "2024-03-13",
    },
    {
      version: "v0.53",
      descriptions: ["Added ANimations", "Added Restrict Account"],
      commit: "ef86b4d",
      date: "2024-03-11",
    },
    {
      version: "v0.52",
      descriptions: [
        "Redesigned Profile Pages",
        "Added Media Support in Chats",
      ],
      commit: "c2c0f0a",
      date: "2024-03-09",
    },
    {
      version: "v0.51",
      descriptions: ["Addedd Reel Pagination"],
      commit: "1fe023a",
      date: "2024-03-09",
    },
    {
      version: "v0.50",
      descriptions: ["Added Comment Section", "Added Reply Section"],
      commit: "17cae47",
      date: "2024-03-08",
    },
    {
      version: "v0.48",
      descriptions: ["Some UI Enhancements", "Comments Refreshing Fixed"],
      commit: "95eda33",
      date: "2024-03-08",
    },
    {
      version: "v0.47",
      descriptions: ["Added Notifications Support"],
      commit: "0e6402e",
      date: "2024-03-02",
    },
    {
      version: "v0.46",
      descriptions: ["Changes Start URL"],
      commit: "7645929",
      date: "2024-02-29",
    },
    {
      version: "v0.45",
      descriptions: ["Changed display mode to fullscreen"],
      commit: "06ae3e7",
      date: "2024-02-29",
    },
    {
      version: "v0.44",
      descriptions: ["Fixed Icons"],
      commit: "769a57f",
      date: "2024-02-29",
    },
    {
      version: "v0.43",
      descriptions: ["Added PWA Support", "Improved SEO"],
      commit: "e10bc72",
      date: "2024-02-29",
    },
    {
      version: "v0.42",
      descriptions: [],
      commit: "bbcf025",
      date: "2024-02-29",
    },
    {
      version: "v0.41",
      descriptions: ["Added Background images"],
      commit: "792df0c",
      date: "2024-02-29",
    },
    {
      version: "v0.4",
      descriptions: ["Fixed Import error"],
      commit: "d5babf6",
      date: "2024-02-29",
    },
    {
      version: "v0.35",
      descriptions: ["Added Reels"],
      commit: "e11009c",
      date: "2024-02-29",
    },
    {
      version: "v0.34",
      descriptions: ["Fixed Messaging Bug"],
      commit: "cb53331",
      date: "2024-02-26",
    },
    {
      version: "v0.33",
      descriptions: ["Fixed API Bug"],
      commit: "7c9cdcf",
      date: "2024-02-25",
    },
    {
      version: "v0.32",
      descriptions: [
        "Added intial Reel, Feeds APIS",
        "Added Upload Reel Component",
        "Fixed Some Bugs",
      ],
      commit: "1ab2aad",
      date: "2024-02-25",
    },
    {
      version: "v0.31",
      descriptions: ["Added Posts", "Fixed SideBar'", "Bug Fixes"],
      commit: "19231be",
      date: "2024-02-22",
    },
    {
      version: "v0.31",
      descriptions: ["Fixed Group Chats"],
      commit: "e2b1453",
      date: "2024-02-20",
    },
    {
      version: "v0.3",
      descriptions: ["Refactored Full Repo to uid"],
      commit: "df2329f",
      date: "2024-02-20",
    },
    {
      version: "v0.29",
      descriptions: ["Added Terms and Conditions", "Added Settings"],
      commit: "175dad9",
      date: "2024-02-18",
    },
    {
      version: "v0.28",
      descriptions: ["Added Speed Insights"],
      commit: "5a913a5",
      date: "2024-02-17",
    },
    {
      version: "v0.27",
      descriptions: ["Messaging Bug Fixes"],
      commit: "345f922",
      date: "2024-02-17",
    },
    {
      version: "v0.26",
      descriptions: ["Added Group Chats", "Migrated to Chats from following"],
      commit: "272acff",
      date: "2024-02-17",
    },
    {
      version: "v0.25",
      descriptions: ["Added Copy Delete", "Added Read Receipts"],
      commit: "1b395e8",
      date: "2024-02-15",
    },
    {
      version: "v0.24",
      descriptions: ["Removed Message Limit"],
      commit: "0cfe124",
      date: "2024-02-15",
    },
    {
      version: "v0.23",
      descriptions: ["Added Logout", "Added Messaging UI"],
      commit: "a9046f9",
      date: "2024-02-15",
    },
    {
      version: "v0.22",
      descriptions: ["added messaging"],
      commit: "1341ca4",
      date: "2024-02-13",
    },
    {
      version: "v0.21",
      descriptions: ["Fixed Key Prop"],
      commit: "a1c3e86",
      date: "2024-02-13",
    },
    {
      version: "v0.2",
      descriptions: ["Added MessageRooms", "Bug Fixes"],
      commit: "19e62c2",
      date: "2024-02-13",
    },
    {
      version: "0.19",
      descriptions: ["Added New UI"],
      commit: "c34d401",
      date: "2024-02-10",
    },
    {
      version: "v0.171",
      descriptions: ["Added Mete ThemeColor Tag"],
      commit: "92889db",
      date: "2024-02-10",
    },
    {
      version: "v0.18",
      descriptions: ["Added Comments to Post"],
      commit: "7d38cd9",
      date: "2024-02-10",
    },
    {
      version: "v0.17",
      descriptions: [
        "Added Follow Buttons",
        "Added Like buttons",
        "Bug Fixes and improvements",
      ],
      commit: "44999a6",
      date: "2024-02-07",
    },
    {
      version: "v0.16",
      descriptions: ["Video Fixed", "Added Date Function"],
      commit: "e3cdd58",
      date: "2024-02-04",
    },
    {
      version: "v0.151",
      descriptions: [],
      commit: "f61d678",
      date: "2024-02-01",
    },
    {
      version: "v0.15",
      descriptions: ["Added FeedPost", "Added Url Users"],
      commit: "e56bd3c",
      date: "2024-02-01",
    },
    {
      version: "v0.14",
      descriptions: [],
      commit: "01aafaf",
      date: "2024-02-01",
    },
    {
      version: "v0.13",
      descriptions: ["added favicon", "fixed firebase authorized domains"],
      commit: "f833fda",
      date: "2024-01-27",
    },
    {
      version: "v0.21",
      descriptions: [],
      commit: "bcfa5ef",
      date: "2024-01-26",
    },
    {
      version: "v0.2",
      descriptions: [],
      commit: "a64d622",
      date: "2024-01-26",
    },
    {
      version: "v0.2",
      descriptions: [],
      commit: "ce33e92",
      date: "2024-01-02",
    },
    {
      version: "v0.1",
      descriptions: ["Initial Commit", "Added Login", "Signup"],
      commit: "3aa67b9",
      date: "2023-12-30",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 to-purple-600 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-8xl font-bold font-lucy mb-2">Muse</h1>
          <h2 className="text-3xl font-semibold">Release Notes</h2>
        </div>
        <div className="max-w-4xl mx-auto">
          <ul className="divide-y divide-purple-300">
            {releaseNotes.map((release, index) => (
              <li key={index} className="py-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-lg font-semibold">{release.version}</div>
                  <div className="text-sm font-medium bg-purple-200 text-purple-800 px-3 py-1 rounded-full">
                    {release.date}
                  </div>
                </div>
                <div className="flex flex-col items-start">
                  {release.descriptions.map((description, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between mb-2 w-full"
                    >
                      <div className="text-gray-300 flex items-center">
                        {description.startsWith("•") ? (
                          <span className="mr-2">•</span>
                        ) : (
                          <span className="mr-2">{"->"}</span>
                        )}
                        {description.startsWith("•")
                          ? description.slice(2)
                          : description}
                      </div>
                      {index === release.descriptions.length - 1 && (
                        <div className="text-sm font-mono bg-purple-800 text-white px-3 py-1 rounded-full">
                          {release.commit}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ReleaseNotes;
