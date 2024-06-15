"use client";
import React, { useEffect, useState } from "react";
import "../styles/gradients.css";
import "../styles/feed.css";
import app from "@/lib/firebase/firebaseConfig";
import SideBar from "../../components/SideBar";
import Bottomnav from "../../components/Bottomnav";
import Notification from "../../components/Notification";
import { getFirestore } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { useSidebarStore } from "../store/zustand";

const Layout = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const { enqueueUserMetadata } = useSidebarStore();
  const [nottype, setNottype] = useState(false);
  const [notysound, setNotysound] = useState(null);

  useEffect(() => {
    const audio = new Audio("/sounds/inbox.mp3");
    setNotysound(audio);
  }, []);

  const playSound = () => {
    if (notysound) {
      notysound.play().catch((error) => console.log("Error playing sound:", error));
    }
  };

  const displayNotification = (message) => {
    playSound();
    setNotifications((prev) => [...prev, { message }]);

    setTimeout(() => {
      setNotifications((prev) => prev.slice(1));
    }, 10000); // Clear notification after 10 seconds
  };

  const displayUnreadNotificationSummary = (count) => {
    setNottype(true);
    setNotifications((prev) => [
      ...prev,
      { text: `You have ${count} unread notifications` },
    ]);

    setTimeout(() => {
      setNotifications((prev) => prev.slice(1));
    }, 10000); // Clear notification after 10 seconds
  };

  useEffect(() => {
    const auth = getAuth(app);
    const db = getFirestore(app);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const notrf = collection(db, "notifications");
        const q = onSnapshot(
          query(
            notrf,
            where("receiver", "==", user.uid),
            orderBy("timestamp", "desc")
          ),
          (snapshot) => {
            let unreadCount = 0;
            snapshot.docChanges().forEach(async (change) => {
              if (change.type === "added") {
                const notification = change.doc.data();
                enqueueUserMetadata(notification.sender);
                if (Date.now() - notification.timestamp < 20000) {
                  displayNotification(notification); // Display real-time notification
                } else {
                  unreadCount += 1;
                }
                console.log("New notification: ", notification);
              }
              if (change.type === "modified") {
                console.log("Modified notification: ", change.doc.data());
              }
              if (change.type === "removed") {
                console.log("Removed notification: ", change.doc.data());
                setNotifications((prev) =>
                  prev.filter((item) => item.id !== change.doc.data().id)
                );
              }
            });

            if (unreadCount > 0) {
              displayUnreadNotificationSummary(unreadCount);
            }
          }
        );
      }
    });

    return () => unsubscribe();
  }, [enqueueUserMetadata]);

  return (
    <div className="h-dvh overflow-hidden w-screen flex items-center font-rethink relative text-black">
      <div className="main tndmain w-screen bg-transparent dark:bg-transparent dark:text-white rounded-2xl lg:mx-4 align-middle max-w-none">
        <div className="flex h-full">
          <SideBar usage={"feed"} />
          <Bottomnav />
          {children}
        </div>
      </div>
      {notifications.map((msg, index) => (
        <Notification
          key={index}
          data={msg}
          unread={nottype}
          onDismiss={() => {}}
        />
      ))}
    </div>
  );
};

export default Layout;
