import React from "react";
import Image from "next/image";
import SparklesText from "./SparkleText";

const MainLoading = () => {
  return (
    <div className="w-screen mainloading bg-white dark:bg-black h-screen fixed top-0 left-0 flex flex-col items-center justify-center mainloading text-white z-50">
      <div className="flex flex-col items-center mb-12">
        <SparklesText text="Muse" textSize="text-7xl" />
      </div>
      <div className="fixed bottom-4 text-black dark:text-white text md:text-base opacity-80">
        NoFilter LLC{" "}
        <span className="opacity-75 font-bold">
          v{process.env.NEXT_PUBLIC_VERSION}{" "}
        </span>
      </div>
      <h1 className="bg-gradient-to-r from-purple-500 via-fuchsia-400 to-pink-400 text-xl inline-block text-transparent bg-clip-text">
        Beta Release
      </h1>
    </div>
  );
};

export default MainLoading;
