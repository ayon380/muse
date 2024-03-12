"use client";
import React, { useState, useRef, useEffect, use } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import app from "@/lib/firebase/firebaseConfig";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import Video from "@/components/Video";
import "../../styles/reels.css";
import { useSidebarStore } from "../../store/zustand";
import { usePathname, useSearchParams } from "next/navigation";
const Reels = () => {
  // console.log("Sidebaropen", Sidebaropen);
  const [userdata, setUserData] = useState(null);
  const auth = getAuth(app);
  const [user, setUser] = useState(auth.currentUser);
  const [reels, setReels] = useState([]);
  const db = getFirestore(app);
  const [currentPage, setCurrentPage] = useState(0); // Set the current page to 1 by default
  const [totalPages, setTotalPages] = useState(0); // Initialize the total pages to 0
  const [isGlobalMuted, setIsGlobalMuted] = useState(false);
  const SearchParams = useSearchParams();
  const id = SearchParams.get("reelid") || null;
  const [reelid, setReelid] = useState(id);
  // State to hold the next page cursor
  const [nextPageCursor, setNextPageCursor] = useState(0);
  const [usermetadata, setUsermetadata] = useState({});
  const [currentreel, setCurrentReel] = useState(0);
  const pathname = usePathname();
  const { isOpen, toggle } = useSidebarStore();
  const limit = 5; // Number of documents to fetch per page
  const toggleGlobalMute = () => {
    setIsGlobalMuted((prevState) => !prevState);
  };
  const userMetadataQueue = [];
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
  const [reel, setReel] = useState(null);
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
  const fetchReel = async () => {
    console.log("fetching url reel");
    const q = doc(db, "reels", id);
    const docSnap = await getDoc(q);
    if (docSnap.exists()) {
      console.log("Document data:", docSnap.data());
      setReel(docSnap.data());
    } else {
      console.log("No such document!");
      // Handle the case where user data doesn't exist
    }
  };
  useEffect(() => {
    console.log("pathname", pathname);
    if (id) {
      fetchReel();
    }
  }, [pathname]);
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
  const fetchReels = async () => {
    console.log("fetching reels");
    const response = await fetch("/api/reels/trending", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await gettoken()}`,
        email: user.email,
        // Pass the cursor in the request header
      },
      body: JSON.stringify({ cursor: nextPageCursor }), // Send current page and cursor in the request body
    });
    const data = await response.json();
    if (data.status === "true") {
      setReels((prevReels) => [...prevReels, ...data.posts]); // Append new reels to the existing reels; // Set total pages received from
      setNextPageCursor(data.cursor); // Update the next page cursor for subsequent requests
      console.log(data.cursor, "cursor");
      setCurrentPage(currentPage + 1);
      if (reels.length > 20) {
        setReels(reels.slice(reel.length - 20, reels.length));
      }
    }
  };

  useEffect(() => {
    if (currentreel > reels.length - 3 && reels.length > 0) {
      fetchReels();
      console.log("fetching more reels");
    }
  }, [currentreel]);

  useEffect(() => {
    if (userdata) fetchReels();
  }, [userdata]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        // Redirect to login screen if user is not logged in
        window.location.href = "/login";
      } else {
        getuserdata(user);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  return (
    <div className="lg:ml-5 w-full h-full">
      {userdata && !id && (
        <div>
          <div className="main2 grid rounded-2xl bg-white bg-clip-padding backdrop-filter backdrop-blur-3xl bg-opacity-20 shadow-2xl border-1 p-1 lg:p-8 App  border-black w-full h-full">
            <div className="flex">
              <div className="h1 font-lucy text-3xl pt-2 lg:text-5xl w-full text-left">
                Reels
              </div>
              <div className="dss">
                {/* <p>Sidebar is {isOpen ? "open" : "closed"}</p> */}
                <button onClick={toggle}>Sidebar</button>
              </div>
              {/* {currentreel}CurrentReel
              {currentPage}CurrentPage
              {reels.length}Reels */}
              <button onClick={toggleGlobalMute}>
                {isGlobalMuted ? "Mute All" : "UnMute All"}
              </button>
            </div>
            <div className="fl flex justify-center">
              <div
                className=" video-container rounded-xl bg-black w-auto  relative "
                id="video-container "
              >
                {reels.map((reel, idx) => (
                  <div className="pk " play={reel.id} key={reel.id}>
                    <Video
                      reel={reel}
                      idx={idx}
                      usermetadata={usermetadata}
                      enqueueUserMetadata={enqueueUserMetadata}
                      currentreel={currentreel}
                      setCurrentReel={setCurrentReel}
                      userdata={userdata}
                      isGlobalMuted={isGlobalMuted}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {reel && id && (
        <div>
          <div className="main2 grid rounded-2xl bg-white bg-clip-padding backdrop-filter backdrop-blur-3xl bg-opacity-20 shadow-2xl border-1 p-8 App  border-black w-full h-full">
            <div className="flex">
              <div className="h1 font-lucy text-5xl w-full text-left">
                Reels
              </div>
              <button onClick={toggleGlobalMute}>
                {isGlobalMuted ? "Mute All" : "UnMute All"}
              </button>
            </div>
            <div className="fl flex justify-center">
              <div
                className=" video-container rounded-xl bg-black w-auto relative "
                id="video-container "
              >
                <div className="pk " play={reel.id} key={reel.id}>
                  <Video
                    reel={reel}
                    userdata={userdata}
                    isGlobalMuted={isGlobalMuted}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reels;
