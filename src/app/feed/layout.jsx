// Layout.js
import React from "react";
import "../styles/gradients.css";
import "../styles/feed.css";
// import ConstantComponent from './ConstantComponent';
import SideBar from "../../components/SideBar";

const Layout = ({ children }) => {
  return (
    <div className="h-screen w-screen flex items-center font-rethink relative text-black ">
      <div className="main tndmain  bg-white dark:bg-black dark:text-white rounded-2xl bg-clip-padding backdrop-filter backdrop-blur-2xl bg-opacity-20 shadow-2xl border-1 border-black mx-4 align-middle ">
        <div className="flex">
          <SideBar usage={"feed"} />
          {children} {/* Main content of the pages */}
        </div>
      </div>
    </div>
  );
};

export default Layout;
