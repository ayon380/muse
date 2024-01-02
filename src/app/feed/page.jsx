"use client"

import React from 'react'
import { useSelector } from 'react-redux'
const Home = () => {
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
    const user = useSelector((state) => state.user.data)
    console.log(user);
  return (
    <div> Feed 
      {user? user.displayName:null}
      <button onClick={handleLogout}>Logout</button>
    </div>
  )
}

export default Home