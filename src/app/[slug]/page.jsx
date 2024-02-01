"use client";
import { getAuth, signOut } from "firebase/auth";
import React, { useEffect } from "react";
import app from "@/lib/firebase/firebaseConfig";
import { getFirestore } from "firebase/firestore";
import { doc, getDoc } from "firebase/firestore";
// import { get } from "http";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
const Page = ({ params }) => {
  const { slug } = params;
  const [userdata, setUserData] = React.useState(null);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [currentuserdata, setCurrentUserData] = React.useState(null);
  const auth = getAuth(app);
  const user = auth.currentUser;
  const db = getFirestore(app);
  const router = useRouter();
  console.log(user);
  const emaillookup = async () => {
    const userRef = doc(db, "username", slug);
    const docSnap = await getDoc(userRef);
    console.log("emaillookup running...");
    if (docSnap.exists()) {
      console.log("Document data:", docSnap.data());
      return docSnap.data().email;
    } else {
      console.log("No such document!");
      // Handle the case where user data doesn't exist
    }
  };
  const getuserdata = async (email, num) => {
    try {
      const userRef = doc(db, "users", email);
      const docSnap = await getDoc(userRef);
      console.log("getuserdata running...");
      if (docSnap.exists()) {
        console.log("Document data:", docSnap.data());
        if (num == 1) setUserData(docSnap.data());
        else setCurrentUserData(docSnap.data());
      } else {
        console.log("No such document!");
        // Handle the case where user data doesn't exist
      }
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    const fun = async () => {
      const em = await emaillookup();
      getuserdata(em, 1);
      if (user) getuserdata(user.email, 2);
    };
    fun();
  }, [user]);
  const DropdownMenu = ({ onLogout, onSettings }) => {
    return (
      <div className="absolute right-0 mt-16 w-48 bg-white border rounded-md overflow-hidden shadow-md z-10">
        <button
          className="block text-center w-full px-4 py-2  text-sm text-gray-700 hover:bg-gray-100"
          onClick={() => {
            router.push(`/${userdata.userName}`);
          }}
        >
          My Profile
        </button>
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
  const handleLogout = async () => {
    try {
      console.log("logout");
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Sign-out error:", error.message);
    }
  };
  const handleSettings = () => {
    // Handle settings action
    router.push("/settings");
    console.log("Navigate to settings or perform other settings action");
    // You can navigate to a settings page or show a modal, etc.
  };
  const handleProfileClick = () => {
    setShowDropdown(!showDropdown);
  };
  const openPost = (data) => {
  }
  return (
    <div className="h-screen font-rethink relative text-black bg-white dark:bg-black dark:text-white">
      <div className="flex justify-between">
        <Link href="/">
          <div className="kl font-lucy text-6xl">Muse</div>
        </Link>
        <div className="io flex">
          <div onClick={handleProfileClick} className="lk">
            {currentuserdata ? (
              <Image
                className="rounded-full h-16 w-16 object-cover cursor-pointer"
                src={currentuserdata.pfp}
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
      </div>
      <div className="heading">
        {userdata ? (
          <div className="flex">
            <Image
              className="rounded-full h-16 w-16 object-cover cursor-pointer"
              src={userdata.pfp}
              width={100}
              height={100}
              alt="Profile Picture"
            />
            <div className="fff">
              <div className="textt">{userdata.userName}</div>
              <div className="ed">{userdata.bio}</div>
            </div>
          </div>
        ) : null}
      </div>
      {userdata ? (
        <>
          {userdata.posts.map((post) => (
            <div key={post} className="flex"> 
              <Image
                className="h-16 w-16 object-cover cursor-pointer"
                src={post.mediaFiles[0]}
                width={100}
                height={100}
                alt="Profile Picture"
                onClick={() => {openPost(userdata)}}
              />
              {/* {post.caption} */}
            </div>
          ))}
        </>
      ) : null}
    </div>
  );
};

export default Page;
