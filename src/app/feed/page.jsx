"use client";
import app from "@/lib/firebase/firebaseConfig";
import React, { use, useEffect, useState } from "react";
import {
  deleteUser,
  getAuth,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { firebase } from "@/lib/firebase/firebaseConfig";
import { useRouter } from "next/navigation";
import "../styles/gradients.css";
import "../styles/feed.css";
import Post from "../../components/Post";
import {
  collection,
  getDocs,
  limit,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { deleteDoc } from "firebase/firestore";
import { getStorage, deleteObject } from "firebase/storage";
import { useHorizontalScroll } from "../../externalfn/horizontalscroll";
import Image from "next/image";
import { ref } from "firebase/storage";
import { getFirestore, getDoc, doc } from "firebase/firestore";
import dynamic from "next/dynamic";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";

const CreatePost = dynamic(() => import("../../components/Createpost"));
const Home = () => {
  const auth = getAuth(app);
  const [user, setUser] = useState(auth.currentUser);
  const storage = getStorage(app);
  const [createpostmenu, setcreatepostmenu] = useState(false);
  const router = useRouter();
  const [userdata, setUserData] = useState(null);
  const db = getFirestore(app);
  const [posts, setPosts] = useState([]);
  const [postloading, setPostLoading] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [searchtext, setSearchtext] = useState("");
  async function gettoken() {
    if (user) {
      try {
        const idToken = await user.getIdToken();
        console.log(idToken);
        return idToken;
      } catch (error) {
        console.log(error);
      }
    }
    return null;
  }

  async function fetchData() {
    const idToken = await gettoken();
    if (idToken) {
      try {
        const response = await fetch("/api/feed", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
            email: user.email,
          },
        });
        const userData = await response.json();
        setPosts(userData.posts);
        console.log(userData);
        setPostLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
  }

  useEffect(() => {
    fetchData();
  }, [user]);
  const searchUsers = async () => {
    try {
      console.log("Searching users..." + searchtext);

      // Query for userName
      const userNameQuery = query(
        collection(db, "username"),
        where("userName", ">=", searchtext),
        orderBy("userName"),
        limit(5)
      );
      const userNameSnapshot = await getDocs(userNameQuery);

      // Query for fullname
      const fullNameQuery = query(
        collection(db, "username"),
        where("fullname", ">=", searchtext),
        orderBy("fullname"),
        limit(5)
      );
      const fullNameSnapshot = await getDocs(fullNameQuery);

      // Combine results
      const results = [];
      userNameSnapshot.forEach((doc) => {
        results.push({ ...doc.data() });
      });
      fullNameSnapshot.forEach((doc) => {
        const data = doc.data();
        if (!results.some((result) => result.userName === data.userName)) {
          results.push(data);
        }
      });

      console.log("Search results:", results);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching users:", error);
    }
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
  useEffect(() => {
    if (searchtext.length > 0) {
      searchUsers();
    } else {
      setSearchResults([]);
    }
  }, [searchtext]);

  return (
    <div className=" ml-5 w-full h-full">
      {userdata && (
        <div>
          <div className="main2 rounded-2xl bg-white bg-clip-padding backdrop-filter backdrop-blur-3xl bg-opacity-20 shadow-2xl border-1 border-black h-full">
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
                    background: "rgba(192,192,192,0.5)",
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
                {searchResults.length > 0 && searchtext.length > 0 && (
                  <div className="search-results absolute  bg-white z-10 w-96">
                    <ul>
                      {searchResults.map((user) => (
                        <Link key={user} href={`/${user.userName}`}>
                          <li key={user.id}>{user.userName}</li>
                        </Link>
                      ))}
                    </ul>
                  </div>
                )}
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
            {postloading && (
              <div className="flex justify-center ">
                Loading Feed..............
              </div>
            )}
            <div className="pol h-full">
              <div className="feed w-full h-full  overflow-y-auto">
                {posts && posts.length > 0 ? (
                  posts.map((post) => (
                    <div className=" m-10" key={post.id}>
                      <Image
                        width={1000}
                        height={1000}
                        alt=""
                        src={post.mediaFiles[0]}
                      />
                    </div>
                  ))
                ) : (
                  <div className="flex justify-center items-center h-96 w-full text-3xl font-bold">
                    No posts to show
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
