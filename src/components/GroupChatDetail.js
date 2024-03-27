import React, { useState, useEffect } from "react";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";
import {
  arrayRemove,
  collection,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  arrayUnion,
} from "firebase/firestore";
import { useRouter } from "next/navigation"; // Update import
import {
  getDownloadURL,
  ref,
  getStorage,
  uploadBytes,
} from "firebase/storage";
import imageCompression from "browser-image-compression";

const options = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
};

const GroupChatDetail = ({ onClose, roomdata, usernames, db }) => {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [newTitle, setNewTitle] = useState(roomdata.title);
  const [newInfo, setNewInfo] = useState(roomdata.info);
  const [newParticipants, setNewParticipants] = useState(roomdata.participants);
  const [newPfp, setNewPfp] = useState(null);
  const [newPfpPreview, setNewPfpPreview] = useState(roomdata.pfp);
  const storage = getStorage();

  // Search functionality
  const [searchtext, setSearchtext] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const searchUsers = async () => {
    try {
      const userNameQuery = query(
        collection(db, "username"),
        where("userName", ">=", searchtext),
        where("userName", "<=", searchtext + "\uf8ff"),
        orderBy("userName"),
        limit(5)
      );
      const userNameSnapshot = await getDocs(userNameQuery);

      const fullNameQuery = query(
        collection(db, "username"),
        where("fullname", ">=", searchtext),
        where("fullname", "<=", searchtext + "\uf8ff"),
        orderBy("fullname"),
        limit(5)
      );
      const fullNameSnapshot = await getDocs(fullNameQuery);
      const results = [];
      userNameSnapshot.forEach((doc) => {
        if (!newParticipants.includes(doc.data().uid)) {
          results.push({ ...doc.data() });
        }
      });
      fullNameSnapshot.forEach((doc) => {
        const data = doc.data();
        if (
          !newParticipants.includes(data.uid) &&
          !results.some((result) => result.uid === data.uid)
        ) {
          results.push(data);
        }
      });

      setSearchResults(results);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const handleAddParticipant = (participant) => {
    console.log("Adding Participant");
    setNewParticipants((prevParticipants) => {
      if (!prevParticipants.includes(participant.uid)) {
        return [...prevParticipants, participant.uid];
      } else {
        return prevParticipants;
      }
    });
  };

  const handleRemoveParticipant = (participant) => {
    console.log("Removing Participant");
    setNewParticipants((prevParticipants) =>
      prevParticipants.filter((p) => p !== participant)
    );
  };

  useEffect(() => {
    console.log(newParticipants)
  }, [newParticipants]);

  useEffect(() => {
    setShowModal(true);
  }, []);

  useEffect(() => {
    if (searchtext.length > 0) {
      searchUsers();
    } else {
      setSearchResults([]);
    }
  }, [searchtext, newParticipants]);

  const handleDelete = async () => {
    try {
      // Remove the room from each participant's chat list
      await Promise.all(roomdata.participants.map(async (participant) => {
        const ccref = doc(db, "chats", participant);
        await updateDoc(ccref, {
          rooms: arrayRemove(roomdata.roomid),
        });
      }));

      // Delete the room document
      const reff = doc(db, "messagerooms", roomdata.roomid);
      await deleteDoc(reff);

      toast.success("Chat Deleted Successfully");
      router.push("/feed/messages");
      onClose();
    } catch (e) {
      toast.error("Error Deleting Chat" + e.message);
    }
  };

  const handleEdit = async () => {
    try {
      const reff = doc(db, "messagerooms", roomdata.roomid);
      let gurl = roomdata.pfp; // Initialize gurl
      if (newPfp) {
        const compressed = await imageCompression(newPfp, options);
        console.log(compressed);
        const sref = ref(storage, "images/" + Date.now() + ".jpg");
        await uploadBytes(sref, compressed);
        gurl = await getDownloadURL(sref); // Update gurl
      }
      await updateDoc(reff, {
        title: newTitle,
        info: newInfo,
        participants: newParticipants,
        pfp: gurl,
      });

      // Update chat rooms for each participant
      const batch = [];
      initialParticipants.forEach(async (participant) => {
        const ccref = doc(db, "chats", participant);
        batch.push(updateDoc(ccref, {
          rooms: arrayRemove(roomdata.roomid),
        }));
      });
      newParticipants.forEach(async (participant) => {
        const ccref = doc(db, "chats", participant);
        batch.push(updateDoc(ccref, {
          rooms: arrayUnion(roomdata.roomid),
        }));
      });
      await Promise.all(batch);

      toast.success("Chat Updated Successfully");
      router.push("/feed/messages");
      onClose();
      setEditMode(false);
    } catch (e) {
      toast.error("Error Updating Chat" + e.message);
    }
  };

  const handlePfpChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewPfp(file);
      setNewPfpPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="relative">
      <Toaster />
      <div className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-500 ${showModal ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className={`absolute inset-0 rounded-2xl backdrop-filter backdrop-blur-3xl bg-opacity-20 shadow-2xl border-1 transition-allduration-500 ${showModal ? 'opacity-100' : 'opacity-0'} bg-gray-800 bg-clip-padding border-gray-600`}>
        </div>
        <div className={`w-96 p-8 rounded-xl shadow-2xl relative z-10 transition-all duration-500 ${showModal ? 'translate-y-0' : 'translate-y-full'} bg-gray-800 text-white`}>
          {editMode ? (
            <>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Edit Title"
                className="w-full p-2 mb-2 rounded bg-gray-700 text-white"
              />
              <textarea
                value={newInfo}
                onChange={(e) => setNewInfo(e.target.value)}
                placeholder="Edit Info"
                className="w-full p-2 mb-2 rounded bg-gray-700 text-white"
              />
              <div className="mb-4 block max-h-24 overflow-y-auto">
                Participants:
                {newParticipants.map((participant) => (
                  <div key={participant} className="flex items-center">
                    {usernames[participant]}
                    <button
                      className="bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded-lg transition-colors duration-300 ml-2"
                      onClick={() => handleRemoveParticipant(participant)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <input
                type="text"
                value={searchtext}
                onChange={(e) => setSearchtext(e.target.value)}
                className="border border-gray-600 bg-gray-700 text-white rounded-lg p-2 w-full mt-2"
                placeholder="Search"
              />
              {searchResults.length > 0 && searchtext.length > 0 && (
                <div className="search-results mt-2">
                  <ul>
                    {searchResults.map((user) => (
                      <div
                        onClick={() => handleAddParticipant(user)}
                        key={user.uid}
                        className="cursor-pointer"
                      >
                        <li>{user.userName}</li>
                      </div>
                    ))}
                  </ul>
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={handlePfpChange}
                className="w-full p-2 mb-2 rounded bg-gray-700 text-white"
              />
              {newPfpPreview && <Image src={newPfpPreview} height={50} width={50} alt="Preview" />}
              <button
                className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors duration-300 mr-2"
                onClick={handleEdit}
              >
                Save Changes
              </button>
              <button
                className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors duration-300"
                onClick={() => setEditMode(false)}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              Group Chat Info<br />
              {roomdata.title}
              {roomdata.info}
              {roomdata.participants.map((participant) => {
                return (
                  <div key={participant} className="flex items-center">
                    {usernames[participant]}
                  </div>
                );
              })}
              <Image src={roomdata.pfp} height={50} width={50} alt="854" />
              <button
                className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors duration-300 mr-2"
                onClick={() => setEditMode(true)}
              >
                Edit Chat
              </button>
              <button
                className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg transition-colors duration-300 mr-2"
                onClick={handleDelete}
              >
                Delete Group
              </button>
              <button
                onClick={() => onClose()}
                className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors duration-300"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupChatDetail;
