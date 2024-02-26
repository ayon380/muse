"use client";
import app from "@/lib/firebase/firebaseConfig";
import React, { useRef, useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import "../../styles/gradients.css";
import "../../styles/feed.css";
import {
  collection,
  getDocs,
  onSnapshot,
  arrayRemove,
  doc,
  limit,
  query,
  where,
  arrayUnion,
  deleteDoc,
  orderBy,
  updateDoc,
  setDoc,
  addDoc,
} from "firebase/firestore";

import Image from "next/image";
import { getFirestore, getDoc } from "firebase/firestore";
import dynamic from "next/dynamic";
const GroupChat = dynamic(() => import("@/components/GroupChat"));
import toast, { Toaster } from "react-hot-toast";
const Home = () => {
  const auth = getAuth(app);
  const [user, setUser] = useState(auth.currentUser);
  const [createpostmenu, setcreatepostmenu] = useState(false);
  const router = useRouter();
  const [userdata, setUserData] = useState(null);
  const [currentmsglength, setcurrentmsglength] = useState(50);
  const messagesEndRef = React.useRef(null);
  const [chatuserdata, setChatuserdata] = useState("");
  const [maxlength, setmaxlength] = useState(0);
  const [pfps, setPfps] = useState({});
  const [usernames, setusernames] = useState({});
  const db = getFirestore(app);
  const [searchResults, setSearchResults] = useState([]);
  const [roomid, setRoomid] = useState("");
  const [messagetext, setMessagetext] = useState("");
  const [chattype, setChattype] = useState("p");
  const [messages, setMessages] = useState([{}]);
  const [chats, setChats] = useState([]);
  const [opengrpchatcreate, setopengrpchatcreate] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State to track dropdown visibility
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [chatwindow, setChatwindow] = useState("none");
  const [searchtext, setSearchtext] = useState("");
  const [chprevchat, setchprevchat] = useState(false);
  //function to get data of messagerooms
  const getroomdata = async (id) => {
    const roomref = doc(db, "messagerooms", id);
    const roomsnap = await getDoc(roomref);
    if (roomsnap.exists()) {
      // console.log("Document data:", roomsnap.data());
      return roomsnap.data();
    }
  };
  //function to get chats of user
  const getchats = async () => {
    try {
      if (!userdata) return;

      const charef = doc(db, "chats", userdata.uid);
      const chasnap = await getDoc(charef);

      if (chasnap.exists()) {
        // console.log("Document data:", chasnap.data());

        // Fetch message data for all rooms
        const roomDataPromises = chasnap.data().rooms.map(async (roomId) => {
          const roomData = await getroomdata(roomId);
          if (roomData.type == "p") {
            getpfp(
              roomData.participants[0] == userdata.uid
                ? roomData.participants[1]
                : roomData.participants[0]
            );
          } else {
            roomData.participants.map(async (participant) => {
              getpfp(participant);
            });
          }
          const lastMessageId =
            roomData.messages.length > 0
              ? roomData.messages[roomData.messages.length - 1]
              : null;
          if (lastMessageId) {
            const messageData = await getDoc(
              doc(db, "messages", lastMessageId)
            );
            roomData.lastMessageTimestamp = messageData.data().timestamp;
          } else {
            roomData.lastMessageTimestamp = 0; // Set a default timestamp for rooms without messages
          }
          return roomData;
        });

        // Wait for all message data to be fetched
        const chatroomsWithTimestamp = await Promise.all(roomDataPromises);

        // Sort the chatrooms array based on the timestamp of the last message in each room
        chatroomsWithTimestamp.sort(
          (a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp
        );
        console.log(chatroomsWithTimestamp);

        // console.log("After sorting:", chatroomsWithTimestamp);
        setChats(chatroomsWithTimestamp);
      }
    } catch (error) {
      console.error("Error getting chats:", error.message);
      toast.error("Error " + error.message);
    }
  };
  useEffect(() => {
    getchats();
  }, [userdata, chatwindow]);
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
  const getpfp = async (uid) => {
    try {
      if (!pfps[uid] && userdata) {
        const useref = doc(db, "username", uid);
        const userSnap = await getDoc(useref);
        console.log("Running getpfp " + userSnap.data().userName);
        // const username = userSnap.data().userName;
        if (userSnap.exists()) {
          setPfps((prevPfps) => ({
            ...prevPfps,
            [uid]: userSnap.data().pfp,
          }));
          setusernames((prevus) => ({
            ...prevus,
            [uid]: userSnap.data().userName,
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching profile picture:", error);
    }
  };
  useEffect(() => {
    getpfp(chatwindow);
  }, [chatwindow]);

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
  useEffect(() => {
    if (userdata) {
      getchats();
    }
  }, [roomid, messages]);
  useEffect(() => {
    checkprevchat();
  }, [chatwindow]);
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
    // setChatloading(true);
    if (userdata && !roomid) {
      try {
        console.log("Checking previous chat...");
        // Construct the query to find the chat document where the current user is a participant
        if (chattype == "p") {
          const currentUserChatQuery = query(
            collection(db, "messagerooms"),
            where("type", "==", "p"),
            where("participants", "array-contains", userdata.uid)
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
            return chatWindowChatDocs.some(
              (otherDoc) => otherDoc.id === doc.id
            );
          });
          if (commonChatDocs.length > 0) {
            console.log("Common Chat Docs: ", commonChatDocs[0].id);
            const usref = doc(db, "username", chatwindow);
            const usnap = await getDoc(usref);
            if (usnap.exists()) {
              setChatuserdata(usnap.data());
            }
            setRoomid(commonChatDocs[0].id);
          } else console.log("No common chat docs found");
          // Set chPrevChat based on whether common chat documents were found
          setchprevchat(commonChatDocs.length > 0);
        }
      } catch (error) {
        console.error("Error checking previous chat:", error);
        // Handle the error
      }
    }
    setchprevchat(false);
  };
  useEffect(() => {
    let unsubscribe;

    const disc = async () => {
      unsubscribe = await displaychat();
    };

    if (roomid !== "") {
      console.log("Room Id:", roomid);
      disc();
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
        // setcurrentmsglength(50);
        setMessages([]); // Call unsubscribe when component unmounts
      }
    };
  }, [roomid, currentmsglength]);

  const startchat = async () => {
    try {
      if (userdata) {
        if (!chprevchat) {
          console.log("Previous chat not found... Creating Chat");
          const msgroomref = collection(db, "messagerooms");
          const msgroomdata = {
            title: "",
            type: "p",
            participants: [userdata.uid, chatwindow],
            messages: [],
            timestamp: Date.now(),
          };
          const msgroomdoc = await addDoc(msgroomref, msgroomdata);
          const id = msgroomdoc.id;
          console.log("Room Id: " + id);
          const chatref = doc(db, "chats", userdata.uid);
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
  const updatereadstatus = async (id) => {
    try {
      const msgref = doc(db, "messages", id);
      await updateDoc(msgref, {
        readstatus: true,
      });
    } catch (error) {
      console.error("Error updating read status:", error.message);
      toast.error("Error " + error.message);
    }
  };
  const [loadingold, setloadingold] = useState(false);
  const displaychat = async () => {
    try {
      if (userdata && roomid) {
        // if (chattype == "p") {
        console.log(roomid);
        console.log("Displaying chat...");
        const msgref = collection(db, "messages");
        console.log("Current Message Length:", currentmsglength);
        const q = query(
          msgref,
          where("roomid", "==", roomid),
          orderBy("timestamp", "desc"),
          limit(currentmsglength)
        );
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          let messages = [];
          querySnapshot.forEach(async (doc) => {
            // console.log(doc.id, " => ", doc.data());
            messages.push(doc.data());
            if (!doc.data().readstatus && doc.data().sender !== userdata.uid) {
              updatereadstatus(doc.id);
            }
          });
          setMessages(messages.reverse());
        });
        // Scroll to the bottom of the chat window when messages update

        return unsubscribe;
      }
    } catch (error) {
      console.error("Error displaying chat:", error.message);
      toast.error("Error " + error.message);
    }
  };
  useEffect(() => {
    if (userdata && roomid) {
      const getlength = async () => {
        const msgroomref = doc(db, "messagerooms", roomid);
        const msgroomdata = await getDoc(msgroomref);
        if (msgroomdata.exists()) {
          setmaxlength(msgroomdata.data().messages.length);
        }
      };
      getlength();
      setcurrentmsglength(50);
    }
  }, [roomid]);
  useEffect(() => {
    // Scroll to the bottom of the chat window when messages update
    if (messages.length != 0 && !loadingold)
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setloadingold(false);
  }, [messages]);
  const sendMesage = async () => {
    try {
      if (userdata) {
        if (roomid !== "") {
          const msgref = collection(db, "messages");
          const msgdata = {
            sender: userdata.uid,
            text: messagetext,
            timestamp: Date.now(),
            readstatus: false,
            roomid: roomid,
          };
          const q = await addDoc(msgref, msgdata);
          const msgroomref = doc(db, "messagerooms", roomid);
          const qwref = doc(db, "messages", q.id);
          const msgroomdata = {
            messages: arrayUnion(q.id),
          };
          await updateDoc(qwref, {
            id: q.id,
          });
          await updateDoc(msgroomref, msgroomdata);
          setMessagetext("");
          toast.success("Message sent");
        } else {
          toast.error("No chat selected");
        }
      }
    } catch (error) {
      console.error("Error sending message:", error.message); // Log any errors that occur
      toast.error("Error " + error.message);
    }
  };
  useEffect(() => {
    checkprevchat();
  }, [roomid,chatwindow]);
  function convertToChatTime(timestamp) {
    const now = new Date();
    const messageDate = new Date(timestamp);

    // Check if messageDate is today or yesterday
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (messageDate >= today) {
        const hour = messageDate.getHours().toString().padStart(2, '0'); // Format the hour to ensure it's always two digits
        const minute = messageDate.getMinutes().toString().padStart(2, '0'); // Format the minute to ensure it's always two digits
        return `Today at ${hour}:${minute}`;
    } else if (messageDate >= yesterday) {
        const hour = messageDate.getHours().toString().padStart(2, '0'); // Format the hour to ensure it's always two digits
        const minute = messageDate.getMinutes().toString().padStart(2, '0'); // Format the minute to ensure it's always two digits
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
        const hour = messageDate.getHours().toString().padStart(2, '0'); // Format the hour to ensure it's always two digits
        const minute = messageDate.getMinutes().toString().padStart(2, '0'); // Format the minute to ensure it's always two digits
        return `${day}, ${formattedDate} at ${hour}:${minute}`;
    }
}


  // Function to handle media upload

  // State to track selected message

  // Function to handle message copy
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Message Copied"); // Copy the message text to the clipboard
    setIsDropdownOpen(false); // Close the dropdown
  };

  // Function to handle message deletion
  const handleDelete = async () => {
    try {
      // Implement deletion logic here using selectedMessage
      const msgrromref = doc(db, "messagerooms", roomid);
      const msgrromdata = {
        messages: arrayRemove(selectedMessage.id),
      };
      await updateDoc(msgrromref, msgrromdata);
      const messageRef = doc(db, "messages", selectedMessage.id);
      await deleteDoc(messageRef); // Delete the message document
      toast.success("Message deleted"); // Show success message
      setIsDropdownOpen(false); // Close the dropdown
      console.log("Deleting message:", selectedMessage);
    } catch (error) {
      console.error("Error deleting message:", error.message);
      toast.error("Error deleting message: " + error.message);
    }
  };
  const handledropdown = (message) => {
    setIsDropdownOpen(!isDropdownOpen);
    setSelectedMessage(message);
  };
  const handleclosegrpchatcreation = () => {
    setopengrpchatcreate(false);
  };
  return (
    <div className="ml-5 w-full h-full">
      <Toaster />
      {userdata && (
        <div className="main2 w-full rounded-2xl   bg-white bg-clip-padding backdrop-filter backdrop-blur-3xl bg-opacity-20 shadow-2xl border-1 border-black h-full">
          <div className="flex w-full ">
            <div className="messages  text-5xl ml-6 mt-6 mr-6 font-lucy w-1/4 ">
              Messages
            </div>
            <div className="flex justify-between w-3/4">
              <div className="search ml-5 mt-5 ">
                <div className="ser">
                  <input
                    className=" h-12 text-2xl p-2 rounded-2xl focus:rounded-t-2xl focus:rounded-b-none placeholder-italic placeholder:text-white   bg-gray-300 text-white border-black transition-all duration-300 outline-none shadow-2xl hover:shadow-3xl focus:shadow-3xl  hover:bg-gray-400 focus:bg-gray-400"
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
                    <div className="search-results cursor-pointer absolute text-black bg-white w-1/4 rounded-b-2xl z-10 ">
                      <ul>
                        {searchResults.length > 0 ? (
                          searchResults.map(
                            (user) =>
                              user.uid !== userdata.uid && (
                                <div
                                  onClick={() => setChatwindow(user.uid)}
                                  key={user.uid}
                                >
                                  <li>{user.userName}</li>
                                </div>
                              )
                          )
                        ) : (
                          <>No Users Found</>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
                {/* <div className="kp "></div> */}
              </div>
              <button
                className="createchat cursor-pointer h-auto mt-5 p-3 rounded-2xl bg-purple-600 mr-10 backdrop-filter backdrop-blur-lg bg-opacity-90 shadow-2xl hover:bg-purple-700"
                onClick={() => setopengrpchatcreate(true)}
              >
                Create a Group
              </button>
            </div>
          </div>
          <div className="flex justify-between mt-2 my-5 mx-6 ">
            {opengrpchatcreate && (
              <GroupChat
                userdata={userdata}
                onClose={handleclosegrpchatcreation}
              />
            )}
          </div>

          <div className="flex justify-between w-full ">
            <div
              className="followingusers w-1/4 m-6 overflow-y-auto"
              key={roomid}
            >
              {chats &&
                chats.map((chat, index) =>
                  chat.type == "p" ? (
                    <div
                      className="key cursor-pointer"
                      key={index}
                      onClick={() => {
                        setRoomid(chat.roomid);
                        setChattype("p");
                        setChatwindow(
                          chat.participants[0] == userdata.uid
                            ? chat.participants[1]
                            : chat.participants[0]
                        );
                      }}
                    >
                      <div className="flex my-4 ">
                        <div className="pfp mr-2">
                          {pfps[chat.participants[1]] && (
                            <Image
                              className="h-10 w-10 rounded-full"
                              src={pfps[chat.participants[1]]}
                              height={50}
                              width={50}
                              alt={chat.participants[1]}
                            ></Image>
                          )}
                        </div>
                        <div className="username font-bold text-xl">
                          {chat.participants[0] == userdata.uid
                            ? usernames[chat.participants[1]]
                            : usernames[chat.participants[0]]}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="key cursor-pointer"
                      key={index}
                      onClick={() => {
                        setRoomid(chat.roomid);
                        setChattype("g");
                        setChatwindow(chat.title);
                      }}
                    >
                      <div className="title font-bold text-xl">
                        {chat.title}
                      </div>
                      {chat.participants.map(
                        (participant) => usernames[participant] + " "
                      )}{" "}
                    </div>
                  )
                )}
            </div>
            <div className="chatwindow w-3/4 border-2 mx-6 bg-gray-700  bg-clip-padding backdrop-filter backdrop-blur-3xl bg-opacity-10 shadow-2xl border-none rounded-2xl h-full relative">
              {roomid == "" ? (
                <></>
              ) : (
                <>
                  <div className="overflow-y-auto h-full pb-16 pt-10 w-full">
                    <div className="g fixed top-0 rounded-2xl h-10 pt-2 w-full text-center bg-purple-500 bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-100 shadow-2xl  border-none">
                      <div className="flex justify-center">
                        {chattype == "p" && (
                          <Image
                            className="h-7 w-7 rounded-full mr-2"
                            src={pfps[chatwindow]}
                            height={50}
                            width={50}
                            alt={chatwindow}
                          ></Image>
                        )}
                        {usernames[chatwindow]}
                      </div>
                    </div>
                    <div className="flex justify-center">
                      {currentmsglength < maxlength && (
                        <button
                          onClick={() => {
                            setcurrentmsglength(currentmsglength + 50);
                            setloadingold(true);
                          }}
                        >
                          Load older Messages{maxlength - currentmsglength}
                        </button>
                      )}
                    </div>
                    {messages.map((message) => (
                      <div
                        className="px-6"
                        key={message.timestamp + message.sender + message.text}
                      >
                        {message.sender == userdata.uid ? (
                          <div className="ko flex justify-end my-5 ">
                            <div className="e  text-right bg-purple-400 p-3 rounded-xl">
                              <div
                                className="lp"
                                onClick={() => handledropdown(message)}
                              >
                                <div className="flex justify-end">
                                  <div className="time text-xs mr-2 mt-1">
                                    {convertToChatTime(message.timestamp)}
                                  </div>
                                  <div className="td text-sm font-bold">
                                    {usernames[message.sender]}
                                  </div>
                                  <Image
                                    className="rounded-full h-5 w-5 ml-1"
                                    src={userdata.pfp}
                                    alt="Profile Pic"
                                    height={50}
                                    width={50}
                                  />
                                </div>
                                <div className="fg text-xl">{message.text}</div>
                              </div>
                              {isDropdownOpen && selectedMessage == message && (
                                <div className="dropdown-menu  mt-4">
                                  {message.readstatus ? (
                                    <>seen</>
                                  ) : (
                                    <>delivered</>
                                  )}
                                  <button
                                    className=" ml-2 dropdown-item mr-2"
                                    onClick={() => handleCopy(message.text)}
                                  >
                                    Copy
                                  </button>
                                  <button
                                    className="dropdown-item"
                                    onClick={handleDelete}
                                  >
                                    Delete
                                  </button>
                                  {/* Delete button */}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="ko  flex right-0 my-5">
                              <div className="e bg-purple-400 p-3 rounded-xl">
                                <div className="flex">
                                  {/* {console.log(pfps[message.sender])} */}
                                  {pfps[message.sender] && (
                                    <Image
                                      src={pfps[message.sender]}
                                      className="rounded-full h-5 w-5 mr-1"
                                      alt="Profile Pic"
                                      height={50}
                                      width={50}
                                    />
                                  )}
                                  <div className="td text-sm font-bolda">
                                    {usernames[message.sender]}
                                  </div>
                                  <div className="time text-xs ml-2 mt-1">
                                    {convertToChatTime(message.timestamp)}
                                  </div>
                                </div>
                                <div className="fg text-xl">{message.text}</div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                    <div className="textbox absolute flex bottom-0 w-full m-2">
                      <input
                        type="text"
                        placeholder="Type a message..."
                        className="placeholder-italic w-full h-12 text-2xl p-2  rounded-xl text-black border-black transition-all duration-300 outline-none shadow-2xl hover:shadow-3xl focus:shadow-3xl  "
                        value={messagetext}
                        onChange={(e) => setMessagetext(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            sendMesage();
                          }
                        }}
                      ></input>

                      <button
                        onClick={sendMesage}
                        disabled={messagetext.length === 0}
                        className="send bg-blue-500  fd px-6 ml-2 mr-4 disabled:bg-blue-300"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </>
              )}
              {/* {chatloading && (
                <>
                  <div className="w-full text-center align-middle">
                    Loading......
                  </div>
                </>
              )} */}
              {roomid == "" && chatwindow != "none" && (
                <div className="df">
                  <div className="pfp ml-2 cursor-pointer">
                    <Image
                      className="h-10 w-10 rounded-full"
                      src={pfps[chatwindow]}
                      height={50}
                      width={50}
                      alt={chatwindow}
                    ></Image>
                  </div>
                  <div className="username text-2xl mt-2 ml-2">
                    {usernames[chatwindow]}
                  </div>
                  {!chprevchat ? (
                    <button onClick={startchat}>
                      Start Chat with {usernames[chatwindow]}
                    </button>
                  ) : (
                    <></>
                  )}
                </div>
              )}
              {!roomid && (
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
