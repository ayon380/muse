"use client";
import app from "@/lib/firebase/firebaseConfig";
import React, { use, useEffect, useState } from "react";
import {
  deleteUser,
  getAuth,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import "../../styles/gradients.css";
import "../../styles/feed.css";
import {
  collection,
  getDocs,
  limit,
  query,
  where,
  arrayUnion,
  orderBy,
  updateDoc,
  setDoc,
  addDoc,
} from "firebase/firestore";
import { deleteDoc } from "firebase/firestore";
import { getStorage, deleteObject } from "firebase/storage";
import Image from "next/image";
import { ref } from "firebase/storage";
import { getFirestore, getDoc, doc } from "firebase/firestore";
import dynamic from "next/dynamic";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
const Home = () => {
  const auth = getAuth(app);
  const [user, setUser] = useState(auth.currentUser);
  const storage = getStorage(app);
  const [createpostmenu, setcreatepostmenu] = useState(false);
  const router = useRouter();
  const [userdata, setUserData] = useState(null);
  const db = getFirestore(app);
  const [searchResults, setSearchResults] = useState([]);
  const [roomid, setRoomid] = useState("");
  const [chatwindow, setChatwindow] = useState("none");
  const [searchtext, setSearchtext] = useState("");
  const [chatloading, setChatloading] = useState(false);
  const [chprevchat, setchprevchat] = useState(false);
  const [followingusersdata, setFollowingUsersdata] = useState([]);
  const getfollowingusers = async () => {
    try {
      if (userdata) {
        const followingusers = [];
        console.log("getfollowingusers runningg.........");
        for (let i = 0; i < userdata.followingcount; i++) {
          const userRef = doc(db, "username", userdata.following[i]);
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            followingusers.push(docSnap.data());
          }
        }
        console.log(followingusers);
        setFollowingUsersdata(followingusers);
      }
    } catch (error) {
      toast.error("Error " + error.message);
    }
  };
  const searchUsers = async () => {
    try {
      console.log("Searching users..." + searchtext);

      // Query for userName
      const userNameQuery = query(
        collection(db, "username"),
        where("userName", ">=", searchtext),
        orderBy("userName"),
        limit(5)
      );
      const userNameSnapshot = await getDocs(userNameQuery);

      // Query for fullname
      const fullNameQuery = query(
        collection(db, "username"),
        where("fullname", ">=", searchtext),
        orderBy("fullname"),
        limit(5)
      );
      const fullNameSnapshot = await getDocs(fullNameQuery);

      // Combine results
      const results = [];
      userNameSnapshot.forEach((doc) => {
        results.push({ ...doc.data() });
      });
      fullNameSnapshot.forEach((doc) => {
        const data = doc.data();
        if (!results.some((result) => result.userName === data.userName)) {
          results.push(data);
        }
      });

      console.log("Search results:", results);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const getuserdata = async (currentUser) => {
    const userRef = doc(db, "users", currentUser.email);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      console.log("Document data:", docSnap.data());
      setUserData(docSnap.data());
    } else {
      console.log("No such document!");
      // Handle the case where user data doesn't exist
    }
  };
  const handleCreatePost = () => {
    setcreatepostmenu(!createpostmenu);
  };
  useEffect(() => {
    checkprevchat();
  }, [chatwindow]);
  useEffect(() => {
    getfollowingusers();
  }, [userdata]);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        // Redirect to login screen if user is not logged in
        router.push("/login");
      } else {
        getuserdata(user);
      }
    });
    return () => unsubscribe();
  }, [auth, router]);
  useEffect(() => {
    if (searchtext.length > 0) {
      searchUsers();
    } else {
      setSearchResults([]);
    }
  }, [searchtext]);
  const checkprevchat = async () => {
    console.log("Checking previous chat...");
    setChatloading(true);
    if (userdata) {
      try {
        // Construct the query to find the chat document where the current user is a participant
        const currentUserChatQuery = query(
          collection(db, "messagerooms"),
          where("type", "==", "p"),
          where("participants", "array-contains", userdata.userName)
        );

        // Execute the query for the current user
        const currentUserQuerySnapshot = await getDocs(currentUserChatQuery);

        // Construct the query to find the chat document where the chat window user is a participant
        const chatWindowChatQuery = query(
          collection(db, "messagerooms"),
          where("type", "==", "p"),
          where("participants", "array-contains", chatwindow)
        );

        // Execute the query for the chat window user
        const chatWindowQuerySnapshot = await getDocs(chatWindowChatQuery);

        // Combine the results of both queries
        const currentUserChatDocs = currentUserQuerySnapshot.docs;
        const chatWindowChatDocs = chatWindowQuerySnapshot.docs;

        // Check if there's any document that exists in both result sets
        const commonChatDocs = currentUserChatDocs.filter((doc) => {
          return chatWindowChatDocs.some((otherDoc) => otherDoc.id === doc.id);
        });
        if (commonChatDocs.length > 0)
          console.log("Common Chat Docs: ", commonChatDocs[0].id);
        else console.log("No common chat docs found");
        // Set chPrevChat based on whether common chat documents were found
        setchprevchat(commonChatDocs.length > 0);
      } catch (error) {
        console.error("Error checking previous chat:", error);
        // Handle the error
      }
      setChatloading(false);
    } else {
      setchprevchat(false);
    }
  };

  const startchat = async () => {
    try {
      if (userdata) {
        if (!chprevchat) {
          console.log("Previous chat not found... Creating Chat");
          const msgroomref = collection(db, "messagerooms");
          const msgroomdata = {
            title: "",
            type: "p",
            participants: [userdata.userName, chatwindow],
            messages: [],
            timestamp: Date.now(),
          };
          const msgroomdoc = await addDoc(msgroomref, msgroomdata);
          const id = msgroomdoc.id;
          console.log("Room Id: " + id);
          const chatref = doc(db, "chats", userdata.userName);
          const chatSnapshot = await getDoc(chatref);
          console.log("User Chat Snapshot:", chatSnapshot.data()); // Log user chat document

          if (chatSnapshot.exists()) {
            console.log("Updating user's chat document");
            await updateDoc(chatref, {
              rooms: arrayUnion(id),
            });
          } else {
            console.log("Creating user's chat document");
            await setDoc(chatref, {
              rooms: [id],
            });
          }

          const chatref1 = doc(db, "chats", chatwindow);
          const chatSnapshot1 = await getDoc(chatref1);
          console.log("Other User Chat Snapshot:", chatSnapshot1.data()); // Log other user chat document

          if (chatSnapshot1.exists()) {
            console.log("Updating other user's chat document");
            await updateDoc(chatref1, {
              rooms: arrayUnion(id),
            });
          } else {
            console.log("Creating other user's chat document");
            await setDoc(chatref1, {
              rooms: [id],
            });
          }
          setRoomid(id);
          console.log("Room Id", id);
          checkprevchat();
        } else {
          console.log("Previous chat found... Fetching Chat");
        }
        toast.success("Chat started with " + chatwindow);
      }
      toast.error("Error starting chat");
    } catch (error) {
      console.error("Error starting chat:", error); // Log any errors that occur
      toast.error("Error " + error.message);
    }
  };

  useEffect(() => {
    checkprevchat();
  }, [roomid]);
  const creategroup = () => {};
  return (
    <div className="ml-5 w-full">
      {userdata && (
        <div className="main2 rounded-2xl w-full bg-white bg-clip-padding backdrop-filter backdrop-blur-3xl bg-opacity-20 shadow-2xl border-1 border-black">
          <div className="flex w-full">
            <div className="search ml-5 mt-5 w-full">
              <input
                className="w-1/4 h-12 text-2xl p-2  placeholder-italic  rounded-2xl bg-gray-300 border-black transition-all duration-300 outline-none shadow-2xl hover:shadow-3xl focus:shadow-3xl  hover:bg-gray-400 focus:bg-gray-400"
                type="text"
                value={searchtext}
                onChange={(e) => setSearchtext(e.target.value)}
                placeholder="Search"
                // Add hover and focus styles
                style={{
                  background: "rgba(192,192,192,0.5)",
                  ":hover": {
                    transform: "scale(1.2)", // Scale up on hover
                    background: "rgba(192,192,192,0.7)", // Lighter background on hover
                  },
                  // Focus styles
                  ":focus": {
                    background: "rgba(192,192,192,0.8)", // Deeper background color when selected
                    outline: "none", // Remove outline when selected
                  },
                }}
              />
              {/* Render search results only if there are results and search text is not empty */}
              {searchResults.length > 0 && searchtext.length > 0 && (
                <div className="search-results absolute bg-white dark:bg-black z-10 w-1/4">
                  <ul>
                    {searchResults.map((user) => (
                      <Link href={`/${user.userName}`} key={user.id}>
                        <li>{user.userName}</li>
                      </Link>
                    ))}
                  </ul>
                </div>
              )}
              <div className="kp "></div>
            </div>
          </div>
          <div className="flex justify-between mt-2 my-5 mx-6 ">
            <div className="messages  text-5xl font-lucy">Messages</div>
            <div className="createchat" onClick={creategroup}>
              Create a Group
            </div>
          </div>

          <div className="flex justify-between w-full  ">
            <div className="followingusers w-1/4 m-6 overflow-y-auto">
              {followingusersdata &&
                followingusersdata.map((user) => (
                  <div
                    className="key"
                    key={user.userName}
                    onClick={() => setChatwindow(user.userName)}
                  >
                    <div className="flex my-4 ">
                      <div className="pfp mr-2">
                        <Image
                          className="h-10 w-10  rounded-full"
                          src={user.pfp}
                          height={50}
                          width={50}
                          alt={user.userName}
                        ></Image>
                      </div>
                      <div className="username text-xl">{user.userName}</div>
                    </div>
                  </div>
                ))}
            </div>
            <div className="chatwindow w-3/4 border-2 mx-6 bg-gray-700  bg-clip-padding backdrop-filter backdrop-blur-3xl bg-opacity-10 shadow-2xl border-none rounded-2xl  ">
              {roomid == "" ? (
                <></>
              ) : (
                <>
                  <div>{roomid}ssas</div>
                </>
              )}
              {chatloading && (
                <>
                  <div>Loading......</div>
                </>
              )}
              {roomid === "" && chatwindow !== "none" ? (
                <div className="df">
                  <div className="pfp ml-2 cursor-pointer">
                    <Image
                      className="h-10 w-10 rounded-full"
                      src={
                        followingusersdata.find(
                          (user) => user.userName === chatwindow
                        )?.pfp
                      }
                      height={50}
                      width={50}
                      alt={chatwindow}
                    ></Image>
                  </div>
                  <div className="username text-2xl mt-2 ml-2">
                    {chatwindow}
                  </div>
                  {!chprevchat ? (
                    <button onClick={startchat}>
                      Start Chat with {chatwindow}
                    </button>
                  ) : (
                    <></>
                  )}
                </div>
              ) : (
                <div className="text-3xl text-center align-middle mt-56 my-10">
                  Select a chat to start messaging
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
