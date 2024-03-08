// Layout.js

// Layout.js
import React from "react";
import "../styles/gradients.css";
import "../styles/feed.css";
import SideBar from "../../components/SideBar";

const Layout = ({ children }) => {
  // Initialize Sidebaropen state at the parent level
  // const [Sidebaropen, setSidebaropen] = useState(false);

  // useEffect(() => {
  //   // Your other logic here...
  //   // Determine whether Sidebaropen should be true or false based on screen size
  //   const isMobile = window.matchMedia("(max-width: 767px)").matches;
  //   setSidebaropen(!isMobile);
  // }, []);

  return (
    <div className="h-screen w-screen flex items-center font-rethink relative text-black">
      <div className="main tndmain w-screen bg-transparent dark:bg-transparent dark:text-white rounded-2xl mx-4 align-middle max-w-none">
        <div className="flex h-full">
          {/* Pass Sidebaropen to the SideBar component */}
          <SideBar usage={"feed"} />
          {/* Pass Sidebaropen to children components
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child, { Sidebaropen });
            }
            return child;
          })} */}
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
