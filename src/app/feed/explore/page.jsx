"use client";
import React from "react";
import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import app from "@/lib/firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
const Explore = () => {
  const [userdata, setUserData] = useState(null);
  const auth = getAuth(app);
  const [user, setUser] = useState(auth.currentUser);
  const [explore, setexplore] = useState([]);
  const db = getFirestore(app);
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
    const fetchexplore = async () => {
      if (user) {
        const response = await fetch("/api/feed/explore", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await gettoken()}`,
            email: user.email,
          },
        });
        const data = await response.json();
        if (data.status === "true") {
          setexplore(data.posts);
        }
      }
    };
    fetchexplore();
  }, [user]);
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
  }, [auth]);

  return (
    <div className=" ml-5 w-full h-full">
      {userdata && (
        <div>
          <div className="main2 rounded-2xl bg-white bg-clip-padding backdrop-filter backdrop-blur-3xl bg-opacity-20 shadow-2xl border-1 border-black h-full">
            Explore
          </div>
        </div>
      )}
    </div>
  );
};

export default Explore;
