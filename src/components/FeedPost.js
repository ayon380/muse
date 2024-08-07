import React from "react";
import { useState, useEffect, useCallback } from "react";

import { motion } from "framer-motion";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import Image from "next/image";
import { collection, getDoc, query, setDoc } from "firebase/firestore";
import Link from "next/link";
import { WriteBatch } from "firebase/firestore";
import toast, { Toaster } from "react-hot-toast";
import { useSidebarStore } from "@/app/store/zustand";
import StyledCaption from "./StyledCaption";
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

function formatFirebaseTimestamp(timestamp) {
  // console.log(JSON.stringify(timestamp) + "timestamp");
  const seconds = timestamp.seconds;
  const nanoseconds = timestamp.nanoseconds;
  // Convert the seconds and nanoseconds to milliseconds
  const milliseconds = seconds * 1000 + nanoseconds / 1000000;

  // Create a new Date object using the milliseconds
  const date = new Date(milliseconds);

  // Format the date into a readable string for social media posts
  const options = {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  };
  const readableDate = date.toLocaleString("en-US", options);

  return readableDate;
}

import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
const Modal = dynamic(() => import("./Modal"));
const EditPost = dynamic(() => import("./EditPost"));
const SimpleVideoPlayer = dynamic(() => import("./SimpleVideoPlayer"));
const FeedPost = ({
  db,
  type,
  post,
  setSharemenu,
  setSharepostdata,
  userdata,
  usermetadata,
  setTaggedusermenu,
  currentuserdata,
  setShowComments,
  setCommentpostdata,
  enqueueUserMetadata,
}) => {
  const [liked, setLiked] = React.useState(false);
  const { postupdatedata, setpostdataupdate } = useSidebarStore();
  useEffect(() => {
    console.log(postupdatedata + "postupdatedata");
    if (postupdatedata == post.id) {
      refetchPost();
      setpostdataupdate("");
    }
  }, [postupdatedata]);
  // console.log(post + "post");
  const [postdata, setPostdata] = useState(post);
  const [pendingUpdate, setPendingUpdate] = useState(null);

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
    if (userdata && postdata) {
      console.log("checking if liked");
      const postRef = doc(db, "posts", postdata.id);
      const docSnap = await getDoc(postRef);
      if (docSnap.exists()) {
        if (docSnap.data().likes.includes(uid)) {
          console.log("liked");
          setLiked(true);
        }
      }
    }
  };
  const refetchPost = async () => {
    console.log("refetching post");
    const postRef = doc(db, "posts", postdata.id);
    const docSnap = await getDoc(postRef);
    if (docSnap.exists()) {
      setPostdata(docSnap.data());
    }
  };
  useEffect(() => {
    if (uid && postdata) {
      checkIfLiked();
    }
  }, [uid]);
  useEffect(() => {
    console.log(liked + "liked");
  }, [liked]);
  const sendNotification = async (postdata) => {
    try {
      const notificationData = {
        id: "",
        sender: uid,
        postid: postdata.id,
        type: "like",
        subtype: "postlike",
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
    const newLikedState = !liked;
    console.log(newLikedState + "newLikedState");
    setLiked(newLikedState);
    setPostdata({
      ...postdata,
      likecount: postdata.likecount + (newLikedState ? +1 : -1),
    });
    if (userdata) {
      const postRef = doc(db, "posts", postdata.id);
      const usernameRef = doc(db, "username", userdata.uid);
      // Update the local state immediately

      // Debounce the database update
      clearTimeout(pendingUpdate); // Cancel any previously debounced calls
      setPendingUpdate(
        setTimeout(updateLike, 5000, postRef, usernameRef, newLikedState)
      );
    }
  };

  const updateLike = async (postRef, usernameRef, newLikedState) => {
    try {
      if (newLikedState) {
        await updateDoc(postRef, {
          likes: arrayUnion(userdata.uid),
          likecount: increment(1),
        });
        await updateDoc(usernameRef, {
          score: increment(1),
        });
        sendNotification(postdata);
        const hashtags = postdata.hashtags;
        hashtags.forEach(async (hashtag) => {
          const hashtagRef = doc(db, "hashtags", hashtag);
          const hashtagDoc = await getDoc(hashtagRef);

          if (hashtagDoc.exists()) {
            // Hashtag document exists, increment the count
            await updateDoc(hashtagRef, {
              count: increment(1),
            });
          } else {
            // Hashtag document doesn't exist, create it with count set to 1
            await setDoc(hashtagRef, {
              count: 1,
              tag: hashtag.toLowerCase(),
            });
          }
        });
      } else {
        await updateDoc(postRef, {
          likes: arrayRemove(userdata.uid),
          likecount: increment(-1),
        });
        await updateDoc(usernameRef, {
          score: increment(-1),
        });
      }
    } catch (error) {
      console.error("Error updating post or username:", error);
    }
  };

  useEffect(() => {
    return () => clearTimeout(pendingUpdate);
  }, [pendingUpdate]);
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
        className="z-10 justify-center  bg-white relative w-full py-2 lg:px-96 md:px-24  dark:bg-black"
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
        <div className="df bg-white md:bg-fuchsia-50 md:p-2 md:shadow-md dark:bg-black rounded-2xl m-2">
          {usermetadata && usermetadata[postdata.uid] && (
            <div className="header flex justify-between pt-2 px-1">
              <Link
                href={`/feed/profile/${usermetadata[postdata.uid].userName}`}
              >
                <div className="flex items-center">
                  {/* <div className="profile-pic bg-gradient-to-r from-purple-500 to-blue-500 h-10 w-10 rounded-full p-2 md:h-20 md:w-20"> */}
                  <Image
                    className="rounded-full h-12 w-12  md:h-14 md:w-14 object-cover "
                    src={usermetadata[postdata.uid].pfp}
                    width={100}
                    height={100}
                    alt="Profile Picture"
                  />
                  {/* </div> */}
                  <div className="username ml-2 text-xl md:text-2xl">
                    {usermetadata[postdata.uid].userName}
                  </div>
                </div>
              </Link>
              <div className="time mt-5  text-xs opacity-50 md:mt-4">
                {formatFirebaseTimestamp(postdata.timestamp)}
              </div>
            </div>
          )}
          <div className="gf rounded-xl pt-4 z-20 w-full">
            <Carousel
              showThumbs={false}
              showStatus={false}
              dynamicHeight
              useKeyboardArrows
              swipeable={false}
            >
              {postdata?.mediaFiles.map((media) => (
                <>
                  {isVideoFile(media) ? (
                    <>
                      {/* <video
                        className="max-h-96 w-full bg-transparent bg-opacity-80 rounded-xl"
                        src={media}
                        controls
                        style={{ maxHeight: "500px" }}
                      /> */}
                      <SimpleVideoPlayer src={media} />
                    </>
                  ) : (
                    <>
                      <Image
                        src={media}
                        height="500"
                        width="500"
                        alt=""
                        className="rounded-xl object-center"
                      />
                    </>
                  )}
                </>
              ))}
            </Carousel>
            <div className="footer mt-3 mx-1">
              <div className="flex justify-between">
                <div className="like flex">
                  <motion.div
                    className="btnl mt-0.5 text-2xl"
                    onClick={handleLike}
                    whileHover="hover"
                    variants={scaleUpVariants}
                  >
                    <button>
                      {!liked ? (
                        <Image
                          src="/icons/notliked.png"
                          alt="Not Liked"
                          className="h-7 w-7 dark:invert"
                          height={50}
                          width={50}
                        />
                      ) : (
                        <Image
                          src="/icons/liked.png"
                          alt="Liked"
                          className="h-7 w-7"
                          height={50}
                          width={50}
                        />
                      )}
                    </button>
                    {/* </CoolMode> */}
                    {/* <CoolMode options={{
                      particleCount: 50,
                      speedHorz: 5,
                      speedUp: 10,
                    }}>
                      
                      <button>Click</button>
                      <div />
                    </CoolMode> */}
                  </motion.div>

                  <div className="flex  ml-2 ">
                    <div className="count text-2xl  font-bold mr-5">
                      {postdata.likecount ? postdata.likecount : 0}
                    </div>
                    {/* <div className="likes text-sm mt-2 opacity-75 ">likes</div> */}
                  </div>
                  <div
                    className="om flex"
                    onClick={() => {
                      setShowComments(true);
                      setCommentpostdata(postdata);
                    }}
                  >
                    <motion.div
                      className="btnl mt-0.5 text-2xl"
                      whileHover="hover"
                      variants={scaleUpVariants}
                    >
                      <button>
                        <Image
                          src="/icons/comment.png"
                          className=" h-7 dark:invert w-7"
                          width={100}
                          height={100}
                          alt="Comment"
                        />
                      </button>
                    </motion.div>
                    <div className="k mt-1 ml-3 text-xl  opacity-80">
                      {postdata ? postdata.commentcount : 0}
                    </div>
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
                    <motion.div
                      className="btnl mt-0.5 text-2xl"
                      whileHover="hover"
                      variants={scaleUpVariants}
                    >
                      <Image
                        src="/icons/feedsend.png"
                        alt="Share"
                        className="dark:invert w-7 h-7 mr-1"
                        width={100}
                        height={100}
                      />
                    </motion.div>
                  </div>
                  <motion.div
                    className="btnl mt-0.5 text-2xl"
                    whileHover="hover"
                    variants={scaleUpVariants}
                  >
                    <div
                      className="tagged h-7 w-7 flex mr-2"
                      onClick={() => {
                        setCommentpostdata(postdata);
                        setTaggedusermenu(true);
                      }}
                    >
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
                  </motion.div>
                  <div className="sad mr-1" onClick={handleSave}>
                    <motion.div
                      className="btnl mt-0.5 text-2xl"
                      whileHover="hover"
                      variants={scaleUpVariants}
                    >
                      <Image
                        src="/icons/save.png"
                        alt="Sad"
                        className="dark:invert w-7 h-7"
                        width={100}
                        height={100}
                      />
                    </motion.div>
                  </div>
                  <div
                    className="report cursor-pointer mr-3"
                    onClick={() => Reportposttt()}
                  >
                    <motion.div
                      className="btnl mt-0.5 text-2xl"
                      whileHover="hover"
                      variants={scaleUpVariants}
                    >
                      <Image
                        src="/icons/warning.png"
                        alt="Report"
                        className="dark:invert h-7 w-7"
                        width={100}
                        height={100}
                      />
                    </motion.div>
                  </div>
                </div>
              </div>

              {postdata.caption && <StyledCaption caption={postdata.caption} />}

              <div className="comments flex justify-between mb-1">
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
