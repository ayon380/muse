// pages/signup.js
"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import app from "@/lib/firebase/firebaseConfig";
import { useDispatch } from "react-redux";
import { setUser } from "../../store/features/UserSlice";
import { useRouter } from "next/navigation";

const Signup = () => {
  const auth = getAuth();
  const db = getFirestore(app);
  const dispatch = useDispatch();
  const router = useRouter();
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // Redirect to the home page if the user is already logged in
        router.push("/");
      }
    });
    return () => unsubscribe();
  }, []);
  const handleSignup = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Dispatch action to store user information in Redux
      dispatch(
        setUser({
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          uid: user.uid,
        })
      );

      // Save additional user data to Firestore
      const userRef = doc(db, "users", user.email);
      const userData = {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        uid: user.uid,
        // Add other user data as needed
      };

      await setDoc(userRef, userData);

      // Redirect to the home page after successful signup
      router.push("/");
    } catch (error) {
      // Handle signup errors
      console.error("Error signing up:", error);
    }
  };

  return (
    <div>
      <h1>Signup</h1>
      <button onClick={handleSignup}>Signup with Google</button>
      <div>
        <Link href="/login">Already have an account? Login here</Link>
      </div>
    </div>
  );
};

export default Signup;
