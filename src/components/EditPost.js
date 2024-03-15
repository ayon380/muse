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
const EditPost = ({ post, userdata, db,refetchPost, setShowedit }) => {
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
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="modal bg-opacity-50 bg-black  h-screen w-screen flex items-center justify-center">
        <div className="bof bg-white p-4 rounded-xl">
          <h1 className="text-2xl mb-4 text-center">Edit Post</h1>

          <div>
            <label htmlFor="caption">Caption</label>
            <textarea
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 w-full"
            />
          </div>

          <div className="tagged mt-4">
            <label className="block mb-2">Add Users to Tag:</label>
            <ul>
              {usernames.map((participant, idx) => (
                <div
                  className="sd flex items-center mb-2"
                  key={participant.uid}
                >
                  <li className="mr-2">{participant}</li>
                  <button
                    className="bg-red-500 text-white p-1 rounded"
                    onClick={() => handleRemoveParticipant(participant, idx)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </ul>

            <input
              type="text"
              value={searchtext}
              onChange={(e) => setSearchtext(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 w-full mt-2"
              placeholder="Search"
            />
            {searchResults.length > 0 && searchtext.length > 0 && (
              <div className="search-results mt-2">
                <ul>
                  {searchResults.map((user) => (
                    <div
                      onClick={() => handleAddParticipant(user)}
                      key={user.id + Math.random()}
                      className="cursor-pointer"
                    >
                      <li>{user.userName}</li>
                    </div>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-end">
            <button
              className="bg-gray-300 text-black px-4 py-2 rounded mr-2"
              onClick={() => setShowedit(false)}
            >
              Cancel
            </button>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              type="submit"
              onClick={handleEdit}
            >
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPost;
