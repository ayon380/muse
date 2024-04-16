import React from "react";
import { useState, useEffect } from "react";
import { FaRegHeart, FaComments, FaShare } from "react-icons/fa";
import { TiHeartFullOutline } from "react-icons/ti";
import { MdOutlineReportGmailerrorred } from "react-icons/md";
import { motion } from "framer-motion";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import Image from "next/image";
import { collection, getDoc, query, setDoc } from "firebase/firestore";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import {
  getFirestore,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  addDoc,
  limit,
  doc,
  increment,
} from "firebase/firestore";

function formatFirebaseTimestamp(firebaseTimestamp) {
  // Check if the timestamp is valid
  if (
    !firebaseTimestamp ||
    typeof firebaseTimestamp !== "object" ||
    !("_seconds" in firebaseTimestamp)
  ) {
    return "Invalid date";
  }

  // Convert Firestore timestamp to JavaScript Date object
  const timestampDate = new Date(firebaseTimestamp._seconds * 1000);

  const now = new Date();
  const timeDifference = now - timestampDate;
  const seconds = Math.floor(timeDifference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return "Just now";
  } else if (minutes === 1) {
    return "A minute ago";
  } else if (minutes < 60) {
    return `${minutes} minutes ago`;
  } else if (hours === 1) {
    return "An hour ago";
  } else if (hours < 24) {
    return `${hours} hours ago`;
  } else if (days === 1) {
    return "Yesterday";
  } else if (days < 7) {
    return `${days} days ago`;
  } else {
    // If it's more than a week, you might want to display the actual date
    const options = { year: "numeric", month: "long", day: "numeric" };
    return timestampDate.toLocaleDateString(undefined, options);
  }
}

import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
const Modal = dynamic(() => import("./Modal"));
const EditPost = dynamic(() => import("./EditPost"));
const ShareMenu = dynamic(() => import("@/components/ShareMenu"));
const PostComment = dynamic(() => import("@/components/PostComment"));
const FeedPost = ({
  db,
  type,
  post,
  setSharemenu,
  setSharepostdata,
  userdata,
  usermetadata,
  onclose,
  currentuserdata,
  showComments,
  setShowComments,
  setCommentpostdata,
  enqueueUserMetadata,
}) => {
  const [liked, setLiked] = React.useState(false);
  console.log(post + "post");
  const [postdata, setPostdata] = useState(post);
  const [uid, setUid] = useState("");
  const [showedit, setShowedit] = useState(false);
  const [showdelete, setShowdelete] = useState(false);
  const router = useRouter();
  useEffect(() => {
    if (type == "profile") setUid(currentuserdata.uid);
    else setUid(userdata.uid);
  }, []);
  function isVideoFile(url) {
    // List of common video file extensions
    const videoExtensions = ["mp4", "mov", "avi", "mkv", "wmv", "flv", "webm"];

    // Check if the URL contains any of the video file extensions
    const hasVideoExtension = videoExtensions.some((extension) =>
      url.includes(`.${extension}`)
    );

    // Check if the URL contains a query parameter indicating a video file
    const hasVideoQueryParameter = url.match(
      /\.(mp4|mov|avi|mkv|wmv|flv|webm)\?[\w=&-]+/
    );

    // Return true if either condition is met
    return hasVideoExtension || hasVideoQueryParameter;
  }

  const checkIfLiked = async () => {
    if (userdata) {
      const postRef = doc(db, "posts", postdata.id);
      const docSnap = await getDoc(postRef);
      if (docSnap.exists()) {
        if (docSnap.data().likes.includes(uid)) {
          setLiked(true);
        }
      }
    }
  };
  const refetchPost = async () => {
    const postRef = doc(db, "posts", postdata.id);
    const docSnap = await getDoc(postRef);
    if (docSnap.exists()) {
      setPostdata(docSnap.data());
    }
  };
  useEffect(() => {
    checkIfLiked();
  }, [userdata]);
  const sendNotification = async (postdata) => {
    try {
      const notificationData = {
        id: "",
        sender: uid,
        postid: postdata.id,
        type: "postlike",
        receiver: postdata.uid,
        timestamp: Date.now(),
      };
      console.log(notificationData);
      const notificationRef = collection(db, "notifications");
      const notificationDoc = await addDoc(notificationRef, notificationData);
      await updateDoc(doc(notificationRef, notificationDoc.id), {
        id: notificationDoc.id,
      });
      console.log("Notification sent");
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };
  const handleLike = async () => {
    if (userdata) {
      const postRef = doc(db, "posts", postdata.id);
      const usernameref = doc(db, "username", userdata.uid);
      if (liked) {
        setLiked(false);
        setPostdata({ ...postdata, likecount: postdata.likecount - 1 });
        await updateDoc(postRef, {
          likes: arrayRemove(uid),
          likecount: increment(-1),
        });
        await updateDoc(usernameref, {
          score: increment(-1),
        });
      } else {
        setLiked(true);
        setPostdata({ ...postdata, likecount: postdata.likecount + 1 });
        await updateDoc(postRef, {
          likes: arrayUnion(uid),
          likecount: increment(1),
        });
        await updateDoc(usernameref, {
          score: increment(1),
        });
        sendNotification(postdata);
      }
      // refetchPost();
    }
  };
  const Reportposttt = async () => {
    router.push(
      `/report?username=${usermetadata[postdata.uid].userName}&postid=${
        postdata.id
      }`
    );
  };

  const handleDelete = async () => {
    try {
      const postRef = doc(db, "posts", postdata.id);
      await deleteDoc(postRef);
      const userRef = doc(db, "users", userdata.email);
      await updateDoc(userRef, {
        posts: arrayRemove(postdata.id),
        postcount: increment(-1),
      });
      toast.success("Post deleted successfully");
      router.push(`/feed/profile/${userdata.userName}`);
    } catch (error) {
      toast.error("Error deleting post: " + error.message);
    }
  };
  const handleSave = async () => {
    try {
      const userRef = doc(db, "users", userdata.email);
      const q = await getDoc(userRef);
      if (q.data().savedposts.includes(postdata.id)) {
        await updateDoc(userRef, {
          savedposts: arrayRemove(postdata.id),
        });
        toast.success("Post unsaved successfully");
        return;
      }

      await updateDoc(userRef, {
        savedposts: arrayUnion(postdata.id),
      });
      toast.success("Post saved successfully");
    } catch (error) {
      toast.error("Error saving post: " + error.message);
    }
  };
  const fadeInVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  };

  const scaleUpVariants = {
    hover: { scale: 1.2, transition: { duration: 0.2 } },
  };

  return (
    <>
      <motion.div
        className=" justify-center relative max-w-4/5  py-4 lg:px-64 md:px-24  dark:bg-black"
        key={postdata.id}
        initial="hidden"
        animate="visible"
        // onClick={() => onclose()}
        variants={fadeInVariants}
      >
        <Toaster />

        {showedit && (
          <EditPost
            post={postdata}
            db={db}
            setShowedit={setShowedit}
            userdata={userdata}
            refetchPost={refetchPost}
            usermetadata={usermetadata}
            enqueueUserMetadata={enqueueUserMetadata}
          />
        )}
        {showdelete && (
          <Modal
            setShowModal={setShowdelete}
            handleDelete={handleDelete}
            title="Delete Post"
            type="deletepost"
            content="Are you sure you want to delete this post?"
          />
        )}
        
        <div className="df bg-white dark:bg-black bg-opacity-40 md:ml-96 rounded-2xl px-2 py-2 m-2">
        <button onClick={() => onclose()}>Close</button>
          {usermetadata && usermetadata[postdata.uid] && (
            <div className="header flex justify-between">
              <Link
                href={`/feed/profile/${usermetadata[postdata.uid].userName}`}
              >
                <div className="flex items-center">
                  <div className="profile-pic bg-gradient-to-r from-purple-500 to-blue-500 h-10 w-10 rounded-full p-2 md:h-20 md:w-20">
                    <Image
                      className="rounded-full h-8 w-8 md:h-16 md:w-16 object-cover "
                      src={usermetadata[postdata.uid].pfp}
                      width={100}
                      height={100}
                      alt="Profile Picture"
                    />
                  </div>
                  <div className="username ml-2 text-xl md:text-3xl">
                    {usermetadata[postdata.uid].userName}
                  </div>
                </div>
              </Link>
              <div className="time mt-2 opacity-50 md:mt-4">
                {formatFirebaseTimestamp(postdata.timestamp)}
              </div>
            </div>
          )}
          <div className="gf rounded-xl pt-6 z-20 w-full">
            <Carousel showThumbs={false} >
              {postdata?.mediaFiles.map((media) => (
                <>
                  {isVideoFile(media) ? (
                    <>
                      <video
                        className="max-h-96 w-full bg-transparent bg-opacity-80 rounded-xl"
                        src={media}
                        controls
                        style={{ maxHeight: "500px" }}
                      />
                    </>
                  ) : (
                    <>
                      <Image
                        src={media}
                        height="500"
                        width="500"
                        alt=""
                        className="rounded-xl object-cover max-h-96"
                      />
                    </>
                  )}
                </>
              ))}
            </Carousel>
            <div className="footer mt-3">
              <div className="flex justify-between">
                <div className="like flex">
                  <motion.div
                    className="btnl mt-0.5 text-2xl"
                    onClick={handleLike}
                    whileHover="hover"
                    variants={scaleUpVariants}
                  >
                    {!liked ? (
                      <FaRegHeart />
                    ) : (
                      <TiHeartFullOutline style={{ color: "red" }} />
                    )}
                    <div />
                  </motion.div>
                  <div className="flex">
                    <div className="count text-xl font-bold mr-1">
                      {postdata.likecount ? postdata.likecount : 0}
                    </div>
                    <div className="likes text-xl opacity-85">likes</div>
                  </div>
                </div>
                <div className="l12 flex text-3xl">
                  <div
                    className="share cursor-pointer "
                    onClick={() => {
                      setSharepostdata(postdata);
                      setSharemenu(true);
                    }}
                  >
                    <Image
                      src="/icons/send.png"
                      alt="Share"
                      className="dark:invert w-7 h-7 mr-1"
                      width={100}
                      height={100}
                    />
                  </div>
                  <div className="tagged h-7 w-7 flex mr-2">
                    <Image
                      src="/icons/supermarket.png"
                      width={50}
                      height={50}
                      alt=""
                      className="dark:invert"
                    />
                    <div className="asd text-sm -mt-2 text-red-500 font-bold ">
                      {postdata.taggedUsers.length}
                    </div>
                  </div>
                  <div className="sad mr-1" onClick={handleSave}>
                    <Image
                      src="/icons/save.png"
                      alt="Sad"
                      className="dark:invert w-7 h-7"
                      width={100}
                      height={100}
                    />
                  </div>
                  <div
                    className="report cursor-pointer mr-3"
                    onClick={() => Reportposttt()}
                  >
                    <Image
                      src="/icons/warning.png"
                      alt="Report"
                      className="dark:invert h-7 w-7"
                      width={100}
                      height={100}
                    />
                  </div>
                </div>
              </div>

              {postdata.caption && (
                <div className="caption m-1 w-full">{postdata.caption}</div>
              )}

              <div className="comments flex justify-between m-1">
                <div
                  className="om flex"
                  onClick={() => {
                    setShowComments(true);
                    setCommentpostdata(postdata);
                  }}
                >
                  <button>
                    <Image
                      src="/icons/comment.png"
                      className="dark:invert h-7 w-7"
                      width={100}
                      height={100}
                      alt="Comment"
                    />
                  </button>
                  <div className="k mt-0.5">
                    {postdata ? postdata.commentcount : 0} comments
                  </div>
                </div>
                {currentuserdata && currentuserdata.uid === userdata.uid && (
                  <div className="flex">
                    <Image
                      className="dark:invert h-7 w-7"
                      src="/icons/editing.png"
                      height={50}
                      width={50}
                      alt=""
                      onClick={() => setShowedit(true)}
                    />
                    <Image
                      className="dark:invert h-7 w-7"
                      src="/icons/delete.png"
                      height={50}
                      width={50}
                      alt=""
                      onClick={() => setShowdelete(true)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default FeedPost;
