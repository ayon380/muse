"use client";
import app from "@/lib/firebase/firebaseConfig";
import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import "../../styles/gradients.css";
import "../../styles/feed.css";
import {
  collection,
  getDocs,
  onSnapshot,
  limit,
  query,
  where,
  arrayUnion,
  orderBy,
  updateDoc,
  setDoc,
  addDoc,
} from "firebase/firestore";
import PFP from "@/components/PFP";
import { getStorage, deleteObject } from "firebase/storage";
import Image from "next/image";
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [roomid, setRoomid] = useState("");
  const [messagetext, setMessagetext] = useState("");
  const [messages, setMessages] = useState([{}]);
  const [chats, setChats] = useState([]);
  const [chatwindow, setChatwindow] = useState("none");
  const [chatuserdata, setChatuserdata] = useState("");
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
  const getpfp = async (username) => {
    const useref = doc(db, "username", username);
    const userSnap = await getDoc(useref);
    if (userSnap.exists()) {
      console.log("Document data:", userSnap.data().pfp);
      return userSnap.data().pfp;
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
        if (commonChatDocs.length > 0) {
          console.log("Common Chat Docs: ", commonChatDocs[0].id);
          const usref = doc(db, "username", chatwindow);
          const usnap = await getDoc(usref);
          if (usnap.exists()) {
            setChatuserdata(usnap.data());
          }
          setRoomid(commonChatDocs[0].id);
          setChatloading(false);
        } else console.log("No common chat docs found");
        // Set chPrevChat based on whether common chat documents were found
        setchprevchat(commonChatDocs.length > 0);
      } catch (error) {
        console.error("Error checking previous chat:", error);
        // Handle the error
      }
    } else {
      setchprevchat(false);
    }
  };
  useEffect(() => {
    let unsubscribe;

    const disc = async () => {
      unsubscribe = await displaychat();
    };

    if (roomid !== "") {
      disc();
    }

    return () => {
      if (unsubscribe) {
        unsubscribe(); // Call unsubscribe when component unmounts
      }
    };
  }, [roomid]);

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
  const displaychat = async () => {
    try {
      if (userdata && roomid !== "") {
        console.log("Displaying chat...");
        const msgref = collection(db, "messages");
        const q = query(
          msgref,
          where("roomid", "==", roomid),
          orderBy("timestamp","desc"),
          limit(50)
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          let messages = [];
          querySnapshot.forEach((doc) => {
            // console.log(doc.id, " => ", doc.data());
            messages.push(doc.data());
          });
          setMessages(messages.reverse());
        });
        // Return unsubscribe function to detach listener when needed
        return unsubscribe;
      }
    } catch (error) {
      console.error("Error displaying chat:", error.message);
      toast.error("Error " + error.message);
    }
  };

  const sendMesage = async () => {
    try {
      if (userdata) {
        if (roomid !== "") {
          const msgref = collection(db, "messages");
          const msgdata = {
            sender: userdata.userName,
            text: messagetext,
            timestamp: Date.now(),
            readstatus: false,
            roomid: roomid,
          };
          const q = await addDoc(msgref, msgdata);
          const msgroomref = doc(db, "messagerooms", roomid);
          const msgroomdata = {
            messages: arrayUnion(q.id),
          };
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
  }, [roomid]);
  const messagesEndRef = React.useRef(null);

  useEffect(() => {
    // Scroll to the bottom of the chat window when messages update
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  function convertToChatTime(timestamp) {
    const now = new Date();
    const messageDate = new Date(timestamp);

    // Check if messageDate is today or yesterday
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (messageDate >= today) {
      const formattedTime = messageDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
      });
      return `Today at ${formattedTime}`;
    } else if (messageDate >= yesterday) {
      const formattedTime = messageDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
      });
      return `Yesterday at ${formattedTime}`;
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
      const formattedTime = messageDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
      });
      return `${day}, ${formattedDate} at ${formattedTime}`;
    }
  }

  // Function to handle media upload
  const handleMediaUpload = async (file, mediaType) => {
    try {
      // Reset upload progress
      setUploadProgress(0);

      // Calculate total bytes of the file
      const totalBytes = file.size;

      // Upload file to Firebase Storage
      const storageRef = ref(storage, `media/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      // Update upload progress
      uploadTask.on("state_changed", (snapshot) => {
        const progress = (snapshot.bytesTransferred / totalBytes) * 100;
        setUploadProgress(progress);
      });

      // Wait for upload to complete
      await uploadTask;

      // Get download URL
      const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

      // Call sendMediaMessage with downloadURL
      sendMediaMessage(downloadURL, mediaType);
    } catch (error) {
      console.error("Error uploading media:", error.message);
      toast.error("Error uploading media: " + error.message);
    }
  };

  // Function to handle media download
  const handleMediaDownload = async (mediaURL) => {
    try {
      // Reset download progress
      setDownloadProgress(0);

      // Create a reference to the media file
      const mediaRef = ref(storage, mediaURL);

      // Get metadata (e.g., total bytes)
      const metadata = await getMetadata(mediaRef);
      const totalBytes = metadata.size;

      // Download media file
      const downloadTask = getDownloadURL(mediaRef);

      // Update download progress
      downloadTask.on("state_changed", (snapshot) => {
        const progress = (snapshot.bytesTransferred / totalBytes) * 100;
        setDownloadProgress(progress);
      });

      // Wait for download to complete
      await downloadTask;
    } catch (error) {
      console.error("Error downloading media:", error.message);
      toast.error("Error downloading media: " + error.message);
    }
  };

  // Function to handle sending media message
  const sendMediaMessage = async (mediaURL, mediaType) => {
    // Implement sending media message logic here
    // This function will be called after media upload completes
  };

  // JSX for upload progress bar
  const uploadProgressBar = (
    <div className="progress-bar">
      <div className="progress" style={{ width: `${uploadProgress}%` }}></div>
    </div>
  );

  // JSX for download progress bar
  const downloadProgressBar = (
    <div className="progress-bar">
      <div className="progress" style={{ width: `${downloadProgress}%` }}></div>
    </div>
  );
  const messageRef = React.useRef(null);

  // Function to handle sending the message
  const sendMessage = () => {
    // Implement sending message logic here
    const messageContent = messageRef.current.textContent;
    console.log('Message sent:', messageContent);
    // Clear the message content after sending
    messageRef.current.textContent = '';
  };
  const fetchchats = async () => {
    const chatref = doc(db, "chats", userdata.userName);

  }
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
                    className="key cursor-pointer"
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
            <div className="chatwindow w-3/4 border-2 mx-6 bg-gray-700  bg-clip-padding backdrop-filter backdrop-blur-3xl bg-opacity-10 shadow-2xl border-none rounded-2xl  relative">
              {roomid == "" ? (
                <></>
              ) : (
                <>
                  <div className="overflow-y-auto h-full pb-16  w-full">
                    {messages.map((message) => (
                      <div
                        className="px-6"
                        key={message.timestamp + message.sender + message.text}
                      >
                        {message.sender == userdata.userName ? (
                          <div className="ko flex justify-end my-5 ">
                            <div className="e  text-right bg-purple-400 p-3 rounded-xl">
                              <div className="flex justify-end">
                                <div className="time text-xs mr-2 mt-1">
                                  {convertToChatTime(message.timestamp)}
                                </div>
                                <div className="td text-sm font-bold">
                                  {message.sender}
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
                          </div>
                        ) : (
                          <>
                            <div className="ko  flex right-0 my-5">
                              <div className="e bg-purple-400 p-3 rounded-xl">
                                <div className="flex">
                                  <Image
                                    src={chatuserdata.pfp}
                                    className="rounded-full h-5 w-5 mr-1"
                                    alt="Profile Pic"
                                    height={50}
                                    width={50}
                                  />
                                  <div className="td text-sm font-bolda">
                                    {message.sender}
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
              {chatloading && (
                <>
                  <div className="w-full text-center align-middle">
                    Loading......
                  </div>
                </>
              )}
              {roomid == "" && chatwindow != "none" && (
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
              )}
              {chatwindow === "none" && (
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
