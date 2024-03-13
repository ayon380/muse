"use client";
import React, { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSidebarStore } from "@/app/store/zustand";
const Bottomnav = () => {
  const [isMobile, setIsMobile] = React.useState(false);
  const {chatopen,setchatopen} = useSidebarStore();
  useEffect(() => {
    console.log(chatopen, "chatopen bottomnav");
    if (window.innerWidth < 768 && !chatopen) {
      setIsMobile(true);
    }
    else{
      setIsMobile(false);
    }
  }, [chatopen]);
  const router = useRouter();
  return (
    <div className="b">
      <div className={`flex ${isMobile ? "absolute" : "hidden"}  bottomnav rounded-t-lg bottom-0 bg-opacity-90 bg-white dark:bg-black z-40 w-full`}>
        <div className="options flex my-5  justify-evenly items-center flex-auto">
          <div className="explore">
            <div
              className="text-2xl text-left dark:invert font-bold transform-gpu hover:scale-110 cursor-pointer"
              onClick={() => router.push("/feed")}
            >
              <Image
                className="h-8 w-8"
                src="/icons/category.png"
                width={100}
                height={100}
                alt=""
              />
            </div>
          </div>
          <div className="explore">
            <div
              className="text-2xl font-bold cursor-pointer transform-gpu hover:scale-110 dark:invert"
              onClick={() => router.push("/feed/explore")}
            >
              <Image
                className="h-8 w-8"
                src="/icons/direction.png"
                width={100}
                height={100}
                alt=""
              />
            </div>
          </div>
          <div className="Reels">
            <div
              className="text-2xl cursor-pointer font-bold transform-gpu hover:scale-110 text-center dark:invert"
              onClick={() => router.push("/feed/reels")}
            >
              <Image
                className="h-8 w-8"
                src="/icons/video.png"
                width={100}
                height={100}
                alt=""
              />
            </div>
          </div>
          <div className="messages">
            <div
              className="text-2xl font-bold text-center transform-gpu hover:scale-110 cursor-pointer dark:invert"
              onClick={() => {
                router.push("/feed/messages");
              }}
            >
              <Image
                className="h-8 w-8"
                src="/icons/conversation.png"
                width={100}
                height={100}
                alt=""
              />
            </div>
          </div>
          <div className="settings cursor-pointer">
            <div
              className="text-2xl font-bold cursor-pointer transform-gpu hover:scale-110 text-center dark:invert"
              onClick={() => router.push("/feed/settings")}
            >
              <Image
                className="h-8 w-8"
                src="/icons/setting.png"
                width={100}
                height={100}
                alt=""
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bottomnav;
