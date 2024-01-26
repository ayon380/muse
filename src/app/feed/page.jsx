"use client";
import app from "@/lib/firebase/firebaseConfig";
import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import "../styles/feed.css";
import Post from "../../components/Post";
import { FaRegHeart } from "react-icons/fa6";
import { FaShare } from "react-icons/fa";
import { MdOutlineReportGmailerrorred } from "react-icons/md";
import { useHorizontalScroll } from "../../externalfn/horizontalscroll";
import Image from "next/image";
import { getFirestore, doc, getDoc } from "firebase/firestore";
// ... (your imports)
const DropdownMenu = ({ onLogout, onSettings }) => {
  return (
    <div className="absolute right-0 mt-16 w-48 bg-white border rounded-md overflow-hidden shadow-md z-10">
      <button
        className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
        onClick={onLogout}
      >
        Logout
      </button>
      <button
        className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
        onClick={onSettings}
      >
        Settings
      </button>
    </div>
  );
};

const Home = () => {
  const scrollRef = useHorizontalScroll();
  const auth = getAuth(app);
  const [user, setUser] = useState(auth.currentUser);
  const router = useRouter();
  const [userdata, setUserData] = useState(null);
  const [stories, setStories] = useState([]);
  const getPixels = require("get-pixels");
  const { extractColors } = require("extract-colors");
  const db = getFirestore(app);
  const [posts, setPosts] = useState([]);
  const post_id = "11sdjf9";
  const [loading, setLoading] = useState(true);
  const [mayfollow, setMayFollow] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [liked, setLiked] = useState([]);
  const testdata = {
    pfp: "",
  };
  const handleProfileClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleSettings = () => {
    // Handle settings action
    router.push("/settings");
    console.log("Navigate to settings or perform other settings action");
    // You can navigate to a settings page or show a modal, etc.
  };
  const getuserdata = async (currentUser) => {
    if (!currentUser) {
      // User is not authenticated
      router.push("/login");
      return;
    }

    const userRef = doc(db, "users", currentUser.email);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      console.log("Document data:", docSnap.data());
      setUserData(docSnap.data());
    } else {
      console.log("No such document!");
      // Handle the case where user data doesn't exist
    }
  };
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        getuserdata(user);
        console.log(user);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const handleLogout = async () => {
    try {
      console.log("logout");
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Sign-out error:", error.message);
    }
  };
  const SharePost = async () => {
    navigator.share({
      title: "Muse",
      text: "Muse",
      url: "https://muse-ten.vercel.app/",
    });
  };
  const ReportPost = async () => {
    router.push(`/report/${post_id}`);
  };
  useEffect(() => {
    const handleGlobalClick = (event) => {
      // Check if the click is outside the dropdown and not on the profile picture
      if (
        showDropdown &&
        event.target.closest(".dropdown-menu") === null &&
        event.target.closest(".profile-picture") === null
      ) {
        setShowDropdown(false);
      }
    };

    // Add the global click event listener
    document.addEventListener("click", handleGlobalClick);

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener("click", handleGlobalClick);
    };
  }, [showDropdown]);

  return (
    <div className="h-screen font-rethink text-black bg-white dark:bg-black dark:text-white">
      <div className="flex justify-between">
        <div className="kl font-lucy text-6xl">Muse</div>
        <Image className="text-white" src={"/icon.png"} width={100} height={100} alt="" />
        <div onClick={handleProfileClick} className="lk">
          {userdata ? (
            <Image
              className="rounded-full h-16 w-16 object-cover cursor-pointer"
              src={userdata.pfp}
              width={100}
              height={100}
              alt="Profile Picture"
            />
          ) : (
            "Loading Image"
          )}
        </div>
        {showDropdown && (
          <DropdownMenu onLogout={handleLogout} onSettings={handleSettings} />
        )}
      </div>
      <div className="stories">
        {/* <div className="h1 italic font-lucy text-4xl">Stories</div> */}
        <div ref={scrollRef} className="flex overflow-x-auto  ">
          {userdata ? (
            <>
              <Image
                className="rounded-full h-16 w-16 object-cover border-green-500 border-2 p-1 m-1 cursor-pointer"
                src={userdata.pfp}
                width={100}
                height={100}
                alt="Profile Picture"
              />
              <Image
                className="rounded-full h-16 w-16 object-cover border-pink-500 border-2 p-1 m-1 cursor-pointer"
                src={userdata.pfp}
                width={100}
                height={100}
                alt="Profile Picture"
              />
              <Image
                className="rounded-full h-16 w-16 object-cover border-green-500 border-2 p-1 m-1 cursor-pointer"
                src={userdata.pfp}
                width={100}
                height={100}
                alt="Profile Picture"
              />
              <Image
                className="rounded-full h-16 w-16 object-cover border-pink-500 border-2 p-1 m-1 cursor-pointer"
                src={userdata.pfp}
                width={100}
                height={100}
                alt="Profile Picture"
              />
              <Image
                className="rounded-full h-16 w-16 object-cover border-green-500 border-2 p-1 m-1 cursor-pointer"
                src={userdata.pfp}
                width={100}
                height={100}
                alt="Profile Picture"
              />
              <Image
                className="rounded-full h-16 w-16 object-cover border-pink-500 border-2 p-1 m-1 cursor-pointer"
                src={userdata.pfp}
                width={100}
                height={100}
                alt="Profile Picture"
              />
              <Image
                className="rounded-full h-16 w-16 object-cover border-green-500 border-2 p-1 m-1 cursor-pointer"
                src={userdata.pfp}
                width={100}
                height={100}
                alt="Profile Picture"
              />
              <Image
                className="rounded-full h-16 w-16 object-cover border-pink-500 border-2 p-1 m-1 cursor-pointer"
                src={userdata.pfp}
                width={100}
                height={100}
                alt="Profile Picture"
              />
              <Image
                className="rounded-full h-16 w-16 object-cover border-green-500 border-2 p-1 m-1 cursor-pointer"
                src={userdata.pfp}
                width={100}
                height={100}
                alt="Profile Picture"
              />
              <Image
                className="rounded-full h-16 w-16 object-cover border-pink-500 border-2 p-1 m-1 cursor-pointer"
                src={userdata.pfp}
                width={100}
                height={100}
                alt="Profile Picture"
              />
              <Image
                className="rounded-full h-16 w-16 object-cover border-green-500 border-2 p-1 m-1 cursor-pointer"
                src={userdata.pfp}
                width={100}
                height={100}
                alt="Profile Picture"
              />
              <Image
                className="rounded-full h-16 w-16 object-cover border-pink-500 border-2 p-1 m-1 cursor-pointer"
                src={userdata.pfp}
                width={100}
                height={100}
                alt="Profile Picture"
              />
              <Image
                className="rounded-full h-16 w-16 object-cover border-green-500 border-2 p-1 m-1 cursor-pointer"
                src={userdata.pfp}
                width={100}
                height={100}
                alt="Profile Picture"
              />
              <Image
                className="rounded-full h-16 w-16 object-cover border-pink-500 border-2 p-1 m-1 cursor-pointer"
                src={userdata.pfp}
                width={100}
                height={100}
                alt="Profile Picture"
              />
              <Image
                className="rounded-full h-16 w-16 object-cover border-green-500 border-2 p-1 m-1 cursor-pointer"
                src={userdata.pfp}
                width={100}
                height={100}
                alt="Profile Picture"
              />
              <Image
                className="rounded-full h-16 w-16 object-cover border-pink-500 border-2 p-1 m-1 cursor-pointer"
                src={userdata.pfp}
                width={100}
                height={100}
                alt="Profile Picture"
              />
              <Image
                className="rounded-full h-16 w-16 object-cover border-pink-500 border-2 p-1 m-1 cursor-pointer"
                src={userdata.pfp}
                width={100}
                height={100}
                alt="Profile Picture"
              />
              <Image
                className="rounded-full h-16 w-16 object-cover border-pink-500 border-2 p-1 m-1 cursor-pointer"
                src={userdata.pfp}
                width={100}
                height={100}
                alt="Profile Picture"
              />
              <Image
                className="rounded-full h-16 w-16 object-cover border-pink-500 border-2 p-1 m-1 cursor-pointer"
                src={userdata.pfp}
                width={100}
                height={100}
                alt="Profile Picture"
              />
              <Image
                className="rounded-full h-16 w-16 object-cover border-pink-500 border-2 p-1 m-1 cursor-pointer"
                src={userdata.pfp}
                width={100}
                height={100}
                alt="Profile Picture"
              />
              <Image
                className="rounded-full h-16 w-16 object-cover border-pink-500 border-2 p-1 m-1 cursor-pointer"
                src={userdata.pfp}
                width={100}
                height={100}
                alt="Profile Picture"
              />
            </>
          ) : null}
        </div>
      </div>
      <div className="content flex justify-center">
        <div className="posts max-w-4xl">
          {userdata ? <Post userdata={userdata} /> : null}
        </div>
      </div>
    </div>
  );
};

export default Home;
