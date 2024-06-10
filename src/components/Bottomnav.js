"use client";
import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSidebarStore } from "@/app/store/zustand";

const navItems = [
  {
    icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z",
    label: "Feed",
    href: "/feed",
  },
  {
    icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
    label: "Explore",
    href: "/feed/explore",
  },
  {
    icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z",
    label: "Reels",
    href: "/feed/reels",
  },
  {
    icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
    label: "Messages",
    href: "/feed/messages",
  },
  {
    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
    label: "Settings",
    href: "/feed/settings",
  },
];

const BottomNav = () => {
  const [isMobile, setIsMobile] = React.useState(false);
  const { chatopen, setchatopen } = useSidebarStore();
  const router = useRouter();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768 && !chatopen);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [chatopen]);

  const currentRoute = usePathname();
  console.log(currentRoute);
  return (
    <nav
      className={`${
        isMobile ? "fixed" : "hidden"
      } bottom-0 left-0 right-0 bg-white dark:bg-feedheader rounded-t-3xl shadow-lg z-40`}
    >
      <div className="max-w-lg mx-auto">
        <div className="flex justify-between items-center px-6 py-3">
          {navItems.map((item) => {
            const isActive = currentRoute === item.href;
            return (
              <button
                key={item.label}
                onClick={() => {
                  router.push(item.href);
                }}
                className={`flex flex-col items-center space-y-1 group focus:outline-none ${
                  isActive ? "text-fuchsia-400 dark:text-fuchsia-500" : ""
                }`}
                aria-label={item.label}
              >
                <div
                  className={`p-2 rounded-full bg-transparent ${
                    isActive
                      ? "bg-fuchsia-100 dark:bg-fuchsia-900"
                      : "group-hover:bg-gray-100 dark:group-hover:bg-gray-800"
                  } transition duration-200`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-6 w-6 transition duration-200 ${
                      isActive
                        ? "text-fuchsia-400 dark:text-fuchsia-500"
                        : "text-gray-500 dark:text-gray-400 group-hover:text-fuchsia-400 dark:group-hover:text-fuchsia-500"
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={item.icon}
                    />
                  </svg>
                </div>
                <span
                  className={`text-xs font-medium transition duration-200 ${
                    isActive
                      ? "text-fuchsia-400 dark:text-fuchsia-500"
                      : "text-gray-500 dark:text-gray-400 group-hover:text-fuchsia-400 dark:group-hover:text-fuchsia-500"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
