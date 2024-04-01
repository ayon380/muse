"use client";
import app from "@/lib/firebase/firebaseConfig";
import React, { useRef, useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import "../../styles/gradients.css";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Link from "next/navigation";
import GifPicker from "gif-picker-react";
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
import { useSidebarStore } from "@/app/store/zustand";
import imageCompression from "browser-image-compression";
const SearchChat = dynamic(() => import("@/components/SearchChat"));
const GroupChat = dynamic(() => import("@/components/GroupChat"));
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
  const [userdata, setUserData] = useState(null);
  const [currentmsglength, setcurrentmsglength] = useState(50);
  const messagesEndRef = React.useRef(null);
  const [chatuserdata, setChatuserdata] = useState("");
  const [maxlength, setmaxlength] = useState(0);
  const [pfps, setPfps] = useState({});

  const [usernames, setusernames] = useState({});
  const db = getFirestore(app);
  const [searchResults, setSearchResults] = useState([]);
  const [roomid, setRoomid] = useState(room);
  const [messagetext, setMessagetext] = useState("");
  const [gif, setgif] = useState(null);
  const [chattype, setChattype] = useState(chatt);
  const [messages, setMessages] = useState([{}]);
  const [chats, setChats] = useState([]);
  const [opengrpchatcreate, setopengrpchatcreate] = useState(false);
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
  const { chatopen, setchatopen, isOpen, toggle } = useSidebarStore();
  //function to get data of messagerooms'
  const [searchopen, setsearchopen] = useState(false);
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
  //function to get chats of user
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
            getgpfp(roomId);
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
          const msgref = collection(db, "messages");
          const msgdata = {
            sender: userdata.uid,
            text: messagetext,
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
          setMessagetext("");
          sendNotification(q.id, {
            type: "message",
            chattype: chattype,
            sender: userdata.uid,
            text: messagetext,
            messagetype: "text",
            roomid: roomid,
            receiver: chatwindow,
            timestamp: Date.now(),
          });
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
          setMessagetext("");
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
          setMessagetext("");
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
    setMessagetext(`@${usernames[message.sender]} ${message.text}`);
  };
  return (
    <div className="lg:ml-5 w-full h-full overflow-hidden">
      <Toaster />
      {userdata && (
        <div className="main2 w-full lg:rounded-2xl  dark:bg-black md:dark:bg-gray-900 bg-white md:bg-clip-padding md:backdrop-filter md:backdrop-blur-3xl md:bg-opacity-20 shadow-2xl border-1 border-black h-full">
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
                />
              ) : (
                <GroupChatDetail
                  userdata={userdata}
                  usernames={usernames}
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
                setChatwindow={setChatwindow}
                usernames={usernames}
              />
            )}
            {showaddfiles && (
              <div className="absolute right-0 w-full bottom-4 z-40 mb-12 lg:mb-20 lg:mr-10 bg-opacity-85 bg-white rounded-xl p-4">
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
                    className="btn ml-3 py-3 px-4 disabled:text-gray-400 disabled:cursor-not-allowed "
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
                className="followingusers w-full lg:w-1/3 m-6 overflow-y-auto"
                key={roomid}
              >
                <div className="flex w-full justify-between">
                  <div className="messages text-3xl lg:text-3xl   ">
                    Messages
                  </div>
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
                    <button onClick={toggle}>
                      <Image
                        className="h-7 w-7 mr-2 dark:invert"
                        src="/icons/sidebar.png"
                        width={50}
                        alt="Sidebar"
                        height={50}
                      />
                    </button>
                    <button onClick={() => setsearchopen(true)}>
                      <Image
                        className="h-6 w-6 dark:invert"
                        src="/icons/search.png"
                        width={50}
                        height={50}
                        alt="Search"
                      />
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
                {chats &&
                  chats.map((chat, index) =>
                    chat.type == "p" ? (
                      <div
                        className="key cursor-pointer"
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
                              <Image
                                className="h-10 w-10 rounded-full"
                                src={pfps[chat.participants[1]]}
                                height={50}
                                width={50}
                                alt={chat.participants[1]}
                              ></Image>
                            ) : (
                              <Image
                                className="h-10 w-10 rounded-full"
                                src={pfps[chat.participants[0]]}
                                height={50}
                                width={50}
                                alt={chat.participants[0]}
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
                          router.push(
                            `/feed/messages?roomid=${chat.roomid}&chattype=g&chatwindow=${chat.title}`
                          );
                        }}
                      >
                        <div className="flex">
                          <Image
                            className="h-10 w-10 rounded-full mr-2"
                            src={pfps[chat.roomid]}
                            height={50}
                            width={50}
                            alt=""
                          />
                          <div className="title font-bold text-xl">
                            {chat.title}
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
              :w-2/3 border-2 bg-violet-200 dark:bg-black md:dark:bg-gray-700  bg-clip-padding md:backdrop-filter md:backdrop-blur-3xl md:bg-opacity-10 shadow-2xl border-none  md:rounded-2xl h-full relative`}
              >
                {roomid != "" && (
                  <>
                    <div className="overflow-y-auto h-full pb-16 pt-10 w-full">
                      <div className="g fixed top-0 rounded-b-xl md:rounded-2xl h-10 pt-2 w-full text-center  backdrop-filter backdrop-blur-3xl  shadow-2xl  border-none">
                        <div className="flex justify-between mx-2">
                          <button
                            onClick={() => {
                              router.push("/feed/messages");
                              // setchatopen(false);
                              // setRoomid("");
                              // setChatwindow("");
                            }}
                          >
                            <Image
                              className=" h-4  w-4 dark:invert"
                              src="/icons/arrow.png"
                              height={50}
                              width={50}
                              alt=""
                            />
                          </button>
                          <div
                            className="lpa flex"
                            onClick={() => setchatdetailopen(true)}
                          >
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
                            {chattype == "g" && (
                              <>
                                {" "}
                                <Image
                                  className="h-7 w-7 rounded-full mr-2"
                                  src={roomdata.pfp}
                                  height={50}
                                  width={50}
                                  alt={chatwindow}
                                />{" "}
                                {chatwindow}
                              </>
                            )}
                          </div>
                          <div className="sa"></div>
                        </div>
                      </div>
                      <div className="flex justify-center">
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
                          className="px-6"
                          key={
                            message.timestamp + message.sender + message.text
                          }
                          initial={{ opacity: 0, y: 50 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5 }}
                        >
                          {message.sender == userdata.uid ? (
                            <div className="ko flex justify-end my-5 ">
                              <div className="e  text-right bg-purple-400 p-2 lg:p-3 rounded-xl">
                                <div
                                  className="lp"
                                  onClick={() => handledropdown(message)}
                                >
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
                                      <div className="flex">
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
                                                  onClick={() => {
                                                    window.open(media);
                                                  }}
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
                                                  onClick={() => {
                                                    window.open(media);
                                                  }}
                                                />
                                              )}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    {message.type == "text" &&
                                      (message.text ? (
                                        <span className="fg text-lg md:text-xl">
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
                                            filter invert-89 sepia-25 saturate-3907 hue-rotate-358 brightness-101 contrast-103"
                                            src="/icons/read.png"
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
                                <div className="e bg-purple-400 p-2 rounded-xl">
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
                                    <div className="flex">
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
                                                onClick={() => {
                                                  window.open(media);
                                                }}
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
                                                onClick={() => {
                                                  window.open(media);
                                                }}
                                              />
                                            )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  {message.type == "text" &&
                                    (message.text ? (
                                      <span className="fg text-lg md:text-xl">
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
                            </>
                          )}
                        </motion.div>
                      ))}

                      <div ref={messagesEndRef} />
                      <div className="textbox absolute flex bottom-5 md:bottom-0 rounded-xl pb-4  p-2 backdrop-filter backdrop-blur-xl w-full ">
                        <input
                          type="text"
                          placeholder="Type a message..."
                          className="placeholder-italic w-full h-10 text-lg px-1  rounded-xl text-black border-black transition-all duration-300 outline-none shadow-2xl hover:shadow-3xl focus:shadow-3xl  "
                          value={messagetext}
                          onChange={(e) => setMessagetext(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              sendMesage();
                            }
                          }}
                        ></input>
                        <button
                          className="m-1"
                          onClick={() => {
                            setgifopen(!gifopen);
                            setshowaddfiles(false);
                          }}
                        >
                          <Image
                            className="h-8 w-10 dark:invert"
                            src="/icons/gif.png"
                            height={50}
                            width={50}
                            alt="Gif"
                          />
                        </button>
                        <button
                          className="m-1"
                          onClick={() => {
                            setgifopen(false);
                            setshowaddfiles(!showaddfiles);
                          }}
                        >
                          <Image
                            className=" h-6 w-6 mr-1 dark:invert"
                            src="/icons/attach.png"
                            height={50}
                            width={50}
                            alt="Attach"
                          />
                        </button>
                        <button
                          onClick={sendMesage}
                          disabled={messagetext.length === 0}
                          className=" disabled:cursor-not-allowed disabled:text-gray-300"
                        >
                          <Image
                            className="h-6 w-6 m-1 dark:invert"
                            src="/icons/send.png"
                            height={50}
                            width={50}
                            alt="Send"
                          />
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
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
