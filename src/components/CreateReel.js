import { useEffect, useState, useMemo } from "react";
import { doc } from "firebase/firestore";
import Image from "next/image";
import { getAuth } from "firebase/auth";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  uploadBytes,
  getStorage,
} from "firebase/storage";
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
import BottomSheet from "./BottomSheet";
function extractHashtags(caption) {
  const hashtags = caption.match(/#\w+/g) || [];
  const cleanedHashtags = hashtags.map((tag) => tag.substring(1).toLowerCase());
  return cleanedHashtags;
}

const CreatePost = ({ onClose, userdata }) => {
  const [caption, setCaption] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isOpen, setIsOpen] = useState(true);
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
    generateThumbnail(file);
  };

  const handleCaptionChange = (e) => {
    setCaption(e.target.value);
  };

  const generateThumbnail = (file) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    video.preload = "metadata";
    video.src = URL.createObjectURL(file);

    video.onloadeddata = () => {
      video.currentTime = Math.floor(video.duration / 2);
    };

    video.onseeked = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        setThumbnail(blob);
      }, "image/jpeg");
    };
  };

  const handleSubmit = async () => {
    // Your handleSubmit function remains the same
    setSubmitting(true);
    setUploadProgress(0);

    if (user && userdata) {
      const hashtags = extractHashtags(caption);
      const post = {
        uid: user.uid,
        caption: caption,
        hashtags: hashtags,
        mediaFiles: "",
        thumbnail: "",
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
        const uploadTask = uploadBytesResumable(fileRef, mediaFile);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          },
          (error) => {
            toast.error("Upload failed: " + error.message);
            setSubmitting(false);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            post.mediaFiles = downloadURL;

            if (thumbnail) {
              const thumbnailRef = ref(
                storageRef,
                `thumbnails/${mediaFile.name}.jpg`
              );
              await uploadBytes(thumbnailRef, thumbnail);
              const thumbnailURL = await getDownloadURL(thumbnailRef);
              post.thumbnail = thumbnailURL;
            }

            const postsCollectionRef = collection(db, "reels");
            const newPostRef = await addDoc(postsCollectionRef, post);
            const userDocRef = doc(db, "users", user.email);
            await updateDoc(userDocRef, {
              reels: arrayUnion(newPostRef.id),
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
            setThumbnail(null);
            setSubmitting(false);
            setUploadProgress(0);
            toast.success("Post created successfully");
          }
        );
      }
    } else {
      toast.error("Error !!" + error.message);
      setSubmitting(false);
      console.log("no user");
    }
  };

  // Memoize the generated thumbnail and video previews
  const videoPreview = useMemo(() => {
    if (mediaFile) {
      return (
        <div className="relative flex-none p-2">
          <video
            src={URL.createObjectURL(mediaFile)}
            alt="Media Preview"
            className="h-48 rounded"
            controls
          />
        </div>
      );
    }
    return null;
  }, [mediaFile]);

  const thumbnailPreview = useMemo(() => {
    if (thumbnail) {
      return (
        <div className="relative flex-none p-2">
          <Image
            src={URL.createObjectURL(thumbnail)}
            alt="Thumbnail Preview"
            className="h-48 w-48 rounded"
            height={192}
            width={192}
          />
        </div>
      );
    }
    return null;
  }, [thumbnail]);

  return (
    <BottomSheet show={isOpen} onClose={handleClose} heading="Create Reel">
      <div className="bg-white dark:bg-black p-5">
        <div className="mb-4">
          <label className="block text-xl font-bold mb-2">Caption</label>
          <div className="flex">
            <Image
              src="/icons/info.png"
              alt="info"
              width={20}
              height={20}
              className="mr-2 dark:invert mt-1 h-5 w-5"
            />
            <div className="df text-xs opacity-75 mb-2">
              <p>
                Add a caption to your video. You can also add hashtags to make
                your video more discoverable. Add Hashtags like #nature #beauty
                #travel
              </p>
            </div>
          </div>
          <textarea
            className="resize-none text border active:border-2 active:border-cyan-100 rounded w-full py-2 px-3 bg-transparent text-opacity-75"
            rows="3"
            value={caption}
            onChange={handleCaptionChange}
          />
        </div>

        <div className="mb-4">
          <label className="block text font-bold mb-2">Upload Video</label>
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
              {videoPreview}
            </div>
          </div>
        </div>
        {thumbnailPreview && (
          <div className="lp h-64 max-w-96">
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">Thumbnail Preview</h2>
              <div className="flex flex-nowrap overflow-x-auto">
                {thumbnailPreview}
              </div>
            </div>
          </div>
        )}
        {submitting && (
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">Uploading...</h2>
            <div className="w-full bg-gray-200 rounded-full dark:bg-gray-700">
              <div
                className="bg-fuchsia-500 text-xs font-medium text-fuchsia-100 text-center p-2 leading-none rounded-full"
                style={{ width: `${uploadProgress}%` }}
              >
                {uploadProgress.toFixed(2)}%
              </div>
            </div>
            <p className="text-sm text-red-500 mt-2">
              Please do not close the application while uploading.
            </p>
          </div>
        )}
        <div className="flex items-center justify-between mt-4">
          <button
            className="text-fuchsia-500 bg-fuchsia-100 px-3 py-1 rounded-full
    transition-all duration-300 ease-in-out dark:bg-fuchsia-500 dark:text-fuchsia-100
    hover:scale-110 hover:bg-fuchsia-200
    active:scale-90 active:bg-fuchsia-300
    cursor-pointer"
            onClick={handleClose}
          >
            Cancel
          </button>
          <button
            className=" text-fuchsia-500 bg-fuchsia-100 px-3 py-1 rounded-full
            disabled:text-gray-500 dark:bg-fuchsia-500 dark:text-fuchsia-100
    transition-all duration-300 ease-in-out
    hover:scale-110 hover:bg-fuchsia-200
    active:scale-90 active:bg-fuchsia-300
    cursor-pointer"
            onClick={handleSubmit}
            disabled={submitting || !mediaFile || !caption}
          >
            {submitting ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    </BottomSheet>
  );
};
export default CreatePost;
