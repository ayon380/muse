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
function formatTimestamp(firebaseTimestamp) {
  // Check if the timestamp is valid
  if (
    !firebaseTimestamp ||
    typeof firebaseTimestamp !== "object" ||
    !("seconds" in firebaseTimestamp) ||
    !("nanoseconds" in firebaseTimestamp)
  ) {
    return "Invalid date";
  }

  // Convert Firestore timestamp to JavaScript Date object
  const timestampDate = new Date(
    firebaseTimestamp.seconds * 1000 + firebaseTimestamp.nanoseconds / 1000000
  );

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
const ShareMenu = dynamic(() => import("@/components/ShareMenu"), {
  ssr: false,
});
const FeedPost = ({
  db,
  type,
  post,
  setSharemenu,
  setSharepostdata,
  userdata,
  usermetadata,
  currentuserdata,
  enqueueUserMetadata,
}) => {
  const [liked, setLiked] = React.useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  console.log(post + "post");
  const [postdata, setPostdata] = useState(post);
  const [commentList, setCommentList] = useState([]);
  const [commentsloading, setCommentsloading] = useState(false);
  const [uid, setUid] = useState("");
  const [commentlikes, setCommentlikes] = useState({});
  const [replies, setReplies] = useState({});
  const [commentreply, setCommentreply] = useState({});
  const [showedit, setShowedit] = useState(false);
  const [showdelete, setShowdelete] = useState(false);
  const [reply, setReply] = useState("");
  // const [sharemenu, setSharemenu] = useState(false);
  const router = useRouter();
  const limit = 50;
  useEffect(() => {
    if (type == "profile") setUid(currentuserdata.uid);
    else setUid(userdata.uid);
  }, []);
  const getComments = async () => {
    try {
      setCommentsloading(true);
      let newcomments = [];
      let i = 0;
      postdata.comments.map(async (comment) => {
        if (i <= limit) {
          const commentRef = doc(db, "comments", comment);
          const docSnap = await getDoc(commentRef);
          if (docSnap.exists()) {
            // if(!commentList.includes(docSnap.data()))
            const q = docSnap.data();
            await enqueueUserMetadata(q.uid);
            setCommentlikes((prevCommentlikes) => ({
              ...prevCommentlikes,
              [q.id]: q.likes.includes(uid),
            }));
            console.log(q.timestamp);
            const r = formatTimestamp(q.timestamp);
            q.timestamp = r;
            newcomments.push(q);
          }
        }
      });
      console.log(newcomments, "newcomments");
      setCommentList(newcomments);
      setCommentsloading(false);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };
  const handleCommentLike = async (commentId) => {
    if (userdata && commentId) {
      setCommentlikes((prevCommentlikes) => ({
        ...prevCommentlikes,
        [commentId]: !prevCommentlikes[commentId],
      }));
      const commentRef = doc(db, "comments", commentId);
      const docSnap = await getDoc(commentRef);
      if (docSnap.exists()) {
        const comment = docSnap.data();
        const isLiked = comment.likes.includes(uid);
        const newLikeCount = isLiked
          ? comment.likecount - 1
          : comment.likecount + 1;
        const newLikes = isLiked
          ? comment.likes.filter((uid) => uid !== uid)
          : [...comment.likes, uid];

        await updateDoc(commentRef, {
          likes: newLikes,
          likecount: newLikeCount,
        });
      }
      toast.success("Comment liked successfully");
    }
  };
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
  const handleReplySubmit = async (comment) => {
    try {
      if (reply.trim() === "") {
        return;
      }
      setReply("");
      const commentId = comment.id;
      const replyRef = collection(db, "replies");
      const replyData = {
        content: reply,
        likecount: 0,
        uid: uid,
        timestamp: new Date(),
      };
      const q = await addDoc(replyRef, replyData);
      const commentRef = doc(db, "comments", commentId);
      await updateDoc(commentRef, {
        replies: arrayUnion(q.id), // Pass the DocumentReference directly
      });
      await updateDoc(doc(replyRef, q.id), {
        id: q.id,
      });
      const r = formatFirebaseTimestamp(replyData.timestamp);
      replyData.timestamp = r;
      setReplies((prevReplies) => {
        const updatedReplies = {
          ...prevReplies,
          [commentId]: Array.isArray(prevReplies[commentId])
            ? [...prevReplies[commentId], replyData]
            : [replyData],
        };
        return updatedReplies;
      });

      setCommentList((prevCommentList) => {
        const updatedCommentList = prevCommentList.map((c) => {
          if (c.id === commentId) {
            return {
              ...c,
              replies: Array.isArray(c.replies) ? [...c.replies, q.id] : [q.id],
            };
          }
          return c;
        });
        return updatedCommentList;
      });
      // getReplies(comment);
      toast.success("Reply posted successfully");
    } catch (error) {
      toast.error("Error posting reply: " + error.message);
    }
  };
  const getReplies = async (comment) => {
    try {
      console.log(comment.content);
      console.log("Replies loading");
      let newreplies = [];
      console.log(comment.replies, "comment.replies");

      // Use Promise.all to await all asynchronous operations inside map
      await Promise.all(
        comment.replies.map(async (reply) => {
          const replyRef = doc(db, "replies", reply);
          const docSnap = await getDoc(replyRef);
          if (docSnap.exists()) {
            const q = docSnap.data();
            await enqueueUserMetadata(q.uid); // Assuming getusermetadata is an async function
            const r = formatTimestamp(q.timestamp);
            q.timestamp = r;
            if (!newreplies.includes(q))
              // Check if the reply is not already in newreplies
              newreplies.push(q);
          }
        })
      );

      console.log(newreplies, "newreplies");
      setReplies((prevReplies) => ({
        ...prevReplies,
        [comment.id]: newreplies,
      }));
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };
  useEffect(() => {
    if (showComments) getComments();
  }, [showComments, postdata]);
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
      if (liked) {
        setLiked(false);
        setPostdata({ ...postdata, likecount: postdata.likecount - 1 });
        await updateDoc(postRef, {
          likes: arrayRemove(uid),
          likecount: increment(-1),
        });
      } else {
        setLiked(true);
        setPostdata({ ...postdata, likecount: postdata.likecount + 1 });
        await updateDoc(postRef, {
          likes: arrayUnion(uid),
          likecount: increment(1),
        });
        sendNotification(postdata);
      }
      // refetchPost();
    }
  };
  const Reportposttt = async () => {
    router.push(`/report/post/${postdata.id}`);
  };

  const handleCommentSubmit = async () => {
    try {
      if (comment.trim() === "") {
        return;
      }
      const commentRef = collection(db, "comments");
      const commentData = {
        content: comment,
        likecount: 0,
        uid: uid,
        likes: [],
        replies: [],
        timestamp: new Date(),
      };
      const q = await addDoc(commentRef, commentData);
      const postRef = doc(db, "posts", postdata.id);
      await updateDoc(postRef, {
        commentcount: increment(1),
        comments: arrayUnion(q.id), // Pass the DocumentReference directly
      });
      await updateDoc(doc(commentRef, q.id), {
        id: q.id,
      });
      const r = formatFirebaseTimestamp(commentData.timestamp);
      commentData.timestamp = r;
      setCommentList((prevState) => [...prevState, commentData]);
      refetchPost();
      setComment("");
      toast.success("Comment posted successfully");
    } catch (error) {
      toast.error("Error posting comment: " + error.message);
    }
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

  const slideInVariants = {
    hidden: { x: '100%' },
    visible: { x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };
  return (
    <>
      <motion.div
        className="z-10 justify-center relative w-full py-4 lg:px-64 md:px-24 dark:bg-black"
        key={postdata.id}
        initial="hidden"
        animate="visible"
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
        {showComments && (
          <motion.div
            className="absolute inset-0 h-full w-full bg-white dark:bg-black flex justify-center items-center lg:px-96 py-4 z-50"
            initial="hidden"
            animate="visible"
            variants={slideInVariants}
          >
            <div className="md:bg-white md:bg-clip-padding md:backdrop-filter md:backdrop-blur-3xl md:bg-opacity-80 shadow-2xl border-1 border-black rounded-xl md:p-8 h-full w-full">
              <button
                className="absolute flex justify-center rounded-t-xl backdrop-filter backdrop-blur-3xl qw w-full text-xl"
                onClick={() => setShowComments(false)}
              >
                <Image
                  src="/icons/slidedown.png"
                  className="dark:invert top-2 w-7 h-7"
                  width={100}
                  height={100}
                  alt=""
                />
              </button>
              <div className="comments rounded-xl pt-5 w-full h-full overflow-y-auto">
                {commentList.map((comment) => (
                  <div
                    key={comment.timestamp + Math.random()}
                    className="comment transition transform-gpu bg-slate-50 dark:bg-gray-900 rounded-xl md:dark:bg-gray-600 my-3 md:my-5 p-3 md:p-5 mx-2 md:mx-5 md:bg-opacity-10"
                  >
                    <div className="flex z-20">
                      {usermetadata[comment.uid] ? (
                        <Link
                          href={`/feed/profile/${usermetadata[comment.uid].userName}`}
                        >
                          <div className="flex">
                            <Image
                              className="rounded-full h-6 w-6"
                              src={usermetadata[comment.uid].pfp}
                              height={50}
                              width={50}
                              alt="Commenter Profile Pic"
                            />
                            <div
                              className="hy text-xs w-24 opacity-80 ml-2"
                              style={{ marginTop: '2px' }}
                            >
                              {usermetadata[comment.uid].userName}
                            </div>
                          </div>
                        </Link>
                      ) : (
                        <>Loading..</>
                      )}
                      <div
                        className="time text-xs opacity-60"
                        style={{ marginTop: '2px' }}
                      >
                        {comment.timestamp}
                      </div>
                      <div
                        className="btnl text-2xl ml-10"
                        onClick={() => handleCommentLike(comment.id)}
                      >
                        {!commentlikes[comment.id] ? (
                          <div className="lp text-xl">
                            <FaRegHeart />
                          </div>
                        ) : (
                          <TiHeartFullOutline style={{ color: 'red' }} />
                        )}
                        <div />
                      </div>
                    </div>
                    <p>{comment.content}</p>
                    <div className="flex">
                      <div className="lieks opacity-75 mr-5 text-xs">
                        {comment.likecount} likes
                      </div>
                      <div
                        className="reply opacity-75 cursor-pointer text-xs"
                        onClick={() => {
                          getReplies(comment);
                          setCommentreply((prevCommentreply) => ({
                            ...prevCommentreply,
                            [comment.id]: !commentreply[comment.id],
                          }));
                        }}
                      >
                        {commentreply[comment.id] ? '' : 'Show Replies'}
                      </div>
                      {commentreply[comment.id] && (
                        <div className="q">
                          {replies[comment.id] &&
                            (replies[comment.id].length > 0 ? (
                              <>
                                {replies[comment.id].map((reply) => (
                                  <>
                                    <div className="flex z-20 my-3" key={reply.id}>
                                      {usermetadata[comment.uid] ? (
                                        <Link href={`/feed/profile/${usermetadata[reply.uid].userName}`}>
                                          <div className="flex">
                                            <Image
                                              className="rounded-full h-6 w-6"
                                              src={usermetadata[reply.uid].pfp}
                                              height={50}
                                              width={50}
                                              alt="Commenter Profile Pic"
                                            />

                                            <div
                                              className="hy text-xs w-24 opacity-80 ml-2"
                                              style={{ marginTop: '2px' }}
                                            >
                                              {usermetadata[reply.uid].userName}
                                            </div>
                                          </div>
                                        </Link>
                                      ) : (
                                        <>Loading..</>
                                      )}
                                      <div className="time text-xs opacity-60" style={{ marginTop: '2px' }}>
                                        {reply.timestamp}
                                      </div>
                                    </div>
                                    <p className="-mt-2 mb-2">{reply.content}</p>
                                  </>
                                ))}
                              </>
                            ) : (
                              <div className="flex justify-center w-full my-10">No Replies Yet</div>
                            ))}
                          <div className="lp flex">
                            <input
                              type="text"
                              className="text-sm text-black w-5/6 rounded-2xl leading-6 px-2 py-1 transition duration-100 border border-gray-300 bg-gray-200 block h-9 focus:border-purple-600 focus:bg-white"
                              placeholder="Reply"
                              autoFocus
                              value={reply}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleReplySubmit(comment);
                                }
                              }}
                              onChange={(e) => setReply(e.target.value)}
                            />

                            <button
                              className="ml-2 btn px-2"
                              onClick={() => {
                                handleReplySubmit(comment);
                              }}
                            >
                              Reply
                            </button>
                            <button
                              className="btn ml-2 px-2"
                              onClick={() =>
                                setCommentreply((prevCommentreply) => {
                                  return {
                                    ...prevCommentreply,
                                    [comment.id]: !commentreply[comment.id],
                                  };
                                })
                              }
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {commentList.length === 0 && (
                  <div className="flex justify-center w-full mt-20">No Comments Yet</div>
                )}
              </div>
              <div className="gf rounded-xl pt-6 w-full"></div>

              <div className="comment-section absolute flex bottom-4 md:-ml-8 w-full p-4">
                <input
                  type="text"
                  className="text-sm text-black w-5/6 rounded-2xl leading-6 backdrop-filter backdrop-blur-3xl px-2 py-1 transition duration-100 border border-gray-300 bg-gray-200 block h-9 hover:border-gray-400 focus:border-purple-600 focus:bg-white"
                  placeholder="Add a comment emoji 😀"
                  value={comment}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCommentSubmit();
                    }
                  }}
                  onChange={(e) => setComment(e.target.value)}
                />

                <button className="ml-2 md:ml-5 btn px-4 md:px-10" onClick={handleCommentSubmit}>
                  Comment
                </button>
              </div>
            </div>
          </motion.div>
        )}
        <div className="df bg-white dark:bg-black bg-opacity-40 rounded-2xl px-2 py-2 m-2">
          {usermetadata && usermetadata[postdata.uid] && (
            <div className="header flex justify-between">
              <Link href={`/feed/profile/${usermetadata[postdata.uid].userName}`}>
                <div className="flex items-center">
                  <div className="profile-pic">
                    <Image
                      className="rounded-full h-8 w-8 md:h-16 md:w-16 object-cover"
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
            <Carousel showThumbs={false}>
              {postdata?.mediaFiles.map((media) => (
                <>
                  {isVideoFile(media) ? (
                    <>
                      <video
                        className="max-h-96 w-full bg-transparent bg-opacity-80 rounded-xl"
                        src={media}
                        controls
                        style={{ maxHeight: '500px' }}
                      />
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
            <div className="footer mt-3">
              <div className="flex justify-between">
                <div className="like flex">
                  <motion.div
                    className="btnl mt-0.5 text-2xl"
                    onClick={handleLike}
                    whileHover="hover"
                    variants={scaleUpVariants}
                  >
                    {!liked ? <FaRegHeart /> : <TiHeartFullOutline style={{ color: 'red' }} />}
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
                  <div className="share cursor-pointer " onClick={() => { setSharepostdata(postdata); setSharemenu(true) }}>
                    <Image
                      src="/icons/send.png"
                      alt="Share"
                      className="dark:invert w-7 h-7 mr-1"
                      width={100}
                      height={100}
                    />
                  </div>
                  <div className="tagged h-7 w-7 flex mr-2">
                    <Image src="/icons/supermarket.png" width={50} height={50} alt="" className="dark:invert" />
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
                  <div className="report cursor-pointer mr-3" onClick={() => Reportposttt()}>
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

              {postdata.caption && <div className="caption m-1 w-full">{postdata.caption}</div>}

              <div className="comments flex justify-between m-1">
                <div className="om flex" onClick={() => setShowComments(!showComments)}>
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
