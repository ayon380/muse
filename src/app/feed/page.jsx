"use client";
import app from "@/lib/firebase/firebaseConfig";
import React, { useEffect, useState } from "react";
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
  const scrollRef = useHorizontalScroll();
  const auth = getAuth(app);
  const [user, setUser] = useState(auth.currentUser);
  const storage = getStorage(app);
  const [createpostmenu, setcreatepostmenu] = useState(false);
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
      if (!user) {
        // Redirect to login screen if user is not logged in
        router.push("/login");
      } else {
        getuserdata(user);
      }
    });

    return () => unsubscribe();
  }, [auth, router]);

  const handleLogout = async () => {
    try {
      console.log("logout");
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Sign-out error:", error.message);
    }
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
  // useEffect(() => {
  //   if (!user) router.push("/login");
  // }, [user]);
  const handleCreatePost = () => {
    setcreatepostmenu(!createpostmenu);
  };

  const deleteacc = async () => {
    try {
      console.log("delete");
      // Delete user data from Firestore
      const userdocref = doc(db, "users", user.email);
      const emailuserref = doc(db, "username", userdata.userName);
      await deleteDoc(userdocref);
      await deleteDoc(emailuserref);

      // Delete user images from Firebase Storage
      const imagesref = ref(storage, "images/", userdata.userName);
      console.log(imagesref);
      await deleteObject(imagesref);

      // Delete the user account
      await deleteUser(auth.currentUser);
      for (let i = 0; i < userdata.posts.length; i++) {
        const postref = doc(db, "posts", userdata.posts[i]);
        await deleteDoc(postref);
      }
      // Route the user to the home page
      router.push("/");
    } catch (error) {
      toast.error("Delete account error:", error.message);
    }
  };

  // const DropdownMenu = ({ onLogout, onSettings }) => {
  //   return (
  //     <div className="absolute right-0 mt-16 w-48 bg-white border rounded-md overflow-hidden shadow-md z-10">
  //       <button
  //         className="block text-center w-full px-4 py-2  text-sm text-gray-700 hover:bg-gray-100"
  //         onClick={() => {
  //           router.push(`/${userdata.userName}`);
  //         }}
  //       >
  //         My Profile
  //       </button>
  //       <button
  //         className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
  //         onClick={onLogout}
  //       >
  //         Logout
  //       </button>
  //       <button
  //         className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
  //         onClick={deleteacc}
  //       >
  //         Delete Account
  //       </button>
  //       <button
  //         className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
  //         onClick={onSettings}
  //       >
  //         Settings
  //       </button>
  //     </div>
  //   );
  // };
  // {createpostmenu ? (
  //   <>
  //     <div
  //       className="fixed inset-0 bg-black opacity-50 z-10"
  //       onClick={() => setcreatepostmenu(false)}
  //     ></div>
  //     <div className="absolute inset-0 flex items-center justify-center z-20">
  //       <div className="bg-gray-900 createpostcanvas relative z-10">
  //         <CreatePost
  //           onClose={() => setcreatepostmenu(false)}
  //           userdata={userdata}
  //         />
  //       </div>
  //     </div>
  //   </>
  // ) : null}
  // <div className="flex justify-between">
  //   <div className="kl font-lucy text-6xl">Muse</div>
  //   <div className="io flex">
  //     <div
  //       className="createpost h-16 w-16 cursor-pointer"
  //       onClick={() => handleCreatePost()}
  //     >
  //       <Image
  //         className="text-white"
  //         src={"/icon.png"}
  //         width={100}
  //         height={100}
  //         alt=""
  //       />
  //     </div>
  //     <div onClick={handleProfileClick} className="lk">
  //       {userdata ? (
  //         <Image
  //           className="rounded-full h-16 w-16 object-cover cursor-pointer"
  //           src={userdata.pfp}
  //           width={100}
  //           height={100}
  //           alt="Profile Picture"
  //         />
  //       ) : (
  //         "Loading Image"
  //       )}
  //     </div>
  //     {showDropdown && (
  //       <DropdownMenu onLogout={handleLogout} onSettings={handleSettings} />
  //     )}
  //   </div>
  // </div>
  // <div className="stories">
  //   {/* <div className="h1 italic font-lucy text-4xl">Stories</div> */}
  //   <div ref={scrollRef} className="flex overflow-x-auto  ">
  //     {userdata ? (
  //       <>
  //         <Image
  //           className="rounded-full h-16 w-16 object-cover border-green-500 border-2 p-1 m-1 cursor-pointer"
  //           src={userdata.pfp}
  //           width={100}
  //           height={100}
  //           alt="Profile Picture"
  //         />
  //         <Image
  //           className="rounded-full h-16 w-16 object-cover border-pink-500 border-2 p-1 m-1 cursor-pointer"
  //           src={userdata.pfp}
  //           width={100}
  //           height={100}
  //           alt="Profile Picture"
  //         />
  //         <Image
  //           className="rounded-full h-16 w-16 object-cover border-green-500 border-2 p-1 m-1 cursor-pointer"
  //           src={userdata.pfp}
  //           width={100}
  //           height={100}
  //           alt="Profile Picture"
  //         />
  //         <Image
  //           className="rounded-full h-16 w-16 object-cover border-pink-500 border-2 p-1 m-1 cursor-pointer"
  //           src={userdata.pfp}
  //           width={100}
  //           height={100}
  //           alt="Profile Picture"
  //         />
  //         <Image
  //           className="rounded-full h-16 w-16 object-cover border-green-500 border-2 p-1 m-1 cursor-pointer"
  //           src={userdata.pfp}
  //           width={100}
  //           height={100}
  //           alt="Profile Picture"
  //         />
  //         <Image
  //           className="rounded-full h-16 w-16 object-cover border-pink-500 border-2 p-1 m-1 cursor-pointer"
  //           src={userdata.pfp}
  //           width={100}
  //           height={100}
  //           alt="Profile Picture"
  //         />
  //         <Image
  //           className="rounded-full h-16 w-16 object-cover border-green-500 border-2 p-1 m-1 cursor-pointer"
  //           src={userdata.pfp}
  //           width={100}
  //           height={100}
  //           alt="Profile Picture"
  //         />
  //         <Image
  //           className="rounded-full h-16 w-16 object-cover border-pink-500 border-2 p-1 m-1 cursor-pointer"
  //           src={userdata.pfp}
  //           width={100}
  //           height={100}
  //           alt="Profile Picture"
  //         />
  //         <Image
  //           className="rounded-full h-16 w-16 object-cover border-green-500 border-2 p-1 m-1 cursor-pointer"
  //           src={userdata.pfp}
  //           width={100}
  //           height={100}
  //           alt="Profile Picture"
  //         />
  //         <Image
  //           className="rounded-full h-16 w-16 object-cover border-pink-500 border-2 p-1 m-1 cursor-pointer"
  //           src={userdata.pfp}
  //           width={100}
  //           height={100}
  //           alt="Profile Picture"
  //         />
  //         <Image
  //           className="rounded-full h-16 w-16 object-cover border-green-500 border-2 p-1 m-1 cursor-pointer"
  //           src={userdata.pfp}
  //           width={100}
  //           height={100}
  //           alt="Profile Picture"
  //         />
  //         <Image
  //           className="rounded-full h-16 w-16 object-cover border-pink-500 border-2 p-1 m-1 cursor-pointer"
  //           src={userdata.pfp}
  //           width={100}
  //           height={100}
  //           alt="Profile Picture"
  //         />
  //         <Image
  //           className="rounded-full h-16 w-16 object-cover border-green-500 border-2 p-1 m-1 cursor-pointer"
  //           src={userdata.pfp}
  //           width={100}
  //           height={100}
  //           alt="Profile Picture"
  //         />
  //         <Image
  //           className="rounded-full h-16 w-16 object-cover border-pink-500 border-2 p-1 m-1 cursor-pointer"
  //           src={userdata.pfp}
  //           width={100}
  //           height={100}
  //           alt="Profile Picture"
  //         />
  //         <Image
  //           className="rounded-full h-16 w-16 object-cover border-green-500 border-2 p-1 m-1 cursor-pointer"
  //           src={userdata.pfp}
  //           width={100}
  //           height={100}
  //           alt="Profile Picture"
  //         />
  //         <Image
  //           className="rounded-full h-16 w-16 object-cover border-pink-500 border-2 p-1 m-1 cursor-pointer"
  //           src={userdata.pfp}
  //           width={100}
  //           height={100}
  //           alt="Profile Picture"
  //         />
  //         <Image
  //           className="rounded-full h-16 w-16 object-cover border-pink-500 border-2 p-1 m-1 cursor-pointer"
  //           src={userdata.pfp}
  //           width={100}
  //           height={100}
  //           alt="Profile Picture"
  //         />
  //         <Image
  //           className="rounded-full h-16 w-16 object-cover border-pink-500 border-2 p-1 m-1 cursor-pointer"
  //           src={userdata.pfp}
  //           width={100}
  //           height={100}
  //           alt="Profile Picture"
  //         />
  //         <Image
  //           className="rounded-full h-16 w-16 object-cover border-pink-500 border-2 p-1 m-1 cursor-pointer"
  //           src={userdata.pfp}
  //           width={100}
  //           height={100}
  //           alt="Profile Picture"
  //         />
  //         <Image
  //           className="rounded-full h-16 w-16 object-cover border-pink-500 border-2 p-1 m-1 cursor-pointer"
  //           src={userdata.pfp}
  //           width={100}
  //           height={100}
  //           alt="Profile Picture"
  //         />
  //         <Image
  //           className="rounded-full h-16 w-16 object-cover border-pink-500 border-2 p-1 m-1 cursor-pointer"
  //           src={userdata.pfp}
  //           width={100}
  //           height={100}
  //           alt="Profile Picture"
  //         />
  //       </>
  //     ) : null}
  //   </div>
  // </div>
  // <div className="content flex justify-center">
  //   <div className="posts max-w-4xl">
  //     {userdata ? <Post userdata={userdata} /> : null}
  //   </div>
  // </div>}
  return (
    <div className="h-screen flex items-center font-rethink relative text-black ">
      <Toaster />
      {userdata && (
        <div className="main  tndmain w-full bg-white rounded-2xl bg-clip-padding backdrop-filter backdrop-blur-3xl bg-opacity-40 shadow-2xl border-1 border-black mx-4 align-middle ">
          <div className="flex">
            <div className="main1 w-1/4">
              <div className="text-8xl font-lucy text-center mt-4 text-black">
                Muse
              </div>
              <div className="flex justify-center">
                <div className="pfp my-4 ">
                  <Image
                    className="rounded-full h-24 object-cover w-24"
                    src={userdata.pfp}
                    width={100}
                    height={100}
                    alt=""
                  />
                </div>
              </div>
              <div className="usernamw text-center font-bold text-2xl">
                {userdata.userName}
              </div>
              <div className="bio text-center opacity-80">{userdata.bio}</div>
              <div className="flex justify-around ml-2">
                <div className="followers text-center w-16">
                  <div className="text-2xl font-bold">
                    {userdata.followers.length}
                  </div>
                  <div className="text-sm">Followers</div>
                </div>
                <div className="following text-center w-16 ">
                  <div className="text-2xl font-bold">
                    {userdata.following.length}
                  </div>
                  <div className="text-sm ">Following</div>
                </div>
                <div className="posts">
                  <div className="text-2xl font-bold w-16">
                    {userdata.posts.length}
                  </div>
                  <div className="text-sm -ml-2">Posts</div>
                </div>
              </div>
              <div className="options">
                <div className="explore">
                  <div className="text-2xl font-bold text-center">Explore</div>
                </div>
                <div className="settings">
                  <div className="text-2xl font-bold text-center">Settings</div>
                </div>
                <div></div>
              </div>
            </div>
            <div className="main2 rounded-2xl  w-4/5 bg-gray-700  backdrop-blur-3xl shadow-xl opacity-25">
              sadasd
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
