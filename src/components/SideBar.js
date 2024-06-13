"use client";
import app from "@/lib/firebase/firebaseConfig";
import Link from "next/navigation";
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
const Notification = dynamic(() => import("@/components/Notification"));
const SideBar = ({ usage, data, currentuserdata }) => {
  // console.log("Sidebaropen", open);

  const [profileData, setProfileData] = useState(null);
  const auth = getAuth(app);
  console.log("Current UserData", currentuserdata);
  const [userdata, setUserData] = useState(null);
  const router = useRouter();
  const [logoutmodal, setlogoutmodal] = useState(false);
  const [createreelopen, setcreatereelOpen] = useState(false);
  const [createpostopen, setcreatepostOpen] = useState(false);
  const [notifications, setnotificationOpen] = useState([]);
  const [follow, setFollow] = React.useState(false);
  const db = getFirestore(app);
  const { isOpen, toggle, usermetadata, enqueueUserMetadata } =
    useSidebarStore();
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
  const playSound = () => {
    notysound.play(); // Play the audio
  };
  const [notysound, setAudio] = useState(null);
  useEffect(() => {
    setAudio(new Audio("/sounds/inbox.mp3"));
    // only run once on the first render on the client
  }, []);
  const checkfollow = () => {
    if (userdata && data && userdata.followers.includes(profileData.uid)) {
      console.log("checkfollow running..." + true);
      return true;
    } else return false;
  };
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
    const hjk = async () => {
      if (userdata && profileData && userdata.email != profileData.email) {
        const userref = doc(db, "users", userdata.email);
        const temp = await getDoc(userref);
        const profileref = doc(db, "users", profileData.email);
        const temp1 = await getDoc(profileref);
        if (temp.exists()) {
          setUserData(temp.data());
        }
        if (temp1.exists()) {
          setProfileData(temp1.data());
        }
        // const arr=analyzeColors(userdata.pfp);
        // console.log(arr);
      }
    };
    hjk();
  }, [follow]);
  useEffect(() => {
    if (userdata && profileData) {
      setFollow(checkfollow());
    }
  }, [userdata, profileData]);
  const handleLogout = () => {
    auth.signOut().then(() => {
      // Sign-out successful.
      router.push("/login");
    });
  };

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
  const handlefollow = async () => {
    // Update follow state using the functional form
    try {
      const f = !follow;
      const userRef = doc(db, "users", userdata.email);
      const currentuserRef = doc(db, "users", user.email);

      // Calculate f based on the previous state

      if (f) {
        console.log("adding follow");
        await updateDoc(userRef, {
          followers: arrayUnion(profileData.uid),
          followerscount: increment(1),
        });
        await updateDoc(currentuserRef, {
          following: arrayUnion(userdata.uid),
          followingcount: increment(1),
        });
      } else {
        console.log("removing follow");
        await updateDoc(userRef, {
          followers: arrayRemove(profileData.uid),
          followerscount: increment(-1),
        });
        await updateDoc(currentuserRef, {
          following: arrayRemove(userdata.uid),
          followingcount: increment(-1),
        });
      }
      console.log(f);
      setFollow(f);
    } catch (error) {
      console.error("Error updating follow status:", error);
      // Handle error appropriately, e.g., show error message to the user
    }
  };
  const handlemessagerouting = (notification) => {
    handledismissnotification(notification);
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
              playSound();
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
    console.log("Notifications: ", notifications);
    const sortedNotifications = [...notifications].sort(
      (a, b) => b.timestamp - a.timestamp
    );
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
        className={`lp w-screen  h-dvh lg:h-full   lg:w-1/3 z-50 ${
          ismobile && "absolute"
        } ${isOpen ? "slide-in-right " : "slide-out-right "} ${
          !isAnimationComplete && !isOpen && "hidden"
        }`}
        onAnimationEnd={handleAnimationEnd}
      >
        <div className="bg-white pt-5 h-dvh z-50 pb-24 oveflow-hidden dark:bg-black rounded-xl md:bg-clip-padding md:backdrop-filter md:backdrop-blur-3xl md:bg-opacity-40 shadow-2xl border-1 border-black lpo">
          <div className="md:hidden">
            <div className="flex justify-between mt-5 mx-2">
              <div className="fg font-lucy text-4xl">Muse</div>
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
                <button onClick={toggle}>
                  <Image
                    src="/icons/sidebar.png"
                    height={50}
                    width={50}
                    className="dark:invert w-7 h-7"
                    alt="Sidebar"
                  />
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
              <div className="hidden md:flex text-4xl my-2 lg:text-6xl font-lucy text-center lg:mt-6 lg:mb-8">
                Muse
              </div>
              {!ismobile ? (
                <>
                  <div className="flex justify-center">
                    <div className="pfp my-4">
                      <Image
                        onClick={() =>
                          router.push(`/feed/profile/${userdata.userName}`)
                        }
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
                        onClick={() =>
                          router.push(`/feed/profile/${userdata.userName}`)
                        }
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
                  <div className="text-sm mr-6">Followers</div>
                </div>
                <div className="following text-center w-16">
                  <div className="text-2xl font-bold">
                    {userdata.following.length}
                  </div>
                  <div className="text-sm">Following</div>
                </div>
                <div className="ml-6 posts">
                  <div className="text-2xl font-bold w-16">
                    {userdata.posts.length}
                  </div>
                  <div className="text-sm -ml-2">Posts</div>
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
                  <div className="options hidden md:flex mb-5 justify-evenly items-center flex-auto mt-10">
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
                  </div>
                  <div className="notif p-4  scroll-smooth  overflow-y-auto ">
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
                    </div>
                    <div className="flex flex-col h-80  lg:h-96 overflow-y-auto">
                      {notifications.length == 0 && (
                        <div className="text-center mt-10">
                          No Notifications
                        </div>
                      )}
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="cursor-pointer backdrop-filter backdrop-blur-2xl bg-opacity-50 bg-feedheader shadow-lg justify-between rounded-xl bg-transparent p-5 my-2"
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
                                            <Image
                                              className="rounded-xl h-10 w-10"
                                              src={notification.text[0]}
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
                                      {notification.type == "reellike" && (
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
                                          className="dark:invert h-10 w-10"
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
                                          className="dark:invert h-10 w-10"
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
                                    {notification.type == "reellike" && (
                                      <div className="text-xs">
                                        <Image
                                          src="/icons/like.png"
                                          alt=""
                                          className="dark:invert h-10 w-10"
                                          height={50}
                                          width={50}
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
              <div className="s fixed bottom-0">
                {(currentuserdata || usage == "feed") && (
                  <div className="flex w-full  ">
                    {usage == "feed" && (
                      <button
                        className="create btn px-6 py-2 font-rethink mb-4 mr-5"
                        onClick={() => setcreatereelOpen(true)}
                        disabled={createreelopen}
                      >
                        Create a Reel
                      </button>
                    )}
                    {usage == "feed" && (
                      <button
                        className="create btn px-6 py-2 font-rethink mb-4 "
                        onClick={() => setcreatepostOpen(true)}
                        disabled={createpostopen}
                      >
                        Create a Post
                      </button>
                    )}
                  </div>
                )}
                <div className="okedoesd flex w-full justify-evenly  text-sm">
                  <div
                    className=" font-bold text-center cursor-pointer "
                    onClick={() => router.push("/contactus")}
                  >
                    Contact Us
                  </div>
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
                  className="pl text-xs text-center cursor-pointer mb-4"
                  onClick={() => router.push("/releasenotes")}
                >
                  Muse v{process.env.NEXT_PUBLIC_VERSION} beta @NoFilter LLC
                  2024-2025
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
