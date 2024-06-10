import { getDoc } from "firebase/firestore";
import React, { useEffect } from "react";
import { useState, useRef } from "react";
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
const DRAG_CLOSE_THRESHOLD = 100;
const ShareMenu = ({
  userdata,
  postdata,
  userName,
  setSharemenu,
  usermetadata,
  enqueueUserMetadata,
}) => {
  const [chats, setChats] = useState([]);
  const [isOpen, setIsOpen] = React.useState(false);
  const db = getFirestore(app);
  const [sharing, setSharing] = useState({});
  console.log("loading share menu");
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
      // setMessagetext("");
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
    setIsOpen(true);
    getChats();
  }, []);
  const modalRef = useRef(null);
  // const db = getFirestore(app);

  const handleDragEnd = (event, info) => {
    if (info.offset.y > DRAG_CLOSE_THRESHOLD) {
      closeModal();
    }
  };

  const closeModal = () => {
    setIsOpen(false);
    setTimeout(() => {
      setSharemenu(false);
    }, 500);
  };
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const modalElement = modalRef.current;
      modalElement.style.willChange = "transform";
      // Force reflow
      modalElement.offsetHeight;
    }
  }, [isOpen]);
  // const [isOpen, setIsOpen] = useState(initiallyOpen);
  const [isDragging, setIsDragging] = useState(false);
  const sheetRef = useRef(null);
  const startYRef = useRef(0);
  const currentYRef = useRef(0);

  const openSheet = () => setIsOpen(true);
  const closeSheet = () => closeModal();

  const handleTouchStart = (e) => {
    startYRef.current = e.touches[0].clientY;
    currentYRef.current = e.touches[0].clientY;
    setIsDragging(true);
    if (sheetRef.current) {
      sheetRef.current.style.transition = "none";
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    currentYRef.current = e.touches[0].clientY;
    const diff = currentYRef.current - startYRef.current;
    if (sheetRef.current && diff > 0) {
      sheetRef.current.style.transform = `translateY(${diff}px)`;
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging || !sheetRef.current) return;
    setIsDragging(false);
    const diff = currentYRef.current - startYRef.current;
    const threshold = sheetRef.current.clientHeight * 0.25;
    sheetRef.current.style.transition = "transform 0.3s ease-out";
    if (diff > threshold) {
      closeSheet();
      sheetRef.current.style.transform = "translateY(100%)";
    } else {
      sheetRef.current.style.transform = "translateY(0)";
    }
  };

  const handleOutsideClick = (e) => {
    if (isOpen && sheetRef.current && !sheetRef.current.contains(e.target)) {
      closeSheet();
    }
  };

  useEffect(() => {
    const handleTouchCancel = () => {
      if (sheetRef.current) {
        sheetRef.current.style.transition = "transform 0.3s ease-out";
        sheetRef.current.style.transform = isOpen
          ? "translateY(0)"
          : "translateY(100%)";
      }
      setIsDragging(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick, {
      passive: true,
    });
    document.addEventListener("touchcancel", handleTouchCancel);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
      document.removeEventListener("touchcancel", handleTouchCancel);
    };
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  useEffect(() => {
    if (sheetRef.current) {
      sheetRef.current.style.transform = isOpen
        ? "translateY(0)"
        : "translateY(100%)";
    }
  }, [isOpen]);
  return (
    <div className="relative">
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40" />
      )}
      <div className="aa">
        <div
          ref={sheetRef}
          className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-lg z-50 transition-transform duration-300 ease-out"
          style={{
            transform: isOpen ? "translateY(0)" : "translateY(100%)",
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex justify-center pt-4 pb-2">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </div>
          <div className="px-4 pb-6 max-h-[70vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                Share Options
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none transition duration-300"
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
              <p className="text-center mb-6 text-gray-700 dark:text-gray-300">
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
                onClick={handlesystemshare}
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

              <div className="grid grid-cols-3 gap-6 w-full h-48">
                {chats?.map((chat) => (
                  <motion.button
                    key={chat.roomid}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={sharing[chat.roomid]}
                    onClick={() => handlechatshare(chat)}
                    className={`bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 p-5 rounded-2xl shadow-md hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none flex flex-col items-center transition duration-300 ${
                      sharing[chat.roomid]
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
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
                      className="rounded-full h-20 object-cover mb-4 shadow-md"
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
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareMenu;
