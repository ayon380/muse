"use client";

import Link from "next/link";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import app from "@/lib/firebase/firebaseConfig";
import toast, { Toaster } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { setUser } from "../../store/features/UserSlice.ts";
const Home = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const auth = getAuth();
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
  const provider = new GoogleAuthProvider();
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const q = await checkIfUserExists(user.email);
      console.log(q);
      if (user && q) {
        const userData = {
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          uid: user.uid,
          // Add other user data as needed
        };
        dispatch(setUser(userData));
        router.push("/feed");
      }
    }
  });

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if the user's email is already registered
      console.log(user.email);
      const userExists = await checkIfUserExists(user.email);
      console.log(userExists);
      if (!userExists) {
        // Redirect to the signup screen
        router.push("/signup");
        return;
      }
      // User is already registered, proceed with login
      auth.setPersistence(auth, "session");
      dispatch(setUser(user));
      toast.success("Logged In");
      // Redirect to the feed screen after a delay
      setTimeout(() => {
        router.push("/feed");
      }, 2000);
    } catch (error) {
      // Handle login errors
      const errorCode = error.code;
      const errorMessage = error.message;
      toast.error(`Error Logging In ${errorCode} : ${errorMessage}`);
    }
  };

  return (
    <div className="root hl">
      <Toaster />
      <div className=" mt-52 mx-12 md:mx-96 bg-gray-700 rounded-md bg-clip-padding backdrop-filter backdrop-blur-3xl bg-opacity-10 shadow-2xl border-1 border-black">
        <div className="f1 font-lucy text-8xl lg:text-9xl pt-10   text-center">
          <Link href="/">Muse</Link>
        </div>
        <div className="btn mt-10  flex justify-center ">
          <button className="fd font-rethink mb-10 px-10" onClick={handleLogin}>
            Log In With Google
          </button>
        </div>
        <div className="flex justify-center">
          <div className="q1 text-sm mb-10">
            <Link href="/tcs">Terms and Conditions</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
