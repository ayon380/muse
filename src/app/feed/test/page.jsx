// pages/call.js
"use client";
import VideoCall from "@/components/VideoCall";
import { useSidebarStore } from "@/app/store/zustand";
import { getAuth } from "firebase/auth";
import app from "@/lib/firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect,useState } from "react";

const CallPage = () => {
  const auth=getAuth(app)
  const [user, setUser] = useState(null);
//   const user=auth.currentUser
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        // Redirect to login screen if user is not logged in
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [auth]);
  return (
    <div className="text-black">
      {user && user.uid}
      {user && <VideoCall userId={user.uid} curuserid={user.uid}/>}
    </div>
  );
};

export default CallPage;
