// Layout.js
import React from "react";
import "../styles/gradients.css";
import "../styles/feed.css";
// import ConstantComponent from './ConstantComponent';
import SideBar from "../../components/SideBar";

const Layout = ({ children }) => {
  return (
    <div className="h-screen w-screen flex items-center font-rethink relative text-black ">
      <div className="main tndmain w-screen  bg-transparent dark:bg-transparent dark:text-white rounded-2xl mx-4 align-middle max-w-none">
        <div className="flex h-full">
          <SideBar usage={"feed"} />
          {children} {/* Main content of the pages */}
        </div>
      </div>
    </div>
  );
};

export default Layout;
