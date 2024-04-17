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
import { motion } from "framer-motion";
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
  const colors = {
    primary: '#ff5e5e',
    secondary: '#ffc107',
    background: '#1a1a1a',
    text: '#ffffff',
  };

  // Define some animations
  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };
  return (
    <div className="relative bg-gray-900 z-30" >
      <Toaster />
      <motion.div
        className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-500 ${showModal ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        initial="hidden"
        animate={showModal ? 'visible' : 'hidden'}
        variants={fadeInUpVariants}
      >
        <div
          className={`absolute inset-0 rounded-2xl backdrop-filter backdrop-blur-3xl bg-opacity-20 shadow-2xl border-1 transition-all duration-500 ${showModal ? 'opacity-100' : 'opacity-0'
            } bg-gray-800 bg-clip-padding border-gray-600`}
        ></div>
        <motion.div
          className={`w-96  rounded-xl shadow-2xl relative z-10 transition-all duration-500 ${showModal ? 'translate-y-0' : 'translate-y-full'
            } bg-white dark:bg-black text-black dark:text-white`}
          initial="hidden"
          animate={showModal ? 'visible' : 'hidden'}
          variants={fadeInUpVariants}
        >
          {editMode ? (<div className="p-8">
            <div className="kl">Edit Title</div>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Edit Title"
              className="w-full p-2 mb-2 rounded border border-gray-300"
            />
            <div className="kl">Edit Info</div>
            <textarea
              value={newInfo}
              onChange={(e) => setNewInfo(e.target.value)}
              placeholder="Edit Info"
              className="w-full p-2 mb-2 rounded border border-gray-300"
            />
            <div className="mb-4 block max-h-24 overflow-y-auto">
              <p className="text-gray-600 mb-2">Participants:</p>
              {newParticipants.map((participant) => (
  
                <motion.div
                  key={participant}
                  className="flex items-center mb-2 justify-between"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="text-gray-800">{usernames[participant].userName}</span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded-lg transition-colors duration-300 ml-2"
                    onClick={() => handleRemoveParticipant(participant)}
                  >
                    Remove
                  </motion.button>
                </motion.div>
              ))}
            </div>
            <input
              type="text"
              value={searchtext}
              onChange={(e) => setSearchtext(e.target.value)}
              className="border border-gray-300 text-gray-800 rounded-lg p-2 w-full my-2"
              placeholder="Search Participants"
            />
            {searchResults.length > 0 && searchtext.length > 0 && (
              <motion.div
                className="search-results mt-2 bg-gray-100 rounded-lg p-2"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ul>
                  {searchResults.map((user) => (
                    <motion.div
                      whileHover={{ backgroundColor: '#FCD34D', color: '#333' }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleAddParticipant(user)}
                      key={user.uid}
                      className="cursor-pointer p-2 rounded-lg transition-colors duration-300"
                    >
                      <li>{user.userName}</li>
                    </motion.div>
                  ))}
                </ul>
              </motion.div>
            )}

            <div className="flex items-center justify-between">
              <input
                type="file"
                accept="image/*"
                onChange={handlePfpChange}
                className="w-full p-2 mb-2 rounded border border-gray-300 text-gray-800"
              />
              {newPfpPreview && (
                <Image src={newPfpPreview} height={50} width={50} alt="Preview" className="rounded-full" />
              )}
            </div>
            <div className="flex justify-between">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-300 mr-2"
                onClick={handleEdit}
              >
                Save Changes
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg transition-colors duration-300"
                onClick={() => setEditMode(false)}
              >
                Cancel <Image src="/icons/close.png" height={20} width={20} alt="Close" className="inline-block ml-2" />
              </motion.button>
            </div>
          </div>
          ) : (
            <>
              {/* <h2 className="text-2xl font-bold mb-4 ">Group Chat Info</h2> */}
              <Image src={roomdata.pfp} height={100} width={500} alt="854" className="rounded-md h-48 object-cover " />
              <div className="lp p-8">
                <p className="font-bold text-center text-xl mb-2">{roomdata.title}</p>
                <p className="text-center text-opacity-75 mb-4">{roomdata.info}</p>
                <div className="mb-4 h-48 overflow-y-auto">
                  <p className=" mb-2">Participants:</p>
                  {roomdata.participants.map((participant) => (
                    <motion.div
                      key={participant}
                      className="flex items-center mb-2"
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                    >
                      <span className="text-opacity-65">{usernames[participant].userName}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="flex justify-between">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className=" text-white px-4 py-2 rounded-lg transition-colors duration-300 mr-2"
                    onClick={() => setEditMode(true)}
                  >
                    <Image src="/icons/editing.png" height={20} width={20} alt="Edit" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className=" text-white px-4 py-2 rounded-lg transition-colors duration-300 mr-2"
                    onClick={handleDelete}
                  >
                    <Image src="/icons/delete.png" height={20} width={20} alt="Delete" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onClose()}
                    className=" text-white px-4 py-2 rounded-lg transition-colors duration-300"
                  >
                    <Image src="/icons/close.png" height={20} width={20} alt="Close" />
                  </motion.button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </div>

  );
};

export default GroupChatDetail;