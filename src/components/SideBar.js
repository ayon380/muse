"use client";
import app from "@/lib/firebase/firebaseConfig";
import Link from "next/navigation";
import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  updateDoc,
  increment,
  getFirestore,
  arrayRemove,
  arrayUnion,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";
const CreatePost = dynamic(() => import("@/components/Createpost"), {
  ssr: false,
});
const CreateReel = dynamic(() => import("@/components/CreateReel"), {
  ssr: false,
});
const SideBar = ({ usage, data, currentuserdata }) => {
  const [profileData, setProfileData] = useState(null);
  const auth = getAuth(app);
  console.log("Current UserData", currentuserdata);
  const [userdata, setUserData] = useState(null);
  const router = useRouter();
  const [createreelopen, setcreatereelOpen] = useState(false);
  const [createpostopen, setcreatepostOpen] = useState(false);
  const [follow, setFollow] = React.useState(false);
  const db = getFirestore(app);
  const checkfollow = () => {
    if (userdata && data && userdata.followers.includes(profileData.uid)) {
      console.log("checkfollow running..." + true);
      return true;
    } else return false;
  };
  const [user, setUser] = useState(auth.currentUser);
  useEffect(() => {
    const getuserdata = async (userEmail, num) => {
      const userRef = doc(db, "users", userEmail);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        console.log("Document data:", docSnap.data());
        if (num === 1) setUserData(docSnap.data());
        if (num === 2) setProfileData(docSnap.data());
      } else {
        console.log("No such document!");
        // Handle the case where user data doesn't exist
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        // Redirect to login screen if user is not logged in
        router.push("/login");
      } else {
        // If the usage is "feed", display the current user's data
        if (usage === "feed") {
          getuserdata(user.email, 1);
        } else {
          // Otherwise, display the primary user's data
          setUserData(data);
          getuserdata(user.email, 2);
          // Get additional data for the primary user
        }
      }
    });

    return () => unsubscribe();
  }, [auth, router, db, user, data]);
  useEffect(() => {
    const hjk = async () => {
      if (userdata && profileData && userdata.email != profileData.email) {
        const userref = doc(db, "users", userdata.email);
        const temp = await getDoc(userref);
        const profileref = doc(db, "users", profileData.email);
        const temp1 = await getDoc(profileref);
        if (temp.exists()) {
          setUserData(temp.data());
        }
        if (temp1.exists()) {
          setProfileData(temp1.data());
        }
        // const arr=analyzeColors(userdata.pfp);
        // console.log(arr);
      }
    };
    hjk();
  }, [follow]);
  useEffect(() => {
    if (userdata && profileData) {
      setFollow(checkfollow());
    }
  }, [userdata, profileData]);
  const handleLogout = () => {
    auth.signOut().then(() => {
      // Sign-out successful.
      router.push("/login");
    });
  };
  const handlefollow = async () => {
    // Update follow state using the functional form
    try {
      const f = !follow;
      const userRef = doc(db, "users", userdata.email);
      const currentuserRef = doc(db, "users", user.email);

      // Calculate f based on the previous state

      if (f) {
        console.log("adding follow");
        await updateDoc(userRef, {
          followers: arrayUnion(profileData.uid),
          followerscount: increment(1),
        });
        await updateDoc(currentuserRef, {
          following: arrayUnion(userdata.uid),
          followingcount: increment(1),
        });
      } else {
        console.log("removing follow");
        await updateDoc(userRef, {
          followers: arrayRemove(profileData.uid),
          followerscount: increment(-1),
        });
        await updateDoc(currentuserRef, {
          following: arrayRemove(userdata.uid),
          followingcount: increment(-1),
        });
      }
      console.log(f);
      setFollow(f);
    } catch (error) {
      console.error("Error updating follow status:", error);
      // Handle error appropriately, e.g., show error message to the user
    }
  };
  return (
    <div className="lp w-1/3 ">
      <div className="bg-white z-50 pb-5 dark:bg-black h-full rounded-xl bg-clip-padding backdrop-filter backdrop-blur-3xl bg-opacity-40 shadow-2xl border-1 border-black lpo">
        {createpostopen && (
          <CreatePost
            onClose={() => setcreatepostOpen(!createpostopen)}
            userdata={userdata}
          />
        )}
        {createreelopen && (
          <CreateReel
            onClose={() => setcreatereelOpen(!createreelopen)}
            userdata={userdata}
          />
        )}
        {userdata && (
          <div className="main1 h-full  flex flex-col justify-between items-center">
            <div className="text-6xl font-lucy text-center mt-6 mb-8">Muse</div>
            <div className="flex justify-center">
              <div className="pfp my-4">
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
            <div className="bio text-center opacity-80 my-5">
              {userdata.bio}
            </div>
            <div className="flex justify-between ml-2">
              <div className="followers text-center w-16">
                <div className="text-2xl  font-bold">
                  {userdata.followers.length}
                </div>
                <div className="text-sm mr-6">Followers</div>
              </div>
              <div className="following text-center w-16">
                <div className="text-2xl font-bold">
                  {userdata.following.length}
                </div>
                <div className="text-sm">Following</div>
              </div>
              <div className="ml-6 posts">
                <div className="text-2xl font-bold w-16">
                  {userdata.posts.length}
                </div>
                <div className="text-sm -ml-2">Posts</div>
              </div>
            </div>
            {userdata &&
              profileData &&
              userdata.email !== profileData.email && (
                <div className="flex my-6 justify-center">
                  <button
                    className="bg-blue-600 text-xl rounded-xl p-3 shadow-2xl backdrop-blur-lg hover:opacity-90"
                    onClick={() => handlefollow()}
                  >
                    {follow ? "Following" : "Follow"}
                  </button>
                </div>
              )}
            {usage == "feed" && (
              <div className="options flex flex-col  justify-evenly items-center flex-auto mt-10 md:mb-48">
                <div className="explore">
                  <div
                    className="text-2xl text-left font-bold  cursor-pointer"
                    onClick={() => router.push("/feed")}
                  >
                    Feed
                  </div>
                </div>
                <div className="explore">
                  <div
                    className="text-2xl font-bold cursor-pointer"
                    onClick={() => router.push("/feed/explore")}
                  >
                    Explore
                  </div>
                </div>
                <div className="Reels">
                  <div
                    className="text-2xl cursor-pointer font-bold text-center"
                    onClick={() => router.push("/feed/reels")}
                  >
                    Reels
                  </div>
                </div>
                <div className="messages">
                  <div
                    className="text-2xl font-bold text-center cursor-pointer"
                    onClick={() => {
                      router.push("/feed/messages");
                    }}
                  >
                    Messages
                  </div>
                </div>
                <div className="settings cursor-pointer">
                  <div
                    className="text-2xl font-bold cursor-pointer text-center"
                    onClick={() => router.push("/feed/settings")}
                  >
                    Settings
                  </div>
                </div>
                <div className="logout">
                  <div
                    className="text-2xl font-bold cursor-pointer text-center"
                    onClick={handleLogout}
                  >
                    Logout
                  </div>
                </div>
              </div>
            )}
            {(currentuserdata || usage == "feed") && (
              <div className="flex w-full justify-evenly -mt-6">
                <div
                  className="profile flex mt-2 cursor-pointer"
                  onClick={() =>
                    usage == "feed"
                      ? router.push(`/${userdata.userName}`)
                      : router.push("/feed")
                  }
                >
                  <Image
                    className="h-7 w-7 mr-2 rounded-full"
                    src={usage == "slug" ? currentuserdata.pfp : userdata.pfp}
                    alt="profile"
                    width={100}
                    height={100}
                  />
                </div>
                {usage == "feed" && (
                  <button
                    className="create btn px-6 py-2 font-rethink mb-4 "
                    onClick={() => setcreatereelOpen(true)}
                    disabled={createreelopen}
                  >
                    Create a Reel
                  </button>
                )}
                {usage == "feed" && (
                  <button
                    className="create btn px-6 py-2 font-rethink mb-4 "
                    onClick={() => setcreatepostOpen(true)}
                    disabled={createpostopen}
                  >
                    Create a Post
                  </button>
                )}
              </div>
            )}
            <div className="okedoesd flex w-full justify-evenly  text-sm">
              <div
                className=" font-bold text-center cursor-pointer"
                onClick={() => router.push("/contactus")}
              >
                Contact Us
              </div>
              <div className="about">
                <div
                  className=" font-bold text-center cursor-pointer"
                  onClick={() => router.push("/about")}
                >
                  About
                </div>
              </div>
            </div>
            <div
              className="pl text-xs cursor-pointer"
              onClick={() => router.push("/releasenotes")}
            >
              Muse v0.46 beta @NoFilter LLC 2024-2025
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default SideBar;
