"use client";
import app from "@/lib/firebase/firebaseConfig";
import React, { useRef, useEffect, useState, use } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import "../../styles/gradients.css";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Link from "next/navigation";
import GifPicker from "gif-picker-react";
import "../../styles/feed.css";
import SparklesText from "@/components/SparkleText";
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
import { useSidebarStore } from "@/app/store/zustand";
import imageCompression from "browser-image-compression";
const MediaViewer = dynamic(() => import("@/components/MediaViewer"));
const SearchChat = dynamic(() => import("@/components/SearchChat"));
const GroupChat = dynamic(() => import("@/components/GroupChat"));
const MainLoading = dynamic(() => import("@/components/MainLoading"));
const ChatDetail = dynamic(() => import("@/components/ChatDetail"));
const GroupChatDetail = dynamic(() => import("@/components/GroupChatDetail"));
import toast, { Toaster } from "react-hot-toast";
const options = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
};
const Home = () => {
  const searchParams = useSearchParams();
  const room = searchParams.get("roomid") || "";
  const chatt = searchParams.get("chattype") || "p";
  const chatw = searchParams.get("chatwindow") || "none";
  console.log(room, chatt, chatw);
  const storage = getStorage(app);
  const auth = getAuth(app);
  const pathname = usePathname();
  // const pathname = window.location.pathname;
  const [user, setUser] = useState(auth.currentUser);
  const [createpostmenu, setcreatepostmenu] = useState(false);
  const router = useRouter();
  const inputref = useRef(null);
  const [userdata, setUserData] = useState(null);
  const [currentmsglength, setcurrentmsglength] = useState(50);
  const messagesEndRef = React.useRef(null);
  const [chatuserdata, setChatuserdata] = useState("");
  const [maxlength, setmaxlength] = useState(0);
  const db = getFirestore(app);
  const [searchResults, setSearchResults] = useState([]);
  const [roomid, setRoomid] = useState(room);
  // const [messagetext, setMessagetext] = useState("");
  const [gif, setgif] = useState(null);
  const [chattype, setChattype] = useState(chatt);
  const [messages, setMessages] = useState([{}]);
  const [chats, setChats] = useState([]);
  const [opengrpchatcreate, setopengrpchatcreate] = useState(false);
  const [checkchattype, setcheckchattype] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State to track dropdown visibility
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [chatwindow, setChatwindow] = useState(chatw);
  const [searchtext, setSearchtext] = useState("");
  const [chprevchat, setchprevchat] = useState(false);
  const [gifopen, setgifopen] = useState(false);
  const [showaddfiles, setshowaddfiles] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [ismobile, setismobile] = useState(false);
  const [chatdetailopen, setchatdetailopen] = useState(false);
  const [roomdata, setroomdata] = useState({});
  const [mainloading, setmainloading] = useState(true);
  const [pfps, setPfps] = useState({});
  const [mediaViewerOpen, setMediaViewerOpen] = useState(false);
  const [mediaviewerfiles, setmediaviewerfiles] = useState([]);
  const {
    chatopen,
    setchatopen,
    isOpen,
    toggle,
    initialLoad,
    toggleload,
    usermetadata,
    unread,
    enqueueUserMetadata,
  } = useSidebarStore();
  //function to get data of messagerooms'
  const [searchopen, setsearchopen] = useState(false);
  useEffect(() => {
    if (!mainloading) {
      toggleload();
    }
  }, [mainloading]);
  useEffect(() => {
    if (window.innerWidth < 768) {
      setismobile(true);
    } else {
      setismobile(false);
    }
    window.addEventListener("resize", () => {
      if (window.innerWidth < 768) {
        setismobile(true);
      } else {
        setismobile(false);
      }
    });
  }, []);
  useEffect(() => {
    const func = async () => {
      if (roomid) {
        const data = await getroomdata(roomid);
        setroomdata(data);
      }
    };
    func();
  }, [roomid]);
  const refetchroomdata = async () => {
    const data = await getroomdata(roomid);
    setroomdata(data);
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    const filesArray = Array.from(files).slice(0, 10);
    const validFiles = filesArray.filter(
      (file) => file.size <= 20 * 1024 * 1024
    ); // Limit to 20MB

    // Display an error message if any file exceeds the size limit
    if (validFiles.length < filesArray.length) {
      toast.error("Some files exceed the maximum size limit of1 20MB.");
      setMediaFiles([]);
    }

    setMediaFiles([...mediaFiles, ...validFiles]);
  };

  const handleRemoveMedia = (indexToRemove) => {
    setMediaFiles(mediaFiles.filter((_, index) => index !== indexToRemove));
  };

  useEffect(() => {
    const handleRouteChange = () => {
      const ct = searchParams.get("chattype") || "p";
      const rid = searchParams.get("roomid") || "";
      const cw = searchParams.get("chatwindow") || "none";
      if (rid != "" && !chatopen) {
        console.log("Opening chat");
        setcurrentmsglength(51);
        setchatopen(true);
      }
      if (rid == "" && chatopen) {
        setchatopen(false);
      }
      setChattype(ct);
      setRoomid(rid);
      setChatwindow(cw);
    };
    if (userdata) handleRouteChange();
  }, [pathname, room, userdata]);
  // useEffect(() => {
  //   console.log(roomid + "usestate" + chatopen);

  // }, [roomid]);
  useEffect(() => {
    console.log(chattype + " " + roomid + " " + chatwindow);
  }, [chattype, roomid, chatwindow]);
  const getroomdata = async (id) => {
    const roomref = doc(db, "messagerooms", id);
    const roomsnap = await getDoc(roomref);
    if (roomsnap.exists()) {
      // console.log("Document data:", roomsnap.data());
      return roomsnap.data();
    }
  };
  const getgpfp = async (roomidd) => {
    try {
      const roomdata = await getroomdata(roomidd);
      setPfps((prevPfps) => ({
        ...prevPfps,
        [roomidd]: roomdata.pfp,
      }));
    } catch (error) {
      console.error("Error fetching profile picture:", error);
    }
  };
  useEffect(() => {
    console.log(pfps);
  }, [pfps]);
  const getchats = async () => {
    // try {
    if (!userdata) return;

    const charef = doc(db, "chats", userdata.uid);
    const chasnap = await getDoc(charef);

    if (chasnap.exists()) {
      // console.log("Document data:", chasnap.data());

      // Fetch message data for all rooms
      const roomDataPromises = chasnap.data().rooms.map(async (roomId) => {
        const roomData = await getroomdata(roomId);
        // console.log(roomData);
        if (roomData.type == "p") {
          enqueueUserMetadata(
            roomData.participants[0] == userdata.uid
              ? roomData.participants[1]
              : roomData.participants[0]
          );
        } else {
          roomData.participants.map(async (participant) => {
            enqueueUserMetadata(participant);
          });
          getgpfp(roomId);
        }
        const lastMessageId =
          roomData.messages.length > 0
            ? roomData.messages[roomData.messages.length - 1]
            : null;
        console.log(lastMessageId);
        if (lastMessageId) {
          const lastmessage = await getDoc(doc(db, "messages", lastMessageId));
          if (lastmessage.exists()) {
            roomData.lastMessage = lastmessage.data();
          }
        }
        if (lastMessageId) {
          const messageData = await getDoc(doc(db, "messages", lastMessageId));
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
      setmainloading(false);
    }
    // } catch (error) {
    //   console.error("Error getting chats:", error.message);
    //   toast.error("Error " + error.message);
    // }
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

  useEffect(() => {
    enqueueUserMetadata(chatwindow);
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
          } else {
            console.log("No common chat docs found");
          }
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
          const roomref = doc(db, "messagerooms", id);
          await updateDoc(roomref, {
            roomid: id,
          });
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
  const sendNotification = async (id, notificationData) => {
    try {
      await new Promise((resolve) => {
        setTimeout(async () => {
          const msqref = doc(db, "messages", id);
          const msgdata = await getDoc(msqref);

          if (msgdata.data().readstatus) return;

          if (chattype !== "p") {
            const chat = chats.filter((chat) => chat.roomid === roomid);
            chat[0].participants.map(async (participant) => {
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
        }, 5000); // 10 seconds timeout
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

  useEffect(() => {
    let unsubscribe;
    const disc = async () => {
      if (userdata && roomid) {
        console.log("Displaying chat...");
        const msgref = collection(db, "messages");
        console.log("Current Message Length:", currentmsglength);
        const q = query(
          msgref,
          where("roomid", "==", roomid),
          orderBy("timestamp", "desc"),
          limit(currentmsglength)
        );
        unsubscribe = onSnapshot(q, (querySnapshot) => {
          let messages = [];
          querySnapshot.forEach(async (doc) => {
            messages.push(doc.data());
            if (!doc.data().readstatus && doc.data().sender !== userdata.uid) {
              updatereadstatus(doc.id);
            }
          });
          setMessages(messages.reverse());
        });
      }
    };
    if (roomid !== "") {
      console.log("Room Id:", roomid);
      disc();
    }
    return () => {
      if (unsubscribe) {
        console.log("Unsubscribing from chat" + roomid);
        unsubscribe();
        setMessages([]);
      }
    };
  }, [roomid, currentmsglength]);

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
    if (loadingold) console.log("loading older" + loadingold);
    if (messages.length != 0 && !loadingold) {
      messagesEndRef.current?.scrollIntoView();
      // rm--;
      // console.log(rm);
    }
    // if (rm == 0) setloadingold(false);
  }, [messages]);
  const sendMesage = async () => {
    try {
      if (userdata) {
        if (roomid !== "") {
          if (!inputref.current.value.trim(" ").length > 0) return;
          // setMessagetext(inputref.current.value);
          let mt = inputref.current.value;
          const msgref = collection(db, "messages");
          const msgdata = {
            sender: userdata.uid,
            text: mt,
            type: "text",
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
          // setMessagetext("");
          sendNotification(q.id, {
            type: "message",
            chattype: chattype,
            sender: userdata.uid,
            text: mt,
            messagetype: "text",
            roomid: roomid,
            receiver: chatwindow,
            timestamp: Date.now(),
          });
          inputref.current.value = "";
          console.log("Message sent");
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
    console.log("Chat window changed:", chatwindow);
  }, [roomid, chatwindow]);
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
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
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
      const data = await getDoc(messageRef);
      if (data.type == "media") {
        data.text.map(async (url) => {
          const fileRef = ref(storage, url);
          await deleteObject(fileRef);
        });
      }
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
  const handlesendGif = async (gif) => {
    setgif(gif);
    try {
      if (userdata) {
        if (roomid !== "") {
          const msgref = collection(db, "messages");
          const msgdata = {
            sender: userdata.uid,
            text: gif.url,
            type: "gif",
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
          inputref.current.value = "";
          sendNotification(q.id, {
            type: "message",
            chattype: chattype,
            sender: userdata.uid,
            text: gif.url,
            messagetype: "gif",
            roomid: roomid,
            receiver: chatwindow,
            timestamp: Date.now(),
          });
          toast.success("Gif sent");
        } else {
          toast.error("No chat selected");
        }
      }
    } catch (error) {
      console.error("Error sending Gif:", error.message); // Log any errors that occur
      toast.error("Error " + error.message);
    }
    setgifopen(false);
  };
  const handlesubmitfiles = async () => {
    try {
      if (userdata) {
        if (roomid !== "") {
          const storageRef = ref(storage, `images/chats/${roomid}`);
          const mediaURLs = [];
          for (const file of mediaFiles) {
            if (file.type.startsWith("video/")) {
              const fileRef = ref(storageRef, file.name);
              await uploadBytes(fileRef, file);
              const downloadURL = await getDownloadURL(fileRef);
              mediaURLs.push(downloadURL);
              continue;
            }
            const compressedFile = await imageCompression(file, options);
            const fileRef = ref(storageRef, compressedFile.name);
            await uploadBytes(fileRef, compressedFile);
            const downloadURL = await getDownloadURL(fileRef);
            mediaURLs.push(downloadURL);
          }
          const msgref = collection(db, "messages");
          const msgdata = {
            sender: userdata.uid,
            text: mediaURLs,
            type: "media",
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
          // setMessagetext("");
          inputref.current.value = "";
          sendNotification(q.id, {
            type: "message",
            chattype: chattype,
            sender: userdata.uid,
            text: mediaURLs,
            messagetype: "media",
            roomid: roomid,
            receiver: chatwindow,
            timestamp: Date.now(),
          });
          console.log("Media sent:", mediaURLs);
          setMediaFiles([]);
          setshowaddfiles(false);
          toast.success("Media sent");
        } else {
          toast.error("No chat selected");
        }
      }
    } catch (error) {
      console.error("Error sending files:", error.message);
      toast.error("Error " + error.message);
    }
  };
  const checkchat = (Q) => {
    if (ismobile) {
      console.log("Mobile chat open" + chatopen);
      return chatopen;
    } else if (Q === "Q" && !ismobile) {
      return false;
    } else {
      return true;
    }
  };

  const handlemessagereply = (message) => {
    inputref.current.value = `@${usermetadata[message.sender].userName} ${
      message.text
    }`;
  };
  function formatLastSeen(timestamp) {
    console.log(timestamp);
    const now = new Date();
    const lastSeen = new Date(timestamp);

    const diff = now.getTime() - lastSeen.getTime();
    const seconds = Math.floor(diff / 1000);

    if (seconds <= 120) {
      // 2 minutes = 120 seconds
      return "Active";
    } else {
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (days > 0) {
        if (days === 1) {
          return "yesterday";
        } else {
          return `${days} days ago`;
        }
      } else if (hours > 0) {
        return `${hours} hour${hours > 1 ? "s" : ""} ago`;
      } else if (minutes > 0) {
        return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
      } else {
        return "just now";
      }
    }
  }

  function getUsernameAndPostIdFromUrl(url) {
    try {
      const regex = /\/feed\/profile\/([^\/]+)\?postid=([^\/]+)/;
      const match = url.match(regex);

      if (match) {
        const username = match[1];
        const postId = match[2];
        return { username, postId };
      } else {
        return null;
      }
    } catch (e) {
      return null;
    }
  }
  const fetchpost = async (postId) => {
    try {
      const postref = doc(db, "posts", postId);
      const postdata = await getDoc(postref);
      if (postdata.exists()) {
        return postdata.data();
      }
      return null;
    } catch (error) {
      console.error("Error fetching post data:", error);
      return null;
    }
  };

  const fetchreel = async (reelId) => {
    try {
      const postref = doc(db, "reels", reelId);
      const postdata = await getDoc(postref);
      if (postdata.exists()) {
        return postdata.data();
      }
      return null;
    } catch (error) {
      console.error("Error fetching reel data:", error);
      return null;
    }
  };

  const ShortMusePost = React.memo(({ message }) => {
    const router = useRouter();
    const text = message.text;
    const [username, setUsername] = useState("");
    const [reel, setReel] = useState({});
    const [posttt, setPosttt] = useState({});
    const initialized = useRef(false); // To keep track of initialization

    useEffect(() => {
      if (initialized.current) return; // If already initialized, skip

      const fetchReelData = async (reelid) => {
        const reelData = await fetchreel(reelid);
        if (reelData) {
          setReel(reelData);
        }
      };

      const fetchPostData = async (postId) => {
        const postData = await fetchpost(postId);
        if (postData) {
          setPosttt(postData);
        }
      };

      if (text.includes("reels")) {
        const regex = /reelid=([^&]+)/;
        const match = text.match(regex);
        if (match) {
          const reelid = match[1];
          console.log(`Reel ID: ${reelid}`);
          fetchReelData(reelid);
        } else {
          console.log("Reel ID not found.");
        }
      } else {
        const result = getUsernameAndPostIdFromUrl(text);
        if (result) {
          const { username, postId } = result;
          setUsername(username);
          fetchPostData(postId);
        } else {
          console.log("Post ID not found.");
        }
      }

      initialized.current = true; // Mark as initialized
    }, [text]); // Dependency array ensures it considers `text` changes only

    return (
      <div className="sdfsdf p-1" onClick={() => router.push(text)}>
        {username && (
          <div className="relative text-purple-700">@{username}</div>
        )}
        {posttt.mediaFiles && (
          <Image
            src={posttt.mediaFiles[0]}
            height={150}
            width={150}
            alt=""
            className="rounded-lg"
          />
        )}
        {reel.thumbnail && (
          <Image
            src={reel.thumbnail}
            height={150}
            width={150}
            alt="Reel Thumbnail"
            className="rounded-lg"
          />
        )}
      </div>
    );
  });

  ShortMusePost.displayName = "ShortMusePost"; // Add display name
  const preventDefault = (e) => {
    e.preventDefault();
  };
  // useEffect(() => {
  //   console.log("mediaFiles:", mediaviewerfiles);
  // }, [mediaviewerfiles]);
  const handleMediaViewerClose = () => {
    setMediaViewerOpen(false);
    setmediaviewerfiles([]);
  };
  return (
    <div className=" w-full h-full overflow-hidden">
      <Toaster />

      {mediaViewerOpen && mediaviewerfiles && (
        <MediaViewer
          mediaviewerfiles={mediaviewerfiles}
          setMediaViewerOpen={setMediaViewerOpen}
          close={handleMediaViewerClose}
        />
      )}
      {mainloading && !initialLoad && (
        <>
          <div className="main2 md:rounded-2xl bg-white dark:bg-black  shadow-2xl border-1 border-black h-full overflow-y-auto">
            <div className="flex justify-center items-center h-full">
              <div className="edwdw ">
                {" "}
                {/* Added text-center class here */}
                <div className="sd flex justify-center">
                  <Image
                    src="/loading.gif"
                    height={150}
                    width={150}
                    alt="Loading"
                  />
                </div>
                <div className="de font-lucy mt-24 md-text-3xl">
                  Weaving threads of communication, hold tight! 🧵
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {userdata && !mainloading && (
        <div className="main2 w-full lg:rounded-2xl  dark:bg-black md:dark:bg-gray-900 bg-white  shadow-2xl border-1 border-black h-full">
          <div className="flex justify-between w-full h-full">
            {gifopen && (
              <div className="absolute right-0 bottom-4 z-40 mb-12 lg:mb-20 mr-1 lg:mr-10">
                <GifPicker
                  tenorApiKey="AIzaSyCzQwhhvhBYKNd6CWA5HeA2jWIg0AO5hF0"
                  theme="auto"
                  autoFocusSearch
                  onGifClick={(gif) => handlesendGif(gif)}
                />
              </div>
            )}
            {chatdetailopen &&
              (chattype == "p" ? (
                <ChatDetail
                  userdata={userdata}
                  chatuserdata={chatuserdata}
                  onClose={() => setchatdetailopen(false)}
                  roomdata={roomdata}
                  usermetadata={usermetadata}
                  refetchroomdata={refetchroomdata}
                  db={db}
                />
              ) : (
                <GroupChatDetail
                  userdata={userdata}
                  usernames={usermetadata}
                  chatuserdata={chatuserdata}
                  onClose={() => setchatdetailopen(false)}
                  db={db}
                  roomdata={roomdata}
                />
              ))}
            {searchopen && (
              <SearchChat
                setsearchopen={setsearchopen}
                userdata={userdata}
                chats={chats}
                enqueueUserMetadata={enqueueUserMetadata}
                setChatwindow={setChatwindow}
                usermetadata={usermetadata}
              />
            )}
            {showaddfiles && (
              <div className="absolute md:rounded-2xl right-0 w-full shadow-xl md:w-1/4 bottom-4 z-40 mb-14 lg:mb-20 lg:mr-10  bg-white text-black dark:bg-feedheader dark:text-white rounded-t-3xl p-4">
                <div className="mb-4">
                  <label className="block text font-bold mb-2">
                    Upload Photos or Videos (up to 10)
                  </label>
                  <input
                    className="file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-violet-50 file:text-violet-700
            hover:file:bg-violet-100"
                    type="file"
                    accept="image/*, video/*"
                    onChange={handleFileChange}
                  />
                </div>
                <div className="lp h-32 max-w-96">
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold mb-2">
                      Media Preview
                    </h2>
                    <div className="flex flex-nowrap overflow-x-auto">
                      {mediaFiles.map((file, index) => (
                        <div key={index} className="relative flex-none p-2">
                          {file.type.startsWith("image/") ? (
                            <Image
                              src={URL.createObjectURL(file)}
                              alt={`Media ${index + 1}`}
                              width={50}
                              height={50}
                              className="w-32 h-16 object-cover rounded"
                            />
                          ) : (
                            <video
                              src={URL.createObjectURL(file)}
                              alt={`Media ${index + 1}`}
                              className="w-32 h-16 rounded"
                              controls
                            />
                          )}
                          <button
                            className="absolute ml-1 z-10 -mt-7 text-red-500 hover:text-red-700 bg-red-300 rounded-full w-6 h-6 flex items-center justify-center focus:outline-none"
                            onClick={() => handleRemoveMedia(index)}
                          >
                            &#10005;
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    className="rounded-2xl bg-fuchsia-400 ml-3 py-3 px-4 disabled:text-gray-400 disabled:cursor-not-allowed "
                    disabled={mediaFiles.length == 0}
                    onClick={handlesubmitfiles}
                  >
                    Send
                  </button>
                  <input
                    type="file"
                    id="fileInput"
                    accept="image/*, video/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              </div>
            )}
            {!checkchat("Q") && (
              <div
                className="followingusers rounded-xl bg-white dark:bg-black w-full lg:w-1/3  overflow-y-auto"
                key={roomid}
              >
                <div className="flex w-full rounded-b-3xl rounded-t-md shadow-xl shadow-fuchsia-100 dark:bg-feedheader dark:shadow-none bg-white p-3 justify-between">
                  <h1 class="bg-gradient-to-r from-purple-500 via-fuchsia-400 to-pink-400 text-4xl inline-block text-transparent bg-clip-text">
                    Messages
                  </h1>
                  <div className="flex justify-end ">
                    <button
                      className="createchat cursor-pointer h-auto  p-3 rounded-2xl   "
                      onClick={() => setopengrpchatcreate(true)}
                    >
                      <Image
                        src="/icons/add-group.png"
                        className="h-6 w-6 dark:invert"
                        height={50}
                        width={50}
                        alt="Create Group Chat"
                      />
                    </button>

                    <button onClick={() => setsearchopen(true)}>
                      <Image
                        className="h-6 w-6 mr-2 dark:invert"
                        src="/icons/search.png"
                        width={50}
                        height={50}
                        alt="Search"
                      />
                    </button>
                    <button onClick={toggle}>
                      <Image
                        className="h-7 w-7  "
                        src="/icons/sidebar.png"
                        width={50}
                        alt="Sidebar"
                        height={50}
                      />
                      <span className="absolute md:hidden top-4 right-2 bg-red-500 text-white rounded-full px-1 text-xs">
                        {unread}
                      </span>
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
                {roomid == "" && chatwindow != "none" && (
                  <div className="df">
                    <div className="pfp ml-2 cursor-pointer">
                      <Image
                        className="h-10 w-10 rounded-full"
                        src={usermetadata[chatwindow].pfp}
                        height={50}
                        width={50}
                        alt={chatwindow}
                      ></Image>
                    </div>
                    <div className="username text-2xl mt-2 ml-2">
                      {usermetadata[chatwindow].userName}
                    </div>
                    {!chprevchat ? (
                      <button onClick={startchat}>
                        Start Chat with {usermetadata[chatwindow].userName}
                      </button>
                    ) : (
                      <></>
                    )}
                  </div>
                )}
                {chats &&
                  chats.map((chat, index) =>
                    chat.type == "p" ? (
                      <div
                        className="key mx-6 cursor-pointer"
                        key={index}
                        onClick={() => {
                          router.push(
                            `/feed/messages?roomid=${
                              chat.roomid
                            }&chattype=p&chatwindow=${
                              chat.participants[0] == userdata.uid
                                ? chat.participants[1]
                                : chat.participants[0]
                            }`
                          );
                        }}
                      >
                        <div className="flex my-4 ">
                          <div className="pfp mr-2">
                            {chat.participants[0] == userdata.uid ? (
                              <>
                                <div className="relative">
                                  <Image
                                    className="h-10 w-10 rounded-full"
                                    src={usermetadata[chat.participants[1]].pfp}
                                    height={50}
                                    width={50}
                                    alt={chat.participants[1]}
                                  />
                                  {
                                    <div
                                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${
                                        formatLastSeen(
                                          usermetadata[chat.participants[1]]
                                            .lastseen
                                        ) != "Active"
                                          ? "bg-gray-300"
                                          : "bg-green-500"
                                      }`}
                                    />
                                  }
                                </div>
                              </>
                            ) : (
                              <div className="relative">
                                <Image
                                  className="h-10 w-10 rounded-full"
                                  src={usermetadata[chat.participants[0]].pfp}
                                  height={50}
                                  width={50}
                                  alt={chat.participants[0]}
                                />
                                {
                                  <div
                                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${
                                      formatLastSeen(
                                        usermetadata[chat.participants[0]]
                                          .lastseen
                                      ) != "Active"
                                        ? "bg-gray-300"
                                        : "bg-green-500"
                                    }`}
                                  />
                                }
                              </div>
                            )}
                          </div>

                          <div className="username font-bold text-xl ">
                            {chat.participants[0] == userdata.uid
                              ? usermetadata[chat.participants[1]].userName
                              : usermetadata[chat.participants[0]].userName}
                            <div className="ds font-light opacity-75 text-sm">
                              {chat.lastMessage &&
                              chat.lastMessage?.type === "text"
                                ? chat.lastMessage.text.substr(0, 40)
                                : chat.lastMessage?.type === "media"
                                ? "Media"
                                : "Gif"}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="key cursor-pointer"
                        key={index}
                        onClick={() => {
                          router.push(
                            `/feed/messages?roomid=${chat.roomid}&chattype=g&chatwindow=${chat.title}`
                          );
                        }}
                      >
                        <div className="flex mx-6">
                          <Image
                            className="h-10 w-10 rounded-full mr-2"
                            src={pfps[chat.roomid]}
                            height={50}
                            width={50}
                            alt=""
                          />
                          <div className="d">
                            <div className="title font-bold text-xl">
                              {chat.title}
                            </div>
                            <div className="sd">
                              <div className="ds font-light opacity-75 text-sm">
                                <div className="flex">
                                  <Image
                                    alt=""
                                    src={
                                      usermetadata[chat.lastMessage.sender].pfp
                                    }
                                    height={20}
                                    width={20}
                                    className="rounded-full mr-1"
                                  />
                                  {chat.lastMessage.type === "text"
                                    ? chat.lastMessage.text.substr(0, 40)
                                    : chat.lastMessage.type === "media"
                                    ? "Media"
                                    : "Gif"}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* {chat.participants.map(
                          (participant) => usernames[participant] + " "
                        )}{" "} */}
                      </div>
                    )
                  )}
              </div>
            )}
            {checkchat() && (
              <div
                className={`chatwindow w-full lg
              :w-2/3 border-2 ${
                roomdata.theme == "love"
                  ? "bg-[url('/chatbg/love.jpeg')]"
                  : roomdata.theme == "space"
                  ? "bg-[url('/chatbg/space.jpg')]"
                  : roomdata.theme == "heaven"
                  ? "bg-[url('/chatbg/heaven.jpeg')]"
                  : "bg-fuchsia-100"
              } dark:bg-black md:dark:bg-gray-700  bg-clip-padding md:backdrop-filter md:backdrop-blur-3xl md:bg-opacity-10 shadow-2xl border-none  md:rounded-2xl h-full relative`}
              >
                {roomid != "" && (
                  <>
                    <div className="overflow-y-auto h-full pb-20  pt-10 w-full">
                      <div className="fixed top-0 left-0 right-0 rounded-b-3xl z-50 bg-white dark:bg-feedheader shadow-lg transition-all duration-300 ease-in-out">
                        <div className="container mx-auto px-4 py-3">
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => {
                                router.push("/feed/messages");
                                // Additional actions if needed
                              }}
                              className="p-2 -ml-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition duration-200 focus:outline-none"
                              aria-label="Back to messages"
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
                                  d="M15 19l-7-7 7-7"
                                />
                              </svg>
                            </button>

                            <div
                              className="flex items-center flex-grow ml-4 cursor-pointer"
                              onClick={() => setchatdetailopen(true)}
                            >
                              {chattype === "p" ? (
                                <>
                                  <Image
                                    src={usermetadata[chatwindow].pfp}
                                    alt={usermetadata[chatwindow].userName}
                                    height={100}
                                    width={100}
                                    className="w-10 h-10 rounded-full object-cover mr-3 shadow-sm"
                                  />
                                  <div className="flex flex-col">
                                    <span className="text-lg font-semibold text-gray-800 dark:text-white">
                                      {usermetadata[chatwindow].userName}
                                    </span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                      {formatLastSeen(
                                        usermetadata[chatwindow].lastseen
                                      )}
                                    </span>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <Image
                                    src={roomdata.pfp}
                                    height={100}
                                    width={100}
                                    alt={chatwindow}
                                    className="w-9 h-9 rounded-full object-cover mr-3 shadow-sm"
                                  />
                                  <span className="text-lg font-semibold text-gray-800 dark:text-white">
                                    {chatwindow}
                                  </span>
                                </>
                              )}
                            </div>

                            <div className="flex items-center space-x-2">
                              {/* Add more action buttons here if needed */}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex mt-10 md:mt-20 justify-center">
                        {currentmsglength < maxlength && (
                          <button
                            onClick={() => {
                              // rm = maxlength - currentmsglength;
                              setcurrentmsglength(currentmsglength + 50);
                              setloadingold(true);
                            }}
                          >
                            Load older Messages{maxlength - currentmsglength}
                          </button>
                        )}
                      </div>

                      {messages.map((message) => (
                        <motion.div
                          onClick={() => {
                            setshowaddfiles(false);
                            setgifopen(false);
                          }}
                          className="px-3 md:px-6 "
                          key={
                            message.timestamp + message.sender + message.text
                          }
                          initial={{ opacity: 0, y: 50 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5 }}
                        >
                          {message.sender == userdata.uid ? (
                            <div className="ko flex justify-end my-5 ml-28">
                              <div
                                className="e  text-right shadow-xl  bg-fuchsia-300 dark:bg-fuchsia-500 p-2 lg:p-5 rounded-2xl md:rounded-3xl rounded-tr-none cursor-pointer"
                                onClick={() => handledropdown(message)}
                              >
                                <div className="lp">
                                  <div className="flex justify-end">
                                    <div className="time text-xs opacity-50 mr-2 mt-1">
                                      {convertToChatTime(message.timestamp)}
                                    </div>
                                    {/* <div className="td text-sm font-bold">
                                      {usernames[message.sender]}
                                    </div> */}
                                    <Image
                                      className="rounded-full h-5 w-5 ml-1"
                                      src={userdata.pfp}
                                      alt="Profile Pic"
                                      height={50}
                                      width={50}
                                    />
                                  </div>
                                  <div className="lp">
                                    {message.type == "gif" && (
                                      <>
                                        {" "}
                                        <Image
                                          className=" rounded-xl text-center"
                                          src={message.text}
                                          alt=""
                                          height={100}
                                          width={100}
                                        />
                                      </>
                                    )}
                                    {message.type == "media" && (
                                      <div
                                        className="flex"
                                        onClick={() => {
                                          setMediaViewerOpen(true);
                                          setmediaviewerfiles(message.text);
                                        }}
                                      >
                                        {message.text.map((media, index) => (
                                          <div key={index}>
                                            {media.startsWith(
                                              "https://firebasestorage"
                                            ) &&
                                              (media.includes("mp4") ||
                                                media.includes("mov") ||
                                                media.includes("mkv") ||
                                                media.includes("hevc")) && (
                                                <video
                                                  loop
                                                  src={media}
                                                  alt=""
                                                  controls
                                                  className="rounded-xl h-36 w-36 m-2 object-cover"
                                                />
                                              )}
                                            {media.startsWith(
                                              "https://firebasestorage"
                                            ) &&
                                              (media.includes("jpg") ||
                                                media.includes("heif") ||
                                                media.includes("jpeg")) && (
                                                <Image
                                                  src={media}
                                                  alt=""
                                                  height={100}
                                                  width={100}
                                                  className="rounded-xl h-36 w-36 m-2 object-cover"
                                                  onContextMenu={preventDefault} // Prevent right-click context menu
                                                  onMouseDown={preventDefault} // Prevent drag start
                                                  onDragStart={preventDefault} // Prevent drag
                                                />
                                              )}
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    {message.type == "text" &&
                                      (message.text ? (
                                        <span className="fg text-lg md:text-xl text-wrap">
                                          {message.text
                                            .split(/(@\S+|https?:\/\/\S+)/)
                                            .map((part, index) => {
                                              if (part.startsWith("@")) {
                                                // If it's a mention, create a link
                                                return (
                                                  <a
                                                    href={`/${part.slice(1)}`}
                                                    key={index}
                                                  >
                                                    <strong>{part}</strong>
                                                  </a>
                                                );
                                              } else if (
                                                part.includes("muse.nofilter")
                                              ) {
                                                // If it's a Muse post, create a link
                                                return (
                                                  <a
                                                    href={message.text}
                                                    key={message.text}
                                                  >
                                                    <div className="flex items-center justify-center px-4 py-2 rounded-md bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold hover:from-purple-600 hover:to-pink-700 transition duration-300">
                                                      <span>See Post</span>
                                                      <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-5 w-5 ml-2"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                      >
                                                        <path
                                                          fillRule="evenodd"
                                                          d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                                                          clipRule="evenodd"
                                                        />
                                                      </svg>
                                                    </div>
                                                  </a>
                                                );
                                              } else if (
                                                part.startsWith("http")
                                              ) {
                                                // If it's a website link, create a link
                                                return (
                                                  <a href={part} key={index}>
                                                    <strong>{part}</strong>
                                                  </a>
                                                );
                                              } else {
                                                // Otherwise, render it as plain text
                                                return (
                                                  <React.Fragment key={index}>
                                                    {part}
                                                  </React.Fragment>
                                                );
                                              }
                                            })}
                                        </span>
                                      ) : (
                                        <div className="fg text-xl">
                                          {message.text}
                                        </div>
                                      ))}
                                  </div>
                                </div>
                                {isDropdownOpen &&
                                  selectedMessage == message && (
                                    <motion.div
                                      className="dropdown-menu  mt-4 flex"
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{
                                        opacity: isDropdownOpen ? 1 : 0,
                                        height: isDropdownOpen ? "auto" : 0,
                                      }}
                                      transition={{
                                        duration: 0.3,
                                        ease: "easeInOut",
                                      }}
                                      layoutTransition={{
                                        type: "tween",
                                        duration: 0.3,
                                        ease: "easeInOut",
                                      }}
                                    >
                                      <button
                                        onClick={() =>
                                          handlemessagereply(message)
                                        }
                                      >
                                        <Image
                                          className="h-5 w-5 rounded-full"
                                          src="/icons/reply.png"
                                          height={50}
                                          width={50}
                                          alt=""
                                        />
                                      </button>
                                      {message.readstatus ? (
                                        <>
                                          {""}
                                          <Image
                                            className="w-5 h-5 
                                            "
                                            src="/icons/readt.png"
                                            height={100}
                                            width={100}
                                            alt="delete"
                                          />
                                        </>
                                      ) : (
                                        <>
                                          {" "}
                                          <Image
                                            className="w-5 h-5 "
                                            src="/icons/read.png"
                                            height={50}
                                            width={50}
                                            alt="delete"
                                          />
                                        </>
                                      )}
                                      <button
                                        className=" ml-2 dropdown-item mr-2 disabled:hidden"
                                        onClick={() => handleCopy(message.text)}
                                        disabled={
                                          message.type == "media" ||
                                          message.type == "gif"
                                        }
                                      >
                                        <Image
                                          className="w-5 h-5 "
                                          src="/icons/copy.png"
                                          height={50}
                                          width={50}
                                          alt="delete"
                                        />
                                      </button>
                                      <button
                                        className="dropdown-item"
                                        onClick={handleDelete}
                                      >
                                        <Image
                                          className="w-5 h-5 "
                                          src="/icons/delete.png"
                                          height={50}
                                          width={50}
                                          alt="delete"
                                        />
                                      </button>
                                      {/* Delete button */}
                                    </motion.div>
                                  )}
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="ko  flex right-0 my-5">
                                <div
                                  className="e bg-purple-300 dark:bg-purple-500 p-2 lg:p-5 shadow-xl rounded-2xl  md:rounded-3xl rounded-tl-none"
                                  onClick={() => handledropdown(message)}
                                >
                                  <div className="lp">
                                    <div className="flex">
                                      {/* {console.log(pfps[message.sender])} */}
                                      {usermetadata[message.sender] && (
                                        <Image
                                          src={usermetadata[message.sender].pfp}
                                          className="rounded-full h-5 w-5 mr-1"
                                          alt="Profile Pic"
                                          height={50}
                                          width={50}
                                        />
                                      )}

                                      <div className="time text-xs ml-1  opacity-50">
                                        {convertToChatTime(message.timestamp)}
                                      </div>
                                    </div>
                                    {message.type == "gif" && (
                                      <>
                                        {" "}
                                        <Image
                                          className=" rounded-xl text-center"
                                          src={message.text}
                                          alt=""
                                          height={100}
                                          width={100}
                                        />
                                      </>
                                    )}
                                    {message.type == "media" && (
                                      <div
                                        className="flex"
                                        onClick={() => {
                                          setmediaviewerfiles(message.text);
                                          setMediaViewerOpen(true);
                                        }}
                                      >
                                        {message.text.map((media, index) => (
                                          <div key={index}>
                                            {media.startsWith(
                                              "https://firebasestorage"
                                            ) &&
                                              (media.includes("mp4") ||
                                                media.includes("mov") ||
                                                media.includes("mkv") ||
                                                media.includes("hevc")) && (
                                                <video
                                                  loop
                                                  src={media}
                                                  alt=""
                                                  controls
                                                  className="rounded-xl h-36 w-36 m-2 object-cover"
                                                />
                                              )}
                                            {media.startsWith(
                                              "https://firebasestorage"
                                            ) &&
                                              (media.includes("jpg") ||
                                                media.includes("heif") ||
                                                media.includes("jpeg")) && (
                                                <Image
                                                  src={media}
                                                  alt=""
                                                  height={100}
                                                  width={100}
                                                  className="rounded-xl h-36 w-36 m-2 object-cover"
                                                />
                                              )}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    {message.type == "text" &&
                                      (message.text ? (
                                        <span className="fg text-lg md:text-xl text-wrap">
                                          {message.text
                                            .split(/(@\S+|https?:\/\/\S+)/)
                                            .map((part, index) => {
                                              if (part.startsWith("@")) {
                                                // If it's a mention, create a link
                                                return (
                                                  <a
                                                    href={`/${part.slice(1)}`}
                                                    key={index}
                                                  >
                                                    <strong>{part}</strong>
                                                  </a>
                                                );
                                              } else if (
                                                part.includes("muse.nofilter")
                                              ) {
                                                // If it's a Muse post, create a link
                                                return (
                                                  <a
                                                    href={message.text}
                                                    key={message.text}
                                                  >
                                                    <div className="flex items-center justify-center px-4 py-2 rounded-md bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold hover:from-purple-600 hover:to-pink-700 transition duration-300">
                                                      <span>See Post</span>
                                                      <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-5 w-5 ml-2"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                      >
                                                        <path
                                                          fillRule="evenodd"
                                                          d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                                                          clipRule="evenodd"
                                                        />
                                                      </svg>
                                                    </div>
                                                  </a>
                                                  // <>Muse Post</>
                                                );
                                              } else if (
                                                part.startsWith("http")
                                              ) {
                                                // If it's a website link, create a link
                                                return (
                                                  <a href={part} key={index}>
                                                    <strong>{part}</strong>
                                                  </a>
                                                );
                                              } else {
                                                // Otherwise, render it as plain text
                                                return (
                                                  <React.Fragment key={index}>
                                                    {part}
                                                  </React.Fragment>
                                                );
                                              }
                                            })}
                                        </span>
                                      ) : (
                                        <div className="fg text-xl">
                                          {message.text}
                                        </div>
                                      ))}
                                  </div>
                                  {isDropdownOpen &&
                                    selectedMessage == message && (
                                      <motion.div
                                        className="dropdown-menu  mt-4 flex"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{
                                          opacity: isDropdownOpen ? 1 : 0,
                                          height: isDropdownOpen ? "auto" : 0,
                                        }}
                                        transition={{
                                          duration: 0.3,
                                          ease: "easeInOut",
                                        }}
                                        layoutTransition={{
                                          type: "tween",
                                          duration: 0.3,
                                          ease: "easeInOut",
                                        }}
                                      >
                                        <button
                                          onClick={() =>
                                            handlemessagereply(message)
                                          }
                                        >
                                          <Image
                                            className="h-5 w-5 rounded-full"
                                            src="/icons/reply.png"
                                            height={50}
                                            width={50}
                                            alt=""
                                          />
                                        </button>

                                        <button
                                          className=" ml-2 dropdown-item mr-2 disabled:hidden"
                                          onClick={() =>
                                            handleCopy(message.text)
                                          }
                                          disabled={
                                            message.type == "media" ||
                                            message.type == "gif"
                                          }
                                        >
                                          <Image
                                            className="w-5 h-5 "
                                            src="/icons/copy.png"
                                            height={50}
                                            width={50}
                                            alt="delete"
                                          />
                                        </button>
                                      </motion.div>
                                    )}
                                </div>
                              </div>
                            </>
                          )}
                        </motion.div>
                      ))}

                      <div ref={messagesEndRef} />
                      <div className="fixed bottom-0 left-0 right-0 rounded-t-3xl bg-white dark:bg-feedheader shadow-lg p-4 transition-all duration-300 ease-in-out">
                        <div className="container mx-auto">
                          <div className="flex items-center space-x-2">
                            <div className="flex-grow">
                              <div className="relative">
                                <input
                                  type="text"
                                  placeholder="Type a message..."
                                  className="w-full py-3 px-4 pr-12 bg-gray-100 dark:bg-black text-gray-800 dark:text-gray-200 rounded-3xl outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition duration-200"
                                  ref={inputref}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      if (
                                        inputref.current.value.trim().length > 0
                                      )
                                        sendMesage();
                                    }
                                  }}
                                />
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                  <button
                                    onClick={sendMesage}
                                    // disabled={messagetext.trim().length === 0}
                                    className="p-2 bg-fuchsia-100 dark:bg-fuchsia-400 text-white rounded-full shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    aria-label="Send message"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-4 w-4"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>

                            <button
                              className="p-3 bg-gray-100 dark:bg-black text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 transition duration-200"
                              onClick={() => {
                                setgifopen(!gifopen);
                                setshowaddfiles(false);
                              }}
                              aria-label="Add GIF"
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
                                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            </button>

                            <button
                              className="p-3 bg-gray-100 dark:bg-black text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 transition duration-200"
                              onClick={() => {
                                setgifopen(false);
                                setshowaddfiles(!showaddfiles);
                              }}
                              aria-label="Attach file"
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
                                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
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

                {!roomid && (
                  <div className="text-3xl text-center align-middle mt-56 my-10">
                    Select a chat to start messaging
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
