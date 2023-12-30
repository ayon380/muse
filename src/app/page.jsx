"use client";
import { useState, useEffect } from "react";
import app from "@/lib/firebase/firebaseConfig";
import Counter from "../components/Counter";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
} from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, doc, setDoc } from "firebase/firestore";
export default function Home() {
  const auth = getAuth();
  const [videoUrl, setVideoUrl] = useState("");
  const storage = getStorage(app);
  const provider = new GoogleAuthProvider();
  const [user, setUser] = useState(null);
  const db = getFirestore(app);
  const uploadImage = async () => {
    console.log("uploading image");
    console.log(user.uid);

    // Get the file input element
    const fileInput = document.getElementById("fileInput");

    // Check if a file is selected
    if (fileInput.files.length > 0) {
      const file = fileInput.files[0];

      const storageRef = ref(storage, `images/${user.uid}/${file.name}`);

      try {
        const snapshot = await uploadBytes(storageRef, file);
        console.log("Image uploaded successfully:", snapshot.ref.fullPath);

        // Use the download URL as needed (e.g., store it in Firestore)
        const downloadURL = await getDownloadURL(snapshot.ref);
        setVideoUrl(downloadURL);
        updateUserDataWithFile(downloadURL);

        return snapshot.ref.fullPath;
      } catch (error) {
        console.error("Error uploading image:", error.message);
        return null;
      }
    } else {
      console.error("No file selected.");
      return null;
    }
  };

  const updateUserDataWithFile = async (fileUrl) => {
    const userRef = doc(db, "users", user.uid);

    try {
      await setDoc(userRef, { fileUrl }, { merge: true });
      console.log("User data updated with file URL");
    } catch (error) {
      console.error("Error updating user data:", error.message);
    }
  };
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, [auth]);
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const userRef = doc(db, "users", user.uid);
      const userData = {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        uid: user.uid,
        // Add other user data as needed
      };

      setDoc(userRef, userData, { merge: true })
        .then(() => {
          console.log("User data stored in Firestore");
        })
        .catch((error) => {
          console.error("Error storing user data:", error.message);
        });
    }
  });
  const handlelogin = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken;
        // The signed-in user info.
        const user = result.user;
        console.log(user);
        setUser(user);
        // IdP data available using getAdditionalUserInfo(result)
        // ...
      })
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
      });
  };
  const handleLogout = async () => {
    try {
      console.log("logout");
      await signOut(auth).then(() => {
        setUser(null);
      });

      // Redirect or update the UI as needed
      // router.push("/");
    } catch (error) {
      console.error("Sign-out error:", error.message);
    }
  };

  return (
    <main className="font-lucy">
      <button onClick={() => handlelogin()}>Login</button>
      {user ? <h1>Logged in</h1> : <h1>Not logged in</h1>}
      {user ? <button onClick={() => handleLogout()}>Logout</button> : null}
      <input type="file" id="fileInput" accept="image/*,video/*" />
      <button onClick={() => uploadImage()}>Upload</button>
      {videoUrl && (
        <video controls width="640" height="360">
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
    </main>
  );
}
