"use client";
import React, { useEffect, useState } from "react";
import "../styles/gradients.css";
import "../styles/feed.css";
import SideBar from "../../components/SideBar";
import Bottomnav from "../../components/Bottomnav";

const Layout = ({ children }) => {
  const [themeColor, setThemeColor] = useState("#ffffff");

  useEffect(() => {
    const isDarkMode = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    setThemeColor(isDarkMode ? "#141414" : "#ffffff");

    const handleColorSchemeChange = (event) => {
      setThemeColor(event.matches ? "#141414" : "#ffffff");
    };

    const colorSchemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    colorSchemeQuery.addEventListener("change", handleColorSchemeChange);

    return () => {
      colorSchemeQuery.removeEventListener("change", handleColorSchemeChange);
    };
  }, []);

  useEffect(() => {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    metaThemeColor.setAttribute("content", themeColor);
  }, [themeColor]);

  return (
    <div className="h-dvh w-screen flex items-center font-rethink relative text-black">
      <div className="main tndmain w-screen bg-transparent dark:bg-transparent dark:text-white rounded-2xl lg:mx-4 align-middle max-w-none">
        <div className="flex h-full ">
          <SideBar usage={"feed"} />
          <Bottomnav />
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
