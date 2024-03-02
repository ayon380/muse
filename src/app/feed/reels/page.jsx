"use client";
import React, { useState, useRef, useEffect, use } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import app from "@/lib/firebase/firebaseConfig";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import Video from "@/components/Video";
import "../../styles/reels.css";
import { usePathname, useSearchParams } from "next/navigation";
const Reels = () => {
  const [userdata, setUserData] = useState(null);
  const auth = getAuth(app);
  const [user, setUser] = useState(auth.currentUser);
  const [reels, setReels] = useState([]);
  const db = getFirestore(app);
  const [isGlobalMuted, setIsGlobalMuted] = useState(false);
  const SearchParams = useSearchParams();
  const id = SearchParams.get("reelid") || null;
  const [reelid, setReelid] = useState(id);
  const pathname = usePathname();
  const toggleGlobalMute = () => {
    setIsGlobalMuted((prevState) => !prevState);
  };
  const [reel, setReel] = useState(null);
  const [currentreel, setCurrentReel] = useState(0);
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
    console.log("pathname", pathname);
    if (id) {
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

  useEffect(() => {
    const fetchReels = async () => {
      if (user && !id) {
        const response = await fetch("/api/reels/trending", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await gettoken()}`,
            email: user.email,
          },
        });
        const data = await response.json();
        if (data.status === "true") {
          setReels(data.posts);
          console.log(data.posts);
        }
      }
    };
    fetchReels();
  }, [user]);

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
    <div className="ml-5 w-full h-full">
      {userdata && !id && (
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
                {reels.map((reel, idx) => (
                  <div className="pk " play={reel.id} key={reel.id}>
                    <Video
                      reel={reel}
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
