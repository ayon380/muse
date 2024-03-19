"use client";
import React from "react";
import Image from "next/image";
import { useEffect } from "react";
import app from "@/lib/firebase/firebaseConfig";
import { motion } from "framer-motion";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Hello from "../components/Hello";
const SparklesPreview = () => {
  const auth = getAuth(app);
  const [loggedin, setLoggedin] = React.useState(false);
  const user = auth.currentUser;
  const db = getFirestore(app);
  const checkIfUserExists = async (email) => {
    try {
      const userRef = doc(db, "users", email);
      const userSnapshot = await getDoc(userRef);
      return userSnapshot.exists();
    } catch (error) {
      console.error("Error checking user existence:", error.message);
      return false;
    }
  };
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        checkIfUserExists(user.email).then((exists) => {
          if (exists) {
            setLoggedin(true);
          } else {
            setLoggedin(false);
          }
        });
      } else {
        setLoggedin(false);
      }
    });

    return () => unsubscribe();
  }, [auth]);
  const handleClick = () => {
    if (loggedin) {
      window.location.href = "/feed";
    } else {
      window.location.href = "/login";
    }
  };
  const handlesignup = () => {
    window.location.href = "/signup";
  };
  const boxVariant = {
    visible: { opacity: 1, scale: 2 },
    hidden: { opacity: 0, scale: 0 },
  };
  return (
    <div className="maindiv h-dvh w-screen overflow-y-auto">
      <div className="fixed w-screen top-0 z-20 ">
        <div className="flex lg:mx-96 justify-between shadow-2xl border-2 border-gray-400 backdrop-filter backdrop-blur-3xl bg-white bg-opacity-50 py-2 my-2 rounded-full px-5">
          <button className="font-lucy ">Muse</button>
          <div className="dede flex">
            <button className="mr-10" onClick={handleClick}>
              {loggedin ? "Go to Feed" : "Log in"}
            </button>
            <button className="" onClick={handlesignup}>
              Sign Up
            </button>
          </div>
        </div>
      </div>
      <Hello />
      <div className="hj flex ">
        <div className="w-1/2 px-20 mt-36">
          <div className="qw text-8xl font-lucy ">
            Muse: A Symphony of Design and Functionality
          </div>
          <div className="w text-3xl mt-24 opacity-60">
            Immerse yourself in the harmonious blend of artistry and utility, as
            Muse orchestrates a new era of social interaction.
          </div>
        </div>
        <Image
          src="/main/p1.png"
          className="rounded-l-xl w-1/2"
          height={1000}
          width={1000}
          alt=""
        />
      </div>

      <div className="hj flex mt-16 ">
        <Image
          src="/main/p2.png"
          className="rounded-r-xl w-1/2"
          height={1000}
          width={1000}
          alt=""
        />
        <div className="w-1/2 px-20 mt-36">
          <div className="qw text-8xl font-lucy ">
            Muse: Spark Instant Connections with Effortless Messaging
          </div>
          <div className="w text-3xl mt-24 opacity-60">
            Experience the thrill of instant communication, where every message
            ignites new conversations and strengthens bonds.
          </div>
        </div>
      </div>
      <div className="hj flex  mt-16">
        <div className="w-1/2 px-20 mt-36">
          <div className="qw text-8xl font-lucy ">
            Muse: Unveiling Reels, Your Stage for Captivating Stories
          </div>
          <div className="w text-3xl mt-24 opacity-60">
            Step into the spotlight and unleash your creativity with Muse Reels,
            where every moment shines bright.
          </div>
        </div>
        <Image
          src="/main/p3.png"
          className="rounded-l-xl w-1/2"
          height={1000}
          width={1000}
          alt=""
        />
      </div>
      <div className="hj flex mt-16 ">
        <Image
          src="/main/p4.png"
          className="rounded-r-xl w-1/2"
          height={1000}
          width={1000}
          alt=""
        />
        <div className="w-1/2 px-20 mt-36">
          <div className="qw text-8xl font-lucy ">
            Muse: Explore the Uncharted Depths of Social Discovery
          </div>
          <div className="w text-3xl mt-24 opacity-60">
            Embark on a journey of endless exploration, where each click
            uncovers new stories, ideas, and connections waiting to be
            discovered.
          </div>
        </div>
      </div>
      <div className="footer mt-10 mx-2 mb-2 pt-10 backdrop-filter backdrop-blur-3xl bg-white bg-opacity-50 rounded-xl ">
        <div className="font-lucy text-center text-5xl pb-5">Muse</div>
        <div className="text-center font-medium">Made with ❤️</div>
        <div className="text-center">by</div>
        <div className="font-bold text-center">No Filter LLC</div>
        <div className="container mx-auto text-center mt-10">
          <p className="text-sm">© 2024 NoFilter LLC. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default SparklesPreview;
