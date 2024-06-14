import { updateDoc } from "firebase/firestore";
import React, { useEffect } from "react";
import { useState } from "react";
import {
  collection,
  addDoc,
  doc,
  query,
  where,
  arrayRemove,
  orderBy,
  limit,
  getDocs,
  getDoc,
  arrayUnion,
} from "firebase/firestore";
import toast from "react-hot-toast";
import BottomSheet from "./BottomSheet";
const EditPost = ({ post, userdata, db, refetchPost, setShowedit }) => {
  //   const [taggedusers, setTaggedusers] = useState(post.taggedUsers);
  const [caption, setCaption] = useState(post.caption);
  const [searchtext, setSearchtext] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [usernames, setUsernames] = useState([]);
  const [participants, setParticipants] = useState(post.taggedUsers);
  // const [showModal, setShowModal] = useState(false);
  useEffect(() => {
    const fetchUsernames = async () => {
      const uniqueUserIds = Array.from(new Set(post.taggedUsers)); // Filter out unique user IDs
      for (const user of uniqueUserIds) {
        const userRef = doc(db, "username", user);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userName = userDoc.data().userName;
          setUsernames((prevUsernames) => {
            if (!prevUsernames.includes(userName)) {
              return [...prevUsernames, userName];
            }
            return prevUsernames; // If username already exists, return the current state unchanged
          });
        }
      }
    };

    fetchUsernames();
  }, []);

  const searchUsers = async () => {
    try {
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

      // Filter out the current user's username from the search results
      const filteredResults = results.filter(
        (user) => user.userName !== userdata.userName
      );

      setSearchResults(filteredResults);
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

  const handleEdit = async () => {
    try {
      const postRef = doc(db, "posts", post.id);
      await updateDoc(postRef, {
        caption,
        taggedUsers: participants,
      });
      participants.forEach(async (participant) => {
        const userRef = doc(db, "username", participant);
        const userDoc = await getDoc(userRef);
        const dataref = doc(db, "users", userDoc.data().email);
        const dataa = await getDoc(dataref);
        if (!dataa.data().taggedPosts.includes(post.id)) {
          await updateDoc(dataref, {
            taggedPosts: arrayUnion(post.id),
          });
        }
      });
      setShowedit(false);
      refetchPost();
      toast.success("Post updated successfully");
    } catch (e) {
      console.log(e);
    }
  };
  useEffect(() => {
    if (searchtext.length > 0) {
      searchUsers();
    } else {
      setSearchResults([]);
    }
  }, [searchtext]);
  const handleRemoveParticipant = async (participantId, idx) => {
    console.log(participantId);
    console.log(participants);
    console.log(usernames);
    const userRef = doc(db, "username", participants[idx]);
    setParticipants((prevParticipants) =>
      prevParticipants.filter((id) => id !== prevParticipants[idx])
    );
    setUsernames((prevUsernames) =>
      prevUsernames.filter((participant) => participant !== participantId)
    );
    const userDoc = await getDoc(userRef);
    const dataRef = doc(db, "users", userDoc.data().email);
    await updateDoc(dataRef, {
      taggedPosts: arrayRemove(post.id),
    });
  };

  // ...Existing code

  return (
    <BottomSheet
      show={true}
      heading="Edit Post"
      onClose={() => setShowedit(false)}
    >
      <div className="flex flex-col space-y-4 p-5">
        <div>
          <label htmlFor="caption" className="block text-xl font-medium mb-2">
            Caption
          </label>
          <textarea
            id="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="border dark:text-white dark:bg-feedheader border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
          />
        </div>

        <div>
          <label className="block font-medium mb-2 text-xl">
            Add Users to Tag:
          </label>
          <ul className="flex flex-wrap -m-1 dark:text-white dark:bg-feedheader ">
            {usernames.map((participant, idx) => (
              <div className="flex items-center m-1" key={participant.uid}>
                <span className=" px-2 py-1 rounded-md mr-2">
                  {participant}
                </span>
                <button
                  className="text-red-500 hover:text-red-700 focus:outline-none"
                  onClick={() => handleRemoveParticipant(participant, idx)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </ul>
          <input
            type="text"
            value={searchtext}
            onChange={(e) => setSearchtext(e.target.value)}
            className="border dark:text-white dark:bg-feedheader  border-gray-300 rounded-lg p-2 w-full mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search"
          />
          {searchResults.length > 0 && searchtext.length > 0 && (
            <div className="search-results mt-2 bg-white dark:text-white dark:bg-feedheader  shadow rounded-lg">
              <ul className="max-h-48 overflow-y-auto">
                {searchResults.map((user) => (
                  <li
                    key={user.id + Math.random()}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleAddParticipant(user)}
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
            className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-700 mr-2"
            onClick={() => setShowedit(false)}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white"
            type="submit"
            onClick={handleEdit}
          >
            Update
          </button>
        </div>
      </div>
    </BottomSheet>
  );
};

export default EditPost;
