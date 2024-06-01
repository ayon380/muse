import { useEffect, useState } from "react";
import { doc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import imageCompression from "browser-image-compression";
import { ref, uploadBytes, getDownloadURL, getStorage } from "firebase/storage";
import Image from "next/image";
import {
  getFirestore,
  collection,
  updateDoc,
  arrayUnion,
  getDoc,
  query,
  getDocs,
  where,
  orderBy,
  limit,
  setDoc,
  addDoc,
} from "firebase/firestore";
import app from "@/lib/firebase/firebaseConfig";
import toast, { Toaster } from "react-hot-toast";
import React from "react";
function extractHashtags(caption) {
  const hashtags = caption.match(/#\w+/g) || [];
  const cleanedHashtags = hashtags.map((tag) => tag.substring(1).toLowerCase());
  return cleanedHashtags;
}
const options = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
};
const CreatePost = ({ onClose, userdata }) => {
  const [caption, setCaption] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [searchtext, setSearchtext] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [usernames, setUsernames] = useState([]);
  const [taggedUsers, setTaggedUsers] = useState([]); // [user1, user2, user3
  const [isOpen, setIsOpen] = useState(false);
  const db = getFirestore(app);
  const storage = getStorage(app);
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    setIsOpen(true); // Automatically open the component when it mounts
  }, []);

  const handleClose = () => {
    setIsOpen(false); // Close the component
    setTimeout(() => {
      onClose(); // Trigger onClose after the closing animation completes
    }, 300); // Adjust the timeout to match the duration of the closing animation
  };
  const handleFileChange = (e) => {
    const files = e.target.files;
    const filesArray = Array.from(files).slice(0, 10);
    const validFiles = filesArray.filter(
      (file) => file.size <= 20 * 1024 * 1024
    ); // Limit to 20MB

    // Display an error message if any file exceeds the size limit
    if (validFiles.length < filesArray.length) {
      alert("Some files exceed the maximum size limit of 20MB.");
    }

    setMediaFiles([...mediaFiles, ...validFiles]);
  };

  const handleCaptionChange = (e) => {
    setCaption(e.target.value);
  };

  const handleAddAnother = () => {
    document.getElementById("fileInput").click();
    const fileInput = document.getElementById("fileInput");
    setMediaFiles([...mediaFiles, ...fileInput.files]);
  };

  const handleRemoveMedia = (indexToRemove) => {
    setMediaFiles(mediaFiles.filter((_, index) => index !== indexToRemove));
  };
  const tagpersons = async (postid) => {
    usernames.forEach(async (user) => {
      const userRef = doc(db, "users", user.email);
      await updateDoc(userRef, {
        taggedPosts: arrayUnion(postid),
      });
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    if (user && userdata) {
      const hashtags = extractHashtags(caption);
      // Your existing submit logic...
      const post = {
        uid: user.uid,
        caption: caption,
        hashtags: hashtags,
        mediaFiles: [],
        timestamp: new Date(),
        likes: [],
        likecount: 0,
        comments: [],
        commentcount: 0,
        taggedUsers: taggedUsers,
      };

      const storageRef = ref(storage, `images/${userdata.uid}/posts`);
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

      post.mediaFiles = mediaURLs;

      const postsCollectionRef = collection(db, "posts");
      const newPostRef = await addDoc(postsCollectionRef, post);
      const userDocRef = doc(db, "users", user.email);
      await updateDoc(userDocRef, {
        posts: arrayUnion(newPostRef.id),
        postcount: userdata.postcount + 1,
      });
      for (let i = 0; i < hashtags.length; i++) {
        const tagRef = doc(db, "postshashtags", hashtags[i]);
        const tagDoc = await getDoc(tagRef);
        if (tagDoc.exists()) {
          // Document exists, update it
          // const tagData = tagDoc.data();
          await updateDoc(tagRef, {
            posts: arrayUnion(newPostRef.id),
          });
        } else {
          // Document does not exist, create a new one
          await setDoc(tagRef, {
            posts: [newPostRef.id],
          });
        }
      }
      await updateDoc(newPostRef, { id: newPostRef.id });
      tagpersons(newPostRef.id);
      setCaption("");
      setMediaFiles([]);
      setSubmitting(false);
      toast.success("Post created successfully");

      // handleClose();
    } else {
      toast.error("Error !!" + error.message);
      console.log("no user");
    }
  };

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
    if (taggedUsers.includes(participant.uid)) {
      return;
    }
    setUsernames([...usernames, participant]);
    setTaggedUsers([...taggedUsers, participant.uid]);
  };
  React.useEffect(() => {
    if (searchtext.length > 0) {
      searchUsers();
    } else {
      setSearchResults([]);
    }
  }, [searchtext]);

  return (
    <div
      className={`fixed w-full inset-0 z-10 overflow-y-auto flex items-center justify-center rounded-xl bg-gray-900 bg-opacity-50 backdrop-blur-lg ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <Toaster />
      <div className="bg-white shadow-xl shadow-orange-300 dark:bg-black w-full text-black dark:text-white bg-opacity-70 backdrop-blur-lg  rounded-lg p-8 transition-transform duration-300 mx-6">
        <h1 className="text-2xl font-bold mb-4">Create a Post</h1>
        <div className="mb-4">
          <label className="block text font-bold mb-2">Caption</label>
          <textarea
            className="resize-none text border active:border-2 active:border-cyan-100 rounded w-full py-2 px-3 bg-transparent text-opacity-75"
            rows="3"
            value={caption}
            onChange={handleCaptionChange}
          />
        </div>

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
            <h2 className="text-lg font-semibold mb-2">Media Preview</h2>
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
            className="text-gray-500 hover:underline focus:outline-none"
            onClick={handleAddAnother}
          >
            Add Another
          </button>
          <input
            type="file"
            id="fileInput"
            accept="image/*, video/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
        <label className="mb-4 block">
          Tag Users:
          {usernames.map((participant) => (
            <li key={participant}>{participant.userName}</li>
          ))}
          <input
            type="text"
            value={searchtext}
            onChange={(e) => setSearchtext(e.target.value)}
            className={`border  rounded-lg p-2 w-full mt-2`}
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
        <div className="flex items-center justify-between mt-4">
          <button
            className="text-blue-500 hover:underline focus:outline-none"
            onClick={handleClose}
          >
            Cancel
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={handleSubmit}
            disabled={mediaFiles.length === 0 || submitting|| caption.length === 0}
            // disabled={submitting}
          >
            {submitting ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
