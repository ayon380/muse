// Layout.js
"use client"
import React from "react";
import "../styles/gradients.css";
import "../styles/feed.css";
import SideBar from "../../components/SideBar";
// import UpdateLS from "../../components/UpdateLS";
import Bottomnav from "../../components/Bottomnav";
const Layout = ({ children }) => {
  // Initialize Sidebaropen state at the parent leve
  return (
    <div className="h-dvh w-screen flex items-center font-rethink relative text-black">
      <div className="main tndmain w-screen bg-transparent dark:bg-transparent dark:text-white rounded-2xl lg:mx-4 align-middle max-w-none">
        <div className="flex h-full ">
          {/* <UpdateLS /> */}
          <SideBar usage={"feed"} />
          <Bottomnav />
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
