"use client"
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
        collection(db, "username"),
        where("userName", ">=", searchtext),
        orderBy("userName"),
        limit(5)
      );
      const userNameSnapshot = await getDocs(userNameQuery);

      const fullNameQuery = query(
        collection(db, "username"),
        where("fullname", ">=", searchtext),
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
    <div className="relative">
      <Toaster />
      <div
        className={`fixed inset-0 text-black z-50 flex items-center justify-center transition-all duration-500 ${showModal ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
      >
        <div
          className={`absolute inset-0 rounded-2xl ${currentTheme === "dark"
            ? "bg-gray-800 bg-clip-padding backdrop-filter backdrop-blur-3xl bg-opacity-20 shadow-2xl border-1 border-gray-600"
            : "bg-white bg-clip-padding backdrop-filter backdrop-blur-3xl bg-opacity-20 shadow-2xl border-1 border-black"
            } h-full transition-all duration-500 ${showModal ? "opacity-100" : "opacity-0"
            }`}
        />
        <div
          className={`${currentTheme === "dark"
            ? "bg-gray-800 text-white"
            : "bg-white text-black"
            } w-96 p-8 rounded-xl shadow-2xl relative z-10 transition-all duration-500 ${showModal ? "translate-y-0" : "translate-y-full"
            }`}
        >
          <h2 className="text-xl font-bold mb-4">Create Group Chat</h2>
          <label className="mb-4 block">
            Chat Name:
            <input
              type="text"
              value={chatName}
              onChange={(e) => setChatName(e.target.value)}
              className={`border ${currentTheme === "dark"
                ? "border-gray-600 bg-gray-700 text-white"
                : "border-gray-300"
                } rounded-lg p-2 w-full mt-2`}
            />
          </label>
          <label className="mb-4 block">
            Chat Info:
            <input
              type="text"
              value={chatInfo}
              onChange={(e) => setChatInfo(e.target.value)}
              className={`border ${currentTheme === "dark"
                ? "border-gray-600 bg-gray-700 text-white"
                : "border-gray-300"
                } rounded-lg p-2 w-full mt-2`}
            />
          </label>
          <label className="mb-4 block">
            Group Picture:
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className={`border ${currentTheme === "dark"
                ? "border-gray-600 bg-gray-700 text-white"
                : "border-gray-300"
                } rounded-lg p-2 w-full mt-2`}
            />
            {groupPicture && (
              <div className="mt-4 flex  justify-center">
                <Image
                  src={URL.createObjectURL(groupPicture)}
                  alt="Group Picture Preview"
                  className="w-20 h-20 rounded-full"
                  height={100}
                  width={100}
                />
              </div>
            )}
          </label>
          <label className="mb-4 block">
            Add Participants:
            {usernames.map((participant) => (
              <li key={participant}>{participant}</li>
            ))}
            <input
              type="text"
              value={searchtext}
              onChange={(e) => setSearchtext(e.target.value)}
              className={`border ${currentTheme === "dark"
                ? "border-gray-600 bg-gray-700 text-white"
                : "border-gray-300"
                } rounded-lg p-2 w-full mt-2`}
              placeholder="Search"
            />
            {searchResults.length > 0 && searchtext.length > 0 && (
              <div className="search-results mt-2">
                <ul>
                  {searchResults.map((user) => (
                    <div
                      onClick={() => handleAddParticipant(user)}
                      key={user.id}
                      className="cursor-pointer"
                    >
                      <li>{user.userName}</li>
                    </div>
                  ))}
                </ul>
              </div>
            )}
          </label>
          <div className="flex justify-between">
            <button
              onClick={handleCreateGroupChat}
              className={`${currentTheme === "dark"
                ? "bg-purple-700 hover:bg-purple-600"
                : "bg-purple-600 hover:bg-purple-700"
                } text-white px-4 py-2 rounded-lg transition-colors duration-300`}
                disabled={loading}
            >
              {loading ? "Creating..." : "Create"}
            </button>
            <button
              onClick={() => onClose()}
              className={`${currentTheme === "dark"
                ? "bg-gray-600 hover:bg-gray-500"
                : "bg-gray-400 hover:bg-gray-500"
                } text-white px-4 py-2 rounded-lg transition-colors duration-300`}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupChat;