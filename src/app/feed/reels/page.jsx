"use client";
import React, { useState, useRef, useEffect, use } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import app from "@/lib/firebase/firebaseConfig";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import Video from "@/components/Video";
import "../../styles/reels.css";
import Image from "next/image";
import { useSidebarStore } from "../../store/zustand";
import { usePathname, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
const MainLoading = dynamic(() => import("@/components/MainLoading"));
const ReelComment = dynamic(() => import("@/components/ReelComment"));
const ShareMenuReel = dynamic(() => import("@/components/ShareMenuReel"));
const Reels = () => {
  // console.log("Sidebaropen", Sidebaropen);
  const [userdata, setUserData] = useState(null);
  const auth = getAuth(app);
  const [user, setUser] = useState(auth.currentUser);
  const [reels, setReels] = useState([]);
  const db = getFirestore(app);
  const [currentPage, setCurrentPage] = useState(0); // Set the current page to 1 by default
  const [totalPages, setTotalPages] = useState(0); // Initialize the total pages to 0
  const [shraremenu, setSharemenu] = useState(false);
  const [isGlobalMuted, setIsGlobalMuted] = useState(false);
  const SearchParams = useSearchParams();
  const [showComments, setShowComments] = useState(false);
  const [selectedreelid, setselectedReelid] = useState(null);
  const id = SearchParams.get("reelid") || null;
  const [reelid, setReelid] = useState(id);
  // State to hold the next page cursor
  const [nextPageCursor, setNextPageCursor] = useState(0);
  const [reelsloading, setReelsloading] = useState(true);
  const [currentreel, setCurrentReel] = useState(0);
  const pathname = usePathname();
  const {
    isOpen,
    toggle,
    initialLoad,
    toggleload,
    usermetadata,
    enqueueUserMetadata,
  } = useSidebarStore();
  const limit = 5; // Number of documents to fetch per page
  const toggleGlobalMute = () => {
    setIsGlobalMuted((prevState) => !prevState);
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
      enqueueUserMetadata(docSnap.data().uid);
      setReel(docSnap.data());
      setReels((prevReels) => [...prevReels, ...[docSnap.data()]]);
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
      setReelsloading(false);
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
  useEffect(() => {
    console.log("reels", reels);
  }, [reels]);
  useEffect(() => {
    if (!reelsloading) {
      toggleload();
    }
  }, [reelsloading]);
  return (
    <div className="lg:ml-5 w-full h-full">
      {reelsloading && initialLoad && <MainLoading />}
      {reelsloading && !initialLoad && (
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
                <div className="de font-lucy mt-24 mx-10 text-center md-text-3xl">
                  🎬 Lights, camera, action! Get ready to groove and be
                  amazed... Your front-row seat to the reel world awaits! 🌟
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {showComments && (
        <ReelComment
          // showComments={showComments}
          setShowComments={setShowComments}
          db={db}
          userdata={userdata}
          usermetadata={usermetadata}
          enqueueUserMetadata={enqueueUserMetadata}
          selectedreelid={selectedreelid}
          postid={selectedreelid}
          uid={userdata.uid}
          setselectedReelid={setselectedReelid}
        />
      )}
      {shraremenu && (
        <ShareMenuReel
          setSharemenu={setSharemenu}
          // db={db}
          userdata={userdata}
          userName={userdata.username}
          usermetadata={usermetadata}
          enqueueUserMetadata={enqueueUserMetadata}
          selectedreelid={selectedreelid}
          postid={selectedreelid}
          uid={userdata.uid}
          setselectedReelid={setselectedReelid}
        />
      )}
      {userdata && !reelsloading && (
        <div>
          <div className="main2 grid md:rounded-2xl bg-white dark:bg-black md:bg-clip-padding md:backdrop-filter md:backdrop-blur-3xl md:bg-opacity-20 shadow-2xl border-1 p-1 lg:p-8 App  border-black w-full h-full">
            <div className="flex">
              <div className="h1 text-3xl pt-2 lg:text-5xl w-full text-left">
                Reels
              </div>
              <div className="flex">
                <div className="">
                  {/* <p>Sidebar is {isOpen ? "open" : "closed"}</p> */}
                  <button onClick={toggle}>
                    <Image
                      src="/icons/sidebar.png"
                      width={50}
                      height={50}
                      className="dark:invert mt-2 mr-2 h-7 w-7"
                      alt="SidebAr"
                    />
                  </button>
                </div>
                <button onClick={toggleGlobalMute} className="-mt-4">
                  {isGlobalMuted ? (
                    <Image
                      src="/icons/soundon.png"
                      className="dark:invert h-7 w-7"
                      height={50}
                      width={50}
                      alt="sound on"
                    />
                  ) : (
                    <Image
                      className="dark:invert h-7 w-7"
                      src="/icons/mute.png"
                      height={50}
                      width={50}
                      alt="sound off"
                    />
                  )}
                </button>
              </div>
            </div>
            <div className="fl flex justify-center">
              <div
                className=" video-container rounded-xl bg-black w-auto  relative "
                id="video-container "
              >
                {reels.map((reel, idx) => (
                  <div className="pk " play={reel.id} key={reel.id + idx}>
                    <Video
                      reel={reel}
                      setSharemenu={setSharemenu}
                      idx={idx}
                      setselectedReelid={setselectedReelid}
                      setShowComments={setShowComments}
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
      {/* {reel && id && (
        <div>
          <div className="main2 grid rounded-2xl bg-white md:bg-clip-padding md:backdrop-filter md:backdrop-blur-3xl md:bg-opacity-20 shadow-2xl border-1 p-8 App  border-black w-full h-full">
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
      )} */}
    </div>
  );
};

export default Reels;
