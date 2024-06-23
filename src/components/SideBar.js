"use client";
import app from "@/lib/firebase/firebaseConfig";
import Link from "next/navigation";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import React, { use, useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  updateDoc,
  increment,
  deleteDoc,
  getFirestore,
  onSnapshot,
  query,
  getDocs,
  arrayRemove,
  arrayUnion,
  collection,
  orderBy,
  desc,
  where,
} from "firebase/firestore";
import "@/externalfn/updatels";
import { useRouter } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
const Modal = dynamic(() => import("@/components/Modal"));
import { useSidebarStore } from "@/app/store/zustand";
const CreatePost = dynamic(() => import("@/components/Createpost"), {
  ssr: false,
});
const CreateReel = dynamic(() => import("@/components/CreateReel"), {
  ssr: false,
});
const navItems = [
  {
    icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z",
    label: "Feed",
    href: "/feed",
  },
  {
    icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
    label: "Explore",
    href: "/feed/explore",
  },
  {
    icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z",
    label: "Reels",
    href: "/feed/reels",
  },
  {
    icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
    label: "Messages",
    href: "/feed/messages",
  },
  {
    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
    label: "Settings",
    href: "/feed/settings",
  },
];
const Notification = dynamic(() => import("@/components/Notification"));
const SideBar = ({ usage, data, currentuserdata }) => {
  // console.log("Sidebaropen", open);
  const currentRoute = usePathname();
  const [profileData, setProfileData] = useState(null);
  const auth = getAuth(app);
  console.log("Current UserData", currentuserdata);
  const [userdata, setUserData] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const router = useRouter();
  const [logoutmodal, setlogoutmodal] = useState(false);
  const [createreelopen, setcreatereelOpen] = useState(false);
  const [createpostopen, setcreatepostOpen] = useState(false);
  const [notifications, setnotificationOpen] = useState([]);
  const [follow, setFollow] = React.useState(false);
  const [notificationfilter, setnotificationfilter] = useState("All");
  const [displayedNotifications, setDisplayedNotifications] = useState([]);
  // all, like, comment, follow, message, reel
  const db = getFirestore(app);
  const {
    isOpen,
    toggle,
    usermetadata,
    enqueueUserMetadata,
    unread,
    setunread,
  } = useSidebarStore();
  const [ismobile, setismobile] = useState(false);
  useEffect(() => {
    if (window.innerWidth <= 768) {
      // useSidebarStore.getState().isOpen = false;
      setismobile(true);
    } else {
      useSidebarStore.getState().isOpen = true;
      setismobile(false);
    }
  }, []);

  const [user, setUser] = useState(auth.currentUser);
  useEffect(() => {
    const getuserdata = async (userEmail, num) => {
      const userRef = doc(db, "users", userEmail);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        console.log("Document data:", docSnap.data());
        if (num === 1) setUserData(docSnap.data());
        if (num === 2) setProfileData(docSnap.data());
      } else {
        console.log("No such document!");
        // Handle the case where user data doesn't exist
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        // Redirect to login screen if user is not logged in
        router.push("/login");
      } else {
        // If the usage is "feed", display the current user's data
        if (usage === "feed") {
          getuserdata(user.email, 1);
        } else {
          // Otherwise, display the primary user's data
          setUserData(data);
          getuserdata(user.email, 2);
          // Get additional data for the primary user
        }
      }
    });

    return () => unsubscribe();
  }, [auth, router, db, user, data]);

  useEffect(() => {
    if (userdata) {
      let unsubscribe;
      const fc = async () => {
        unsubscribe = await displayNotification();
      };
      if (userdata) {
        fc();
      }
      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [userdata]);
  const handlefollow = async (notification) => {
    // Update follow state using the functional form
    try {
      const userRef = doc(db, "users", user.email);
      const currentuserRef = doc(
        db,
        "users",
        usermetadata[notification.sender].email
      );

      // Calculate f based on the previous state

      console.log("adding follow");
      await updateDoc(userRef, {
        followers: arrayUnion(notification.sender),
        followerscount: increment(1),
      });
      await updateDoc(currentuserRef, {
        following: arrayUnion(userdata.uid),
        followingcount: increment(1),
      });
    } catch (error) {
      console.error("Error updating follow status:", error);
      // Handle error appropriately, e.g., show error message to the user
    }
  };
  const handlemessagerouting = (notification) => {
    handledismissnotification(notification);
    toggle();
    if (notification.chattype == "g") {
      router.push(
        `/feed/messages?roomid=${notification.roomid}&chattype=g&chatwindow=${notification.title}`
      );
    } else {
      router.push(
        `/feed/messages?roomid=${notification.roomid}&chattype=p&chatwindow=${notification.sender}`
      );
    }
  };
  const displayNotification = () => {
    if (!userdata) return;
    const notrf = collection(db, "notifications");
    const q = onSnapshot(
      query(
        notrf,
        where("receiver", "==", userdata.uid),
        orderBy("timestamp", "desc")
      ),
      (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === "added") {
            const q = change.doc.data();
            enqueueUserMetadata(q.sender);
            if (Date.now() - q.timestamp < 20000) {
              toast.success("New Notification: ");
              // playSound();
            }
            console.log("New notification: ", change.doc.data());
            const r = notifications;
            r.push(change.doc.data());
            const sortedNotifications = [...r].sort(
              (a, b) => b.timestamp - a.timestamp
            );
            setnotificationOpen(sortedNotifications);
          }
          if (change.type === "modified") {
            console.log("Modified notification: ", change.doc.data());
          }
          if (change.type === "removed") {
            console.log("Removed notification: ", change.doc.data());
            setnotificationOpen((prev) =>
              prev.filter((item) => item.id !== change.doc.data().id)
            );
          }
        });
      }
    );
  };
  useEffect(() => {
    setDisplayedNotifications(notifications);
    setnotificationfilter("All");
    console.log("Notifications: ", notifications);
    const sortedNotifications = [...notifications].sort(
      (a, b) => b.timestamp - a.timestamp
    );
    setunread(sortedNotifications.length);
  }, [notifications]);
  const handledismissnotification = async (notification) => {
    try {
      setnotificationOpen((prev) =>
        prev.filter((item) => item.id !== notification.id)
      );
      const notrf = collection(db, "notifications");
      const q = query(
        notrf,
        where("receiver", "==", userdata.uid),
        where("sender", "==", notification.sender),
        where("text", "==", notification.text),
        where("type", "==", notification.type)
      );
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });

      toast.success("Notification dismissed");
    } catch (error) {
      console.error("Error removing notification:", error);
      // Handle error appropriately, e.g., show error message to the user
    }
  };
  const handleclearallnotifications = async () => {
    try {
      setnotificationOpen([]);
      const notrf = collection(db, "notifications");
      const q = query(notrf, where("receiver", "==", userdata.uid));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });
      toast.success("All Notifications dismissed");
    } catch (error) {
      console.error("Error removing notification:", error);
      // Handle error appropriately, e.g., show error message to the user
    }
  };
  function convertToChatTime(timestamp) {
    const now = new Date();
    const messageDate = new Date(timestamp);

    // Check if messageDate is today or yesterday
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (messageDate >= today) {
      const hour = messageDate.getHours().toString().padStart(2, "0"); // Format the hour to ensure it's always two digits
      const minute = messageDate.getMinutes().toString().padStart(2, "0"); // Format the minute to ensure it's always two digits
      return `Today at ${hour}:${minute}`;
    } else if (messageDate >= yesterday) {
      const hour = messageDate.getHours().toString().padStart(2, "0"); // Format the hour to ensure it's always two digits
      const minute = messageDate.getMinutes().toString().padStart(2, "0"); // Format the minute to ensure it's always two digits
      return `Yesterday at ${hour}:${minute}`;
    } else {
      const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const day = days[messageDate.getDay()];
      const formattedDate = messageDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const hour = messageDate.getHours().toString().padStart(2, "0"); // Format the hour to ensure it's always two digits
      const minute = messageDate.getMinutes().toString().padStart(2, "0"); // Format the minute to ensure it's always two digits
      return `${day}, ${formattedDate} at ${hour}:${minute}`;
    }
  }
  // const [animationClass, setAnimationClass] = useState("");

  // useEffect(() => {
  //   setAnimationClass(isOpen ? "slide-in-right" : "slide-out-right");
  // }, [isOpen]);
  // Listen for animation end event to set isAnimationComplete to true
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  const handleAnimationEnd = () => {
    setIsAnimationComplete(true);
    console.log("Animation complete");
  };
  const logout = () => {
    auth.signOut().then(() => {
      // Sign-out successful.
      router.push("/login");
    });
  };

  // When the animation is complete and the sidebar is closed, set isAnimationComplete back to false
  useEffect(() => {
    if (!isOpen && isAnimationComplete) {
      setTimeout(() => {
        setIsAnimationComplete(false);
      }, 300);
    }
    console.log(isAnimationComplete + " " + isOpen);
  }, [isOpen, isAnimationComplete]);
  useEffect(() => {
    console.log("Notification Filter: ", notificationfilter);
    setDisplayedNotifications(
      notifications.filter((notification) => {
        if (notificationfilter === "All") return true;
        if (notificationfilter === "Like" && notification.type === "like")
          return true;
        if (notificationfilter === "Comment" && notification.type === "comment")
          return true;
        if (notificationfilter === "Follow" && notification.type === "Follow")
          return true;
        if (notificationfilter === "Message" && notification.type === "message")
          return true;

        return false;
      })
    );
  }, [notificationfilter]);
  const filters = [
    { name: "All", icon: "M4 6h16M4 12h16M4 18h16" },
    {
      name: "Like",
      icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
    },
    {
      name: "Comment",
      icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
    },
    {
      name: "Follow",
      icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
    },
    {
      name: "Message",
      icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    },
  ];
  const handlenotifollow = async (notification, action) => {
    if (action == "confirm") {
      await handlefollow(notification);
    }
    handledismissnotification(notification);
  };
  return (
    <>
      {/* {open && ( */}
      {logoutmodal && (
        <Modal
          open={logoutmodal}
          title={"Logout"}
          setShowModal={setlogoutmodal}
          type={"logout"}
          handleDelete={logout}
          content="Are you sure u want to logout ?"
          onClose={() => setlogoutmodal(false)}
        />
      )}
      <div
        className={`lp w-screen   overflow-hidden  h-dvh lg:h-full lg:mr-5 b  lg:w-1/3 sidebar ${
          ismobile && "fixed top-0"
        } ${isOpen ? "slide-in-right " : "slide-out-right "} ${
          !isAnimationComplete && !isOpen && "hidden"
        }`}
        onAnimationEnd={handleAnimationEnd}
      >
        <div
          className="bg-white -mt-5  h-full z-50 pb-24 backdrop-blur-md   oveflow-hidden  dark:bg-black rounded-xl 
        shadow-2xl border-1 border-black lpo"
        >
          <div className="md:hidden">
            <div className="flex justify-between mt-5 mx-2">
              <div className="bg-gradient-to-r from-purple-500 via-fuchsia-400 to-pink-400 text-4xl inline-block text-transparent bg-clip-text font-lucy">
                Muse
              </div>
              <div className="ss ">
                <button onClick={() => setlogoutmodal(true)}>
                  <Image
                    src="/icons/exit.png"
                    alt="Logout"
                    className="dark:invert w-7 h-7 mr-2"
                    height={50}
                    width={50}
                  />
                </button>
                <button onClick={toggle} className="relative">
                  <Image
                    src="/icons/sidebar.png"
                    height={50}
                    width={50}
                    className="w-7 h-7"
                    alt="Sidebar"
                  />
                  <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-1 text-xs">
                    {unread}
                  </span>
                </button>
              </div>
            </div>
          </div>
          {createpostopen && (
            <CreatePost
              onClose={() => setcreatepostOpen(!createpostopen)}
              userdata={userdata}
              usermetadata={usermetadata}
              enqueueUserMetadata={enqueueUserMetadata}
            />
          )}
          {createreelopen && (
            <CreateReel
              onClose={() => setcreatereelOpen(!createreelopen)}
              userdata={userdata}
              usermetadata={usermetadata}
              enqueueUserMetadata={enqueueUserMetadata}
            />
          )}
          {userdata && (
            <div className="main1 h-full  flex flex-col justify-between items-center">
              {!ismobile ? (
                <>
                  <div className="flex justify-center">
                    <div className="pfp my-4">
                      <Image
                        onClick={() => {
                          toggle();
                          router.push(`/feed/profile/${userdata.userName}`);
                        }}
                        className="rounded-full h-24 object-cover w-24 cursor-pointer hover:opacity-80"
                        src={userdata.pfp}
                        width={100}
                        height={100}
                        alt=""
                      />
                    </div>
                  </div>
                  <div className="usernamw text-center font-bold text-2xl">
                    {userdata.userName}
                  </div>

                  <div className="bio text-center opacity-80 my-5">
                    {userdata.bio}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-center">
                    <div className="pfp my-4">
                      <Image
                        onClick={() => {
                          toggle();
                          router.push(`/feed/profile/${userdata.userName}`);
                        }}
                        className="rounded-full h-24 object-cover w-24 mr-5 cursor-pointer hover:opacity-80"
                        src={userdata.pfp}
                        width={100}
                        height={100}
                        alt=""
                      />
                    </div>
                    <div className="dsd">
                      <div className="usernamw mt-5 font-bold text-2xl">
                        {userdata.userName}
                      </div>

                      <div className="bio  opacity-80 my-2">{userdata.bio}</div>
                    </div>
                  </div>
                </>
              )}
              <div className="flex justify-between ml-2">
                <div className="followers text-center w-16">
                  <div className="text-2xl  font-bold">
                    {userdata.followers.length}
                  </div>
                  <div className="text-sm mr-6 opacity-70">Followers</div>
                </div>
                <div className="following text-center w-16">
                  <div className="text-2xl font-bold">
                    {userdata.following.length}
                  </div>
                  <div className="text-sm opacity-70">Following</div>
                </div>
                <div className="ml-6 posts">
                  <div className="text-2xl font-bold w-16">
                    {userdata.posts.length}
                  </div>
                  <div className="text-sm -ml-2 opacity-70">Posts</div>
                </div>
              </div>
              {userdata &&
                profileData &&
                userdata.email !== profileData.email && (
                  <div className="flex my-6 justify-center">
                    <button
                      className="bg-blue-600 text-xl rounded-xl p-3 shadow-2xl backdrop-blur-lg hover:opacity-90"
                      onClick={() => handlefollow()}
                    >
                      {follow ? "Following" : "Follow"}
                    </button>
                  </div>
                )}
              {usage == "feed" && (
                <div className="h-full w-full ">
                  {/* <div className="options hidden md:flex mb-5 justify-evenly items-center flex-auto mt-10">
                    <div className="explore">
                      <div
                        className="text-2xl text-left dark:invert font-bold transform-gpu hover:scale-110 cursor-pointer"
                        onClick={() => router.push("/feed")}
                      >
                        <Image
                          className="h-8 w-8"
                          src="/icons/category.png"
                          width={100}
                          height={100}
                          alt=""
                        />
                      </div>
                    </div>
                    <div className="explore">
                      <div
                        className="text-2xl font-bold cursor-pointer transform-gpu hover:scale-110 dark:invert"
                        onClick={() => router.push("/feed/explore")}
                      >
                        <Image
                          className="h-8 w-8"
                          src="/icons/direction.png"
                          width={100}
                          height={100}
                          alt=""
                        />
                      </div>
                    </div>
                    <div className="Reels">
                      <div
                        className="text-2xl cursor-pointer font-bold transform-gpu hover:scale-110 text-center dark:invert"
                        onClick={() => router.push("/feed/reels")}
                      >
                        <Image
                          className="h-8 w-8"
                          src="/icons/video.png"
                          width={100}
                          height={100}
                          alt=""
                        />
                      </div>
                    </div>
                    <div className="messages">
                      <div
                        className="text-2xl font-bold text-center transform-gpu hover:scale-110 cursor-pointer dark:invert"
                        onClick={() => {
                          router.push("/feed/messages");
                        }}
                      >
                        <Image
                          className="h-8 w-8"
                          src="/icons/conversation.png"
                          width={100}
                          height={100}
                          alt=""
                        />
                      </div>
                    </div>
                    <div className="settings cursor-pointer">
                      <div
                        className="text-2xl font-bold cursor-pointer transform-gpu hover:scale-110 text-center dark:invert"
                        onClick={() => router.push("/feed/settings")}
                      >
                        <Image
                          className="h-8 w-8"
                          src="/icons/setting.png"
                          width={100}
                          height={100}
                          alt=""
                        />
                      </div>
                    </div>
                  </div> */}
                  <nav
                    className={`hidden md:flex  bg-white dark:bg-black z-40`}
                  >
                    <div className="w-full px-10">
                      <div className="flex justify-between py-3">
                        {navItems.map((item) => {
                          const isActive = currentRoute === item.href;
                          return (
                            <motion.div
                              key={item.label}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <button
                                key={item.label}
                                onClick={() => {
                                  router.push(item.href);
                                }}
                                className={`flex rounded-full  group focus:outline-none ${
                                  isActive
                                    ? "bg-fuchsia-500 "
                                    : "bg-neutral-100 dark:bg-feedheader"
                                }`}
                                aria-label={item.label}
                              >
                                <div
                                  className={`p-2 rounded-full bg-transparent ${
                                    isActive
                                      ? "bg-fuchsia-100 dark:bg-fuchsia-500"
                                      : "group-hover:bg-gray-100 dark:group-hover:bg-gray-800"
                                  } transition duration-200`}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={`h-7 w-7 transition duration-200 ${
                                      isActive
                                        ? "text-white dark:text-white"
                                        : "text-gray-500 dark:text-gray-400 group-hover:text-fuchsia-400 dark:group-hover:text-fuchsia-500"
                                    }`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d={item.icon}
                                    />
                                  </svg>
                                </div>
                              </button>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  </nav>
                  <div className="notif p-2 h-4/5  scroll-smooth  ">
                    <div
                      className="heading sticky top-0 
                  "
                    >
                      <div className="flex justify-between">
                        {" "}
                        <Image
                          className="dark:invert ml-2"
                          src="/icons/notification.png"
                          width={20}
                          height={20}
                          alt="Notification"
                        />
                        {notifications.length > 0 && (
                          <div
                            className="df cursor-pointer"
                            onClick={() => handleclearallnotifications()}
                          >
                            <Image
                              className="mr-2 dark:invert"
                              src="/icons/clear.png"
                              width={20}
                              height={20}
                              alt="Clear ALL"
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex justify-center mt-4 space-x-5 rounded-lg ">
                        {filters.map((filter) => (
                          <motion.div
                            key={filter.name}
                            className={`flex items-center space-x-2  cursor-pointer p-2 rounded-full ${
                              notificationfilter === filter.name
                                ? "bg-fuchsia-500 text-white"
                                : "bg-neutral-100  dark:text-gray-400 dark:bg-feedheader"
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setnotificationfilter(filter.name)}
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
                                d={filter.icon}
                              />
                            </svg>
                            {/* <span className="text-sm font-medium">
                              {filter.name}
                            </span> */}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col shadow-md bg-slate-100 dark:bg-feedheader p-2 rounded-3xl mt-4 h-4/5 md:h-3/5 scroll-smooth  overflow-y-auto">
                      {displayedNotifications.length == 0 && (
                        <div className="text-center mt-10">
                          No Notifications
                        </div>
                      )}
                      {displayedNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="cursor-pointer  bg-white dark:bg-black shadow-xl dark:shadow shadow-fuchsia-200 justify-between rounded-3xl bg-transparent p-5 my-2"
                        >
                          {usermetadata[notification.sender] && (
                            <div className="d flex w-full">
                              <div className="flex justify-between w-full ">
                                <Image
                                  src={usermetadata[notification.sender].pfp}
                                  width={50}
                                  height={50}
                                  alt="profile"
                                  className="rounded-full h-10 w-12"
                                />
                                <div className="dfdsf px-5 w-full">
                                  <div className="flex justify-between w-full">
                                    <div className="text-sm  font-semibold opacity-75">
                                      {
                                        usermetadata[notification.sender]
                                          .userName
                                      }
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {convertToChatTime(
                                        notification.timestamp
                                      )}
                                    </div>
                                  </div>

                                  {usermetadata[notification.sender] && (
                                    <div>
                                      {notification.type == "Follow" && (
                                        <div>
                                          {
                                            usermetadata[notification.sender]
                                              .userName
                                          }{" "}
                                          has requested to follow you.
                                          <div
                                            className="btn"
                                            onClick={() =>
                                              handlenotifollow(
                                                notification,
                                                "confirm"
                                              )
                                            }
                                          >
                                            Confirm
                                          </div>
                                          <div
                                            className="btn"
                                            onClick={() =>
                                              handlenotifollow(
                                                notification,
                                                "reject"
                                              )
                                            }
                                          >
                                            Reject
                                          </div>
                                        </div>
                                      )}
                                      {notification.type == "message" &&
                                        notification.messagetype == "media" && (
                                          <div
                                            className=" flex pt-2"
                                            onClick={() => {
                                              handlemessagerouting(
                                                notification
                                              );
                                            }}
                                          >
                                            <div className="text pt-2 ">
                                              {
                                                usermetadata[
                                                  notification.sender
                                                ].userName
                                              }{" "}
                                              sent you a media file
                                            </div>
                                            <Image
                                              className="rounded-xl h-10 w-10"
                                              src={notification.text[0]}
                                              alt="Media File"
                                              height={100}
                                              width={100}
                                            />
                                          </div>
                                        )}
                                      {notification.type == "message" &&
                                        notification.messagetype == "gif" && (
                                          <div
                                            className=" flex pt-2"
                                            onClick={() => {
                                              handlemessagerouting(
                                                notification
                                              );
                                            }}
                                          >
                                            <Image
                                              className="rounded-xl h-10 w-10"
                                              src={notification.text}
                                              alt="Media File"
                                              height={100}
                                              width={100}
                                            />
                                            <div className="text pt-2 ml-4">
                                              {
                                                usermetadata[
                                                  notification.sender
                                                ].userName
                                              }{" "}
                                              sent you a media file
                                            </div>
                                          </div>
                                        )}
                                      {notification.type == "message" && (
                                        <div
                                          className="pl"
                                          onClick={() => {
                                            handlemessagerouting(notification);
                                          }}
                                        >
                                          {notification.messagetype ==
                                            "text" && (
                                            <div className="text">
                                              {notification.text.length > 100
                                                ? notification.text.slice(
                                                    0,
                                                    100
                                                  ) + "..."
                                                : notification.text}
                                            </div>
                                          )}
                                          <div className="text-xs"></div>
                                        </div>
                                      )}
                                      {notification.subtype == "reellike" && (
                                        <div
                                          className="q"
                                          onClick={() =>
                                            router.push(
                                              `/feed/reels?reelid=${notification.reelid}`
                                            )
                                          }
                                        >
                                          {usermetadata[
                                            notification.sender
                                          ] && (
                                            <>
                                              <div className="text-sm">
                                                {
                                                  usermetadata[
                                                    notification.sender
                                                  ].userName
                                                }{" "}
                                                liked your Reel
                                              </div>
                                              <div className="text-xs"></div>
                                            </>
                                          )}
                                        </div>
                                      )}
                                      {notification.type == "comment" &&
                                        notification.subtype ==
                                          "reelcomment" && (
                                          <div
                                            className="q"
                                            onClick={() =>
                                              router.push(
                                                `/feed/reels?reelid=${notification.reelid}`
                                              )
                                            }
                                          >
                                            {usermetadata[
                                              notification.sender
                                            ] && (
                                              <>
                                                <div className="text-sm">
                                                  {
                                                    usermetadata[
                                                      notification.sender
                                                    ].userName
                                                  }{" "}
                                                  commented on your Reel
                                                </div>
                                                <div className="text-xs"></div>
                                              </>
                                            )}
                                          </div>
                                        )}
                                      {notification.type == "comment" &&
                                        notification.subtype ==
                                          "commentpost" && (
                                          <div
                                            className="q"
                                            onClick={() =>
                                              router.push(
                                                `/feed/profile/${
                                                  usermetadata[
                                                    notification?.owner
                                                  ].userName
                                                }?postid=${notification.postid}`
                                              )
                                            }
                                          >
                                            {usermetadata[
                                              notification.sender
                                            ] && (
                                              <>
                                                <div className="text-sm">
                                                  {
                                                    usermetadata[
                                                      notification.sender
                                                    ].userName
                                                  }{" "}
                                                  commented on your Post
                                                </div>
                                                <div className="text-xs"></div>
                                              </>
                                            )}
                                          </div>
                                        )}
                                    </div>
                                  )}
                                </div>
                                <div className="">
                                  <div
                                    className="sd ml-3 -mt-1 cursor-pointer"
                                    onClick={() =>
                                      handledismissnotification(notification)
                                    }
                                  >
                                    X
                                  </div>
                                  <div className="type ">
                                    {notification.type == "like" && (
                                      <div className="text-xs">
                                        <Image
                                          src="/icons/like.png"
                                          height={50}
                                          width={50}
                                          className="dark:invert h-7 w-10 "
                                          alt="Like"
                                        />
                                      </div>
                                    )}
                                    {notification.type == "comment" && (
                                      <div className="text-xs">
                                        <Image
                                          src="/icons/comment.png"
                                          alt="Comment"
                                          height={50}
                                          className=" h-7 w-10"
                                          width={50}
                                        />
                                      </div>
                                    )}
                                    {notification.type == "follow" && (
                                      <div className="text-xs">
                                        <Image
                                          src="/icons/add.png"
                                          height={50}
                                          width={50}
                                          className="dark:invert h-10 w-10"
                                          alt="Add"
                                        />
                                      </div>
                                    )}
                                    {notification.type == "message" && (
                                      <div className="text-xs">
                                        <Image
                                          src="/icons/message.svg"
                                          height={50}
                                          className="dark:invert h-10 w-10"
                                          width={50}
                                          alt="Message"
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div className="s fixed bottom-0 opacity-75 md:opacity-95">
                <div className="okedoesd flex w-full justify-evenly  text-sm">
                  <div
                    className="md:-ml-5 font-bold text-center cursor-pointer "
                    onClick={() => router.push("/contactus")}
                  >
                    Contact Us
                  </div>
                  {!ismobile && (
                    <div
                      className="font-bold text-center cursor-pointer"
                      onClick={logout}
                    >
                      Logout
                    </div>
                  )}
                  <div className="about">
                    <div
                      className=" font-bold text-center cursor-pointer"
                      onClick={() => router.push("/about")}
                    >
                      About
                    </div>
                  </div>
                </div>
                <div
                  className="pl text-xs text-center cursor-pointer "
                  onClick={() => router.push("/releasenotes")}
                >
                  Muse v{process.env.NEXT_PUBLIC_VERSION} beta @NoFilter LLC
                  2024-2025
                </div>
                <div
                  className="sdwef cursor-pointer underline text-center text-xs"
                  onClick={() => router.push("/tcs")}
                >
                  Terms and Conditions
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* )} */}
    </>
  );
};
export default SideBar;
