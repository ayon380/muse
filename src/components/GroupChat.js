"use client";
import React, { useState } from "react";
import Image from "next/image";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  arrayUnion,
} from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import toast, { Toaster } from "react-hot-toast";
import { useTheme } from "next-themes";
import BottomSheet from "./BottomSheet";
import imageCompression from "browser-image-compression";
import { getStorage, ref, getDownloadURL, uploadBytes } from "firebase/storage";
const options = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1000,
  useWebWorker: true,
};
const GroupChat = ({ userdata, onClose }) => {
  const db = getFirestore();
  const storage = getStorage();
  const { systemTheme, theme, setTheme } = useTheme();
  const currentTheme = theme === "system" ? systemTheme : theme;

  const [chatName, setChatName] = useState("");
  const [chatInfo, setChatInfo] = useState("");
  const [searchtext, setSearchtext] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [usernames, setUsernames] = useState([userdata.userName]);
  const [participants, setParticipants] = useState([userdata.uid]);
  const [loading, setLoading] = useState(false);
  const [groupPicture, setGroupPicture] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const searchUsers = async () => {
    try {
      console.log("searchtext", searchtext);
      const userNameQuery = query(
        collection(db, "users"),
        where("userName", ">=", searchtext),
        where("followers", "array-contains", userdata.uid),
        orderBy("userName"),
        limit(5)
      );
      const userNameSnapshot = await getDocs(userNameQuery);

      const fullNameQuery = query(
        collection(db, "username"),
        where("fullname", ">=", searchtext),
        where("followers", "array-contains", userdata.uid),
        orderBy("fullname"),
        limit(5)
      );
      const fullNameSnapshot = await getDocs(fullNameQuery);
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

      setSearchResults(results);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const handleAddParticipant = (participant) => {
    if (participants.includes(participant.uid)) {
      return;
    }
    setUsernames([...usernames, participant.userName]);
    setParticipants([...participants, participant.uid]);
  };

  const handleCreateGroupChat = async () => {
    try {
      setLoading(true);
      if (participants.length <= 2 || chatName === "" || !groupPicture) {
        toast.error(
          "Please add more than 2 participants, a chat name, and a group picture"
        );
        return;
      }
      console.log("dsfsdfd");
      const picref = ref(storage, "images/" + Date.now() + ".jpg");
      console.log(groupPicture);
      const compressedFile = await imageCompression(groupPicture, options);
      console.log(compressedFile);
      await uploadBytes(picref, compressedFile);
      const groupPictureurl = await getDownloadURL(picref);
      console.log(groupPictureurl);
      const chatRoomRef = collection(db, "messagerooms");
      const newChatRoom = {
        title: chatName,
        type: "g",
        participants: participants,
        messages: [],
        timestamp: Date.now(),
        info: chatInfo,
        pfp: groupPictureurl,
      };
      console.log(newChatRoom);
      const docRef = await addDoc(chatRoomRef, newChatRoom);
      const id = docRef.id;
      await updateDoc(doc(db, "messagerooms", docRef.id), {
        roomid: docRef.id,
      });
      participants.forEach(async (participant) => {
        const useref = doc(db, "chats", participant);
        await updateDoc(useref, { rooms: arrayUnion(id) });
      });

      setChatName("");
      toast.success("Group chat created successfully!");
      setChatInfo("");
      onClose();
      setParticipants([]);
      setGroupPicture(null);
      setLoading(false);
    } catch (error) {
      toast.error("Error creating group chat");

      console.error("Error creating group chat:", error.message);
    }
  };

  React.useEffect(() => {
    if (searchtext.length > 0) {
      searchUsers();
    } else {
      setSearchResults([]);
    }
  }, [searchtext]);

  React.useEffect(() => {
    setShowModal(true);
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setGroupPicture(file);
    }
  };

  return (
    <BottomSheet show={true} heading="Create Group Chat" onClose={onClose}>
      <div className="bg-white dark:bg-black rounded-lg shadow-md p-6">
        <div className="mb-4">
          <label
            htmlFor="chatName"
            className="block text-gray-700 dark:text-gray-300 font-bold mb-2"
          >
            Chat Name:
          </label>
          <input
            type="text"
            id="chatName"
            value={chatName}
            onChange={(e) => setChatName(e.target.value)}
            className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="chatInfo"
            className="block text-gray-700 dark:text-gray-300 font-bold mb-2"
          >
            Chat Info:
          </label>
          <input
            type="text"
            id="chatInfo"
            value={chatInfo}
            onChange={(e) => setChatInfo(e.target.value)}
            className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="groupPicture"
            className="block text-gray-700 dark:text-gray-300 font-bold mb-2"
          >
            Group Picture:
          </label>
          <input
            type="file"
            id="groupPicture"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
          {groupPicture && (
            <div className="mt-4 flex justify-center">
              <Image
                src={URL.createObjectURL(groupPicture)}
                height={100}
                width={100}
                alt="Group Picture"
                className="rounded-md"
              />
            </div>
          )}
        </div>
        <div className="mb-4">
          <label
            htmlFor="participants"
            className="block text-gray-700 dark:text-gray-300 font-bold mb-2"
          >
            Add Participants:
          </label>
          <ul className="mb-2">
            {usernames.map((participant) => (
              <li
                key={participant}
                className="text-gray-800 dark:text-gray-300"
              >
                {participant}
              </li>
            ))}
          </ul>
          <input
            type="text"
            id="participants"
            value={searchtext}
            onChange={(e) => setSearchtext(e.target.value)}
            className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
            placeholder="Search"
          />
          {searchResults.length > 0 && searchtext.length > 0 && (
            <div className="search-results mt-2 max-h-48 overflow-y-auto rounded-md shadow-md bg-white dark:bg-gray-700">
              <ul>
                {searchResults.map((user) => (
                  <li
                    key={user.id}
                    onClick={() => handleAddParticipant(user)}
                    className="px-4 py-2 cursor-pointer text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                  >
                    {user.userName}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleCreateGroupChat}
            className={`${
              loading
                ? "bg-purple-600 hover:bg-purple-700 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700"
            } text-white px-4 py-2 rounded-md transition-colors duration-200 mr-2 disabled:opacity-50`}
            disabled={loading || participants.length <= 2 || !groupPicture}
          >
            {loading ? "Creating..." : "Create"}
          </button>
          <button
            onClick={() => onClose()}
            className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-md transition-colors duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </BottomSheet>
  );
};

export default GroupChat;
