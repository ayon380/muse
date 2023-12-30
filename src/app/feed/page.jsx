"use client"

import React from 'react'
import { useSelector } from 'react-redux'
const Home = () => {
    const user = useSelector((state) => state.user.data)
    console.log(user);
  return (
    <div> Feed 
      {user.displayName}
    </div>
  )
}

export default Home