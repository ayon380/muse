"use client";
import app from "@/lib/firebase/firebaseConfig";
import React, { use, useEffect, useState } from "react";
import {
  deleteUser,
  getAuth,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import "../styles/gradients.css";
import "../styles/feed.css";
import Post from "../../components/Post";
import { deleteDoc } from "firebase/firestore";
import { getStorage, deleteObject } from "firebase/storage";
import { useHorizontalScroll } from "../../externalfn/horizontalscroll";
import Image from "next/image";
import { ref } from "firebase/storage";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import dynamic from "next/dynamic";
import toast, { Toaster } from "react-hot-toast";

const CreatePost = dynamic(() => import("../../components/Createpost"));
const Home = () => {
  const auth = getAuth(app);
  const [user, setUser] = useState(auth.currentUser);
  const storage = getStorage(app);
  const [createpostmenu, setcreatepostmenu] = useState(false);
  const router = useRouter();
  const [userdata, setUserData] = useState(null);
  const db = getFirestore(app);
  const [searchtext, setSearchtext] = useState("");
  const getuserdata = async (currentUser) => {
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
  const handleCreatePost = () => {
    setcreatepostmenu(!createpostmenu);
  };
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        // Redirect to login screen if user is not logged in
        router.push("/login");
      } else {
        getuserdata(user);
      }
    });

    return () => unsubscribe();
  }, [auth, router]);
  return (
    <div className="w-full">
      {userdata && (
        <div>
          <div className="main2 rounded-2xl bg-opacity-20  bg-gray-800 shadow-2xl  ">
            <div className="flex ">
              <div className="search ml-5 mt-5">
                <input
                  className="w-96 h-12 text-2xl p-2  placeholder-italic  rounded-2xl bg-gray-300 border-black transition-all duration-300 outline-none shadow-2xl hover:shadow-3xl focus:shadow-3xl  hover:bg-gray-400 focus:bg-gray-400"
                  type="text"
                  value={searchtext}
                  onChange={(e) => setSearchtext(e.target.value)}
                  placeholder="Search"
                  // Add hover and focus styles
                  style={{
                    // Initial styles
                    background: "rgba(192,192,192,0.5)", // Initial background color with opacity
                    // Hover styles
                    ":hover": {
                      transform: "scale(1.2)", // Scale up on hover
                      background: "rgba(192,192,192,0.7)", // Lighter background on hover
                    },
                    // Focus styles
                    ":focus": {
                      background: "rgba(192,192,192,0.8)", // Deeper background color when selected
                      outline: "none", // Remove outline when selected
                    },
                  }}
                />
                <div className="stories mt-4">
                  <div className="je font-lucy text-5xl">Stories</div>
                  <div className="fp flex mt-2 overflow-x-auto">
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
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
