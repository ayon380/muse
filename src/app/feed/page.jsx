"use client";
import app from "@/lib/firebase/firebaseConfig";
import React, { use, useContext, useEffect, useState } from "react";
import {
  deleteUser,
  getAuth,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import { useRouter } from "next/navigation";
import "../styles/gradients.css";
import "../styles/feed.css";
import {
  collection,
  getDocs,
  limit,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { getStorage, deleteObject } from "firebase/storage";
import Image from "next/image";
import { getFirestore, getDoc, doc } from "firebase/firestore";
import { useSidebarStore } from "../store/zustand";
import dynamic from "next/dynamic";
import FeedPost from "@/components/FeedPost";
const MainLoading = dynamic(() => import("@/components/MainLoading"));
const ShareMenu = dynamic(() => import("@/components/ShareMenu"));
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
  const [usermetadata, setUsermetadata] = useState({});
  const [sharemenu, setSharemenu] = useState(false);
  const [sharepostdata, setSharepostdata] = useState(null);
  const userMetadataQueue = [];
  const { isOpen, toggle, initialLoad, toggleload } = useSidebarStore();
  let isUserMetadataQueueProcessing = false;

  const processUserMetadataQueue = async () => {
    if (!isUserMetadataQueueProcessing && userMetadataQueue.length > 0) {
      // Set processing flag to true
      isUserMetadataQueueProcessing = true;

      // Get the first item from the queue
      const { uid, resolve } = userMetadataQueue.shift();
      try {
        // Call getusermetadata function

        await getusermetadata(uid);
        // Resolve the promise
        resolve();
      } catch (error) {
        console.error("Error processing user metadata:", error);
      }

      // Process next item in the queue recursively
      processUserMetadataQueue();
    } else {
      // Set processing flag to false when queue is empty
      isUserMetadataQueueProcessing = false;
    }
  };

  const enqueueUserMetadata = (uid) => {
    return new Promise((resolve, reject) => {
      // Add the user metadata task to the queue
      userMetadataQueue.push({ uid, resolve });
      // Start processing the queue
      processUserMetadataQueue();
    });
  };

  const getusermetadata = async (uid) => {
    // console.log(uid, "uid");
    if (!usermetadata[uid]) {
      console.log("Fetching user metadata");
      const userRef = doc(db, "username", uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        setUsermetadata((prevUsermetadata) => ({
          ...prevUsermetadata,
          [uid]: docSnap.data(),
        }));
      }
    }
    console.log(usermetadata, "usermetadata");
  };
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
        userData.posts.map((post) => {
          enqueueUserMetadata(post.uid);
          console.log(post.timestamp, "timestamp");
        });
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
  useEffect(() => {
    if (!postloading) {
      toggleload();
    }
  }, [postloading]);
  const [liked, setLiked] = useState(false);
  return (
    <div className=" lg:ml-5 w-full h-full">
      {sharemenu && (
        <ShareMenu
          userdata={userdata}
          postdata={sharepostdata} 
          usermetadata={usermetadata}
          enqueueUserMetadata={enqueueUserMetadata}
          userName={usermetadata[sharepostdata?.uid]?.userName}
          setSharemenu={setSharemenu}
        />
      )}
      {postloading && initialLoad && <MainLoading />}
      {postloading && !initialLoad && (
        <>
          <div className="main2 md:rounded-2xl bg-white dark:bg-black md:bg-clip-padding md:backdrop-filter md:backdrop-blur-3xl md:bg-opacity-20 shadow-2xl border-1 border-black h-full overflow-y-auto">
            <div className="flex justify-center items-center h-full">
              <div className="edwdw ">
                {" "}
                {/* Added text-center class here */}
                <div className="sd flex justify-center">
                  <Image
                    src="/loading.gif"
                    height={150}
                    width={150}
                    alt="Loading"
                  />
                </div>
                <div className="de font-lucy mt-24 md-text-3xl">
                  🌟 Loading your universe of endless updates... 💬
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {userdata && !postloading && (
        <div>
          <div className="main2 md:rounded-2xl bg-white dark:bg-black md:bg-clip-padding md:backdrop-filter md:backdrop-blur-3xl md:bg-opacity-20 shadow-2xl border-1 border-black h-full overflow-y-auto">
            <div className="flex justify-between mt-5 mx-2">
              <div className="fg font-lucy text-4xl">Muse</div>

              <button onClick={toggle}>
                <Image
                  src="/icons/sidebar.png"
                  height={50}
                  width={50}
                  className="dark:invert w-7 h-7"
                  alt="Sidebar"
                />
              </button>
            </div>
            {postloading && (
              <div className="flex justify-center ">
                Loading Feed..............
              </div>
            )}
            <div className="pol font-rethink ">
              <div className="feed w-full h-full overflow-y-auto">
                {posts && posts.length > 0 ? (
                  posts.map((post) => (
                    <FeedPost
                      key={post.id}
                      post={post}
                      userdata={userdata}
                      setSharemenu={setSharemenu}
                      setSharepostdata={setSharepostdata}
                      enqueueUserMetadata={enqueueUserMetadata}
                      usermetadata={usermetadata}
                      db={db}
                    />
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
