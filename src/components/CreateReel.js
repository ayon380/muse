import { useEffect, useState } from "react";
import { doc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL, getStorage } from "firebase/storage";
import {
  getFirestore,
  collection,
  updateDoc,
  arrayUnion,
  getDoc,
  setDoc,
  addDoc,
} from "firebase/firestore";
import app from "@/lib/firebase/firebaseConfig";
import toast, { Toaster } from "react-hot-toast";

function extractHashtags(caption) {
  const hashtags = caption.match(/#\w+/g) || [];
  const cleanedHashtags = hashtags.map((tag) => tag.substring(1).toLowerCase());
  return cleanedHashtags;
}

const CreatePost = ({ onClose, userdata }) => {
  const [caption, setCaption] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
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
    const file = e.target.files[0];
    setMediaFile(file);
  };

  const handleCaptionChange = (e) => {
    setCaption(e.target.value);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    if (user && userdata) {
      const hashtags = extractHashtags(caption);
      const post = {
        uid: user.uid,
        caption: caption,
        hashtags: hashtags,
        mediaFiles: "",
        timestamp: new Date(),
        likes: [],
        likecount: 0,
        comments: [],
        commentcount: 0,
        viewcount: 0,
        views: [],
        taggedUsers: [],
      };

      const storageRef = ref(storage, `images/${userdata.uid}/reels`);
      
      if (mediaFile.type.startsWith("video/")) {
        const fileRef = ref(storageRef, mediaFile.name);
        await uploadBytes(fileRef, mediaFile);
        const downloadURL = await getDownloadURL(fileRef);
        post.mediaFiles = downloadURL;
      }

      const postsCollectionRef = collection(db, "reels");
      const newPostRef = await addDoc(postsCollectionRef, post);
      const userDocRef = doc(db, "users", user.email);
      await updateDoc(userDocRef, {
        reels: arrayUnion(newPostRef.id),
        // postcount: userdata.postcount + 1,
      });
      
      for (let i = 0; i < hashtags.length; i++) {
        const tagRef = doc(db, "reelshashtags", hashtags[i]);
        const tagDoc = await getDoc(tagRef);
        if (tagDoc.exists()) {
          await updateDoc(tagRef, {
            posts: arrayUnion(newPostRef.id),
          });
        } else {
          await setDoc(tagRef, {
            posts: [newPostRef.id],
          });
        }
      }
      
      await updateDoc(newPostRef, { id: newPostRef.id });

      setCaption("");
      setMediaFile(null);
      setSubmitting(false);
      toast.success("Post created successfully");
    } else {
      toast.error("Error !!" + error.message);
      console.log("no user");
    }
  };

  return (
    <div className={`fixed w-full inset-0 z-10 overflow-y-auto flex items-center justify-center rounded-xl bg-gray-900 bg-opacity-50 backdrop-blur-lg ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
      <Toaster />
      <div className="bg-white shadow-xl shadow-orange-300 dark:bg-black w-full text-black dark:text-white bg-opacity-70 backdrop-blur-lg rounded-lg p-8 transition-transform duration-300 mx-6">
        <h1 className="text-2xl font-bold mb-4">Create a Reel</h1>
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
            Upload Video
          </label>
          <input
            className="file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-violet-50 file:text-violet-700
            hover:file:bg-violet-100"
            type="file"
            accept="video/*"
            onChange={handleFileChange}
          />
        </div>
        <div className="lp h-64 max-w-96">
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">Media Preview</h2>
            <div className="flex flex-nowrap overflow-x-auto">
              {mediaFile && (
                <div className="relative flex-none p-2">
                  <video
                    src={URL.createObjectURL(mediaFile)}
                    alt="Media Preview"
                    className="h-48  rounded"
                    controls
                  />
                </div>
              )}
            </div>
          </div>
        </div>
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
            disabled={submitting}
          >
            {submitting ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
