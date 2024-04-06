import { getDoc } from 'firebase/firestore';
import React, { useEffect } from 'react';
import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { getFirestore, doc, collection, addDoc, arrayUnion, updateDoc } from 'firebase/firestore';
import app from '@/lib/firebase/firebaseConfig';
const ShareMenu = ({ userdata, postdata, userName, setSharemenu, usermetadata, enqueueUserMetadata }) => {
  const [chats, setChats] = useState([]);
  const db = getFirestore(app);
  const [sharing, setSharing] = useState({});
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
  const getChats = async () => {
    try {
      const docSnapshot = await getDoc(doc(db, "chats", userdata.uid));
      if (docSnapshot.exists()) {
        console.log("Document data:", docSnapshot.data());
        const rooms = docSnapshot.data().rooms;
        const chatRoomPromises = rooms.map((room) => fetchChatRoom(room));
        const chatrooms = await Promise.all(chatRoomPromises);
        const filteredChatrooms = chatrooms.filter(Boolean); // Remove null values
        setChats(filteredChatrooms);
      }
    } catch (error) {
      console.error("Error getting documents: ", error);
    }
  };
  const sendNotification = async (id, notificationData, chat) => {
    try {
      await new Promise((resolve) => {
        setTimeout(async () => {
          const msqref = doc(db, "messages", id);
          const msgdata = await getDoc(msqref);

          if (msgdata.data().readstatus) return;

          if (chat.type !== "p") {
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
            });
            return;
          }

          const notificationRef = collection(db, "notifications");
          const notification = {
            ...notificationData,
          };
          const temp = await addDoc(notificationRef, notification);
          const notificationRef1 = doc(db, "notifications", temp.id);
          await updateDoc(notificationRef1, {
            id: temp.id,
          });

          console.log("Notification sent:", notification);

          resolve(); // Resolve the promise after the timeout
        }, 1); // 10 seconds timeout
        setSharing({
          ...sharing,
          [chat.roomid]: false,
        });
      });
    } catch (error) {
      console.error("Error sending notification:", error.message);
      if (toast && toast.error) {
        toast.error("Error " + error.message);
      } else {
        console.error("Toast is not defined or does not have error method.");
      }
    }
  };
  const handlechatshare = async (chat) => {
    try {
      setSharing({
        ...sharing,
        [chat.roomid]: true,
      })
      const msgref = collection(db, "messages");
      const msgdata = {
        sender: userdata.uid,
        text: `https://muse.nofilter.cloud/feed/profile/${userName}?postid=${postdata?.id}`,
        type: "musepost",
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
      // setMessagetext("");
      sendNotification(q.id, {
        type: "message",
        chattype: chat.type,
        sender: userdata.uid,
        text: `https://muse.nofilter.cloud/feed/profile/${userName}?postid=${postdata?.id}`,
        messagetype: "musepost",
        roomid: chat.roomid,
        receiver: chat.type === "p" ? chat.participants[0] === userdata.uid ? chat.participants[1] : chat.participants[0] : chat.title,
        timestamp: Date.now(),
      }, chat);
      console.log("Message sent");
    }
    catch (error) {
      console.error("Error sending message:", error);
    }
  }

  const handlesystemshare = async () => {
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
  useEffect(() => {
    // getuserdata();
    getChats();
  }
    , []);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={() => setSharemenu(false)}
      className="fixed inset-0 z-50 flex items-center justify-center h-screen w-screen"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="absolute inset-0 bg-black bg-opacity-50"
      />
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 mx-4 z-10 max-w-2xl"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Share Options</h2>
          <button
            onClick={() => setSharemenu(false)}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="flex flex-col items-center">
          <p className="text-center mb-4">Share <strong>{postdata?.caption}</strong> by <strong>{userName}</strong></p>
          <motion.button
            onClick={handlesystemshare}
            className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 focus:outline-none mb-4 flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <span>Share System</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 ml-2"
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
          <div className="flex flex-col max-h-96 overflow-y-auto w-full">
            <div className="grid grid-cols-3 gap-4">
              {chats &&
                chats.map((chat) => (
                  <motion.button
                    key={chat.roomid}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    disabled={sharing[chat.roomid]}
                    onClick={() => handlechatshare(chat)}
                    className={`bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-3 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none flex flex-col items-center ${sharing[chat.roomid] ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                  >
                    <div className="flex justify-center">
                      <Image
                        src={
                          chat.type === 'p'
                            ? chat.participants[0] === userdata.uid
                              ? usermetadata[chat.participants[1]] &&
                              usermetadata[chat.participants[1]].pfp
                              : usermetadata[chat.participants[0]] &&
                              usermetadata[chat.participants[0]].pfp
                            : chat.pfp
                        }
                        height={100}
                        width={100}
                        className="rounded-full h-16  w-16 object-cover"
                        alt="Profile"
                      />
                    </div>
                    <span className="mt-2 text-center">
                      {sharing[chat.roomid] ? 'Sharing...' : 'Share'} to{' '}
                      {chat.type === 'p'
                        ? chat.participants[0] === userdata.uid
                          ? usermetadata[chat.participants[1]] &&
                          usermetadata[chat.participants[1]].userName
                          : usermetadata[chat.participants[0]] &&
                          usermetadata[chat.participants[0]].userName
                        : chat.title}
                    </span>
                  </motion.button>
                ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ShareMenu;