import { getDoc } from "firebase/firestore";
import React, { useEffect, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  getFirestore,
  doc,
  collection,
  addDoc,
  arrayUnion,
  updateDoc,
} from "firebase/firestore";
import { AnimatePresence } from "framer-motion";
import app from "@/lib/firebase/firebaseConfig";
import BottomSheet from "./BottomSheet";

const DRAG_CLOSE_THRESHOLD = 100;

const ShareMenu = ({
  userdata,
  postdata,
  userName,
  setSharemenu,
  usermetadata,
  enqueueUserMetadata,
}) => {
  const db = getFirestore(app);
  const [chats, setChats] = React.useState([]);
  const [isOpen, setIsOpen] = React.useState(true);
  const [sharing, setSharing] = React.useState({});
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    // setIsOpen(true);
    setTimeout(() => {
      getChats();
    }, 1000);
  }, []);

  const getChats = async () => {
    try {
      const docSnapshot = await getDoc(doc(db, "chats", userdata.uid));
      if (docSnapshot.exists()) {
        const rooms = docSnapshot.data().rooms;
        const chatRoomPromises = rooms.map((room) => fetchChatRoom(room));
        const chatrooms = await Promise.all(chatRoomPromises);
        const filteredChatrooms = chatrooms.filter(Boolean);
        setChats(filteredChatrooms);
      }
    } catch (error) {
      console.error("Error getting documents: ", error);
    }
  };
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);
  const fetchChatRoom = async (roomId) => {
    const roomSnapshot = await getDoc(doc(db, "messagerooms", roomId));
    if (roomSnapshot.exists()) {
      roomSnapshot.data().participants.forEach((participant) => {
        enqueueUserMetadata(participant);
      });
      return roomSnapshot.data();
    }
    return null;
  };

  const sendNotification = async (id, notificationData, chat) => {
    try {
      await Promise.all(
        chat.participants.map(async (participant) => {
          if (participant !== userdata.uid) {
            const notificationRef = collection(db, "notifications");
            const notification = {
              ...notificationData,
              receiver: participant,
              title: chatwindow,
            };
            const temp = await addDoc(notificationRef, notification);
            const notificationRef1 = doc(db, "notifications", temp.id);
            await updateDoc(notificationRef1, {
              id: temp.id,
            });
          }
        })
      );

      console.log("Notification sent:", notificationData);

      setSharing({
        ...sharing,
        [chat.roomid]: false,
      });
    } catch (error) {
      console.error("Error sending notification:", error.message);
    }
  };

  const handleChatShare = async (chat) => {
    try {
      setSharing({
        ...sharing,
        [chat.roomid]: true,
      });

      const msgref = collection(db, "messages");
      const msgdata = {
        sender: userdata.uid,
        text: `https://muse.nofilter.cloud/feed/profile/${userName}?postid=${postdata?.id}`,
        type: "text",
        timestamp: Date.now(),
        readstatus: false,
        roomid: chat.roomid,
      };
      const q = await addDoc(msgref, msgdata);

      const msgroomref = doc(db, "messagerooms", chat.roomid);
      const qwref = doc(db, "messages", q.id);
      const msgroomdata = {
        messages: arrayUnion(q.id),
      };
      await updateDoc(qwref, {
        id: q.id,
      });
      await updateDoc(msgroomref, msgroomdata);

      sendNotification(
        q.id,
        {
          type: "message",
          chattype: chat.type,
          sender: userdata.uid,
          text: `https://muse.nofilter.cloud/feed/profile/${userName}?postid=${postdata?.id}`,
          messagetype: "text",
          roomid: chat.roomid,
          receiver:
            chat.type === "p"
              ? chat.participants[0] === userdata.uid
                ? chat.participants[1]
                : chat.participants[0]
              : chat.title,
          timestamp: Date.now(),
        },
        chat
      );

      console.log("Message sent");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleSystemShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: postdata?.title,
          text: postdata?.description,
          url: `https://muse.nofilter.cloud/feed/profile/${userName}?postid=${postdata?.id}`,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    }
  };

  const closeModal = () => {
    setIsOpen(false);
    setTimeout(() => {
      setSharemenu(false);
    }, 500);
  };

  const renderedChats = useMemo(() => {
    return chats.map((chat) => (
      <motion.button
        key={chat.roomid}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        disabled={sharing[chat.roomid]}
        onClick={() => handleChatShare(chat)}
        className={
          'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 p-5 rounded-2xl shadow-md hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none flex flex-col items-center transition duration-300 ${ sharing[chat.roomid] ? "opacity-50 cursor-not-allowed" : "" }'
        }
      >
        <Image
          src={
            chat.type === "p"
              ? chat.participants[0] === userdata.uid
                ? usermetadata[chat.participants[1]]?.pfp
                : usermetadata[chat.participants[0]]?.pfp
              : chat.pfp
          }
          height={100}
          width={100}
          className="rounded-full h-20 w-20 object-cover mb-2 shadow-md"
          alt="Profile"
        />
        <span className="text-sm font-medium text-center">
          {sharing[chat.roomid] ? "Sharing..." : "Share to"}{" "}
          {chat.type === "p"
            ? chat.participants[0] === userdata.uid
              ? usermetadata[chat.participants[1]]?.userName
              : usermetadata[chat.participants[0]]?.userName
            : chat.title}
        </span>
      </motion.button>
    ));
  }, [chats, sharing]);

  return (
    <BottomSheet show={isOpen} heading="Share Options" onClose={closeModal}>
      {loading ? (
        <>
          <div className="flex flex-col items-center justify-center h-full">
            <div className="lds-ring">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mt-4">Loading...</p>
          </div>
        </>
      ) : (
        <div>
          <div className="flex flex-col items-center">
            <p className="text-center mb-6 mt-10 mx-12 text-gray-700 dark:text-gray-300">
              Share{" "}
              <strong className="text-gray-900 dark:text-gray-100">
                {postdata?.caption}
              </strong>{" "}
              by{" "}
              <strong className="text-gray-900 dark:text-gray-100">
                {userName}
              </strong>
            </p>

            <motion.button
              onClick={handleSystemShare}
              className="bg-gradient-to-r from-purple-400 to-pink-500 text-white px-8 py-4 rounded-full shadow-lg hover:from-purple-500 hover:to-pink-600 focus:outline-none mb-8 flex items-center justify-center transition duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="font-semibold">Share to System</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 ml-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
            </motion.button>

            <div className="grid grid-cols-3  px-5 sheetcontent gap-6 w-full ">
              {renderedChats}
             
            </div>
          </div>
        </div>
      )}
    </BottomSheet>
  );
};
export default ShareMenu;
