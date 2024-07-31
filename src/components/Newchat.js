import React, { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { deleteDoc } from "firebase/firestore";
import Image from "next/image";
import BottomSheet from "./BottomSheet";
import { updateDoc, doc } from "firebase/firestore";
const ChatDetail = ({
  onClose,
  usermetadata,
  userdata,
  db,
  chatwindow,
  startchat,
}) => {
  const [showModal, setShowModal] = useState(false);

  React.useEffect(() => {
    setShowModal(true);
    console.log(chatwindow + "newchat");
  }, []);
  const chat = async () => {
    startchat();
    onClose();
  };

  return (
    <BottomSheet show={true} heading="New Chat" onClose={onClose}>
      <div className="w-full">
        <Toaster />
        <Image
          src={usermetadata[chatwindow]?.pfp}
          height={100}
          width={500}
          alt="854"
          className="rounded-md h-60 object-cover w-full "
        />
        <div className="df w-full">
          <div className="username text-2xl mt-2 ml-2 text-center">
            {usermetadata[chatwindow]?.userName}
          </div>
          <div className="fs flex mt-10 justify-center w-full">
            <button
              className="text-fuchsia-500 bg-fuchsia-100 px-3 py-1 rounded-full dark:bg-fuchsia-500 dark:text-fuchsia-100
            disabled:text-gray-500
    transition-all duration-300 ease-in-out
    hover:scale-110 hover:bg-fuchsia-200
    active:scale-90 active:bg-fuchsia-300
    cursor-pointer"
              onClick={chat}
            >
              Start Chat with {usermetadata[chatwindow]?.userName}
            </button>
          </div>
        </div>
      </div>
    </BottomSheet>
  );
};

export default ChatDetail;
