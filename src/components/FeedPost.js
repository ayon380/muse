import React from "react";
import { useState, useEffect } from "react";
import { FaRegHeart, FaComments, FaShare } from "react-icons/fa";
import { TiHeartFullOutline } from "react-icons/ti";
import { MdOutlineReportGmailerrorred } from "react-icons/md";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import Image from "next/image";
import { collection, getDoc, query, setDoc } from "firebase/firestore";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import {
  getFirestore,
  updateDoc,
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
  const timestampDate = new Date(firebaseTimestamp.seconds * 1000 + firebaseTimestamp.nanoseconds / 1000000);

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
const FeedPost = ({
  db,
  post,
  userdata,
  usermetadata,
  enqueueUserMetadata,
}) => {
  const [liked, setLiked] = React.useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const [postdata, setPostdata] = useState(post);
  const [commentList, setCommentList] = useState([]);
  const [commentsloading, setCommentsloading] = useState(false);
  const [commentlikes, setCommentlikes] = useState({});
  const [replies, setReplies] = useState({});
  const [commentreply, setCommentreply] = useState({});
  const [reply, setReply] = useState("");
  const router = useRouter();
  const limit=50;
  const handleShowComments = () => {
    setShowComments((prevState) => !prevState);
  };
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
              [q.id]: q.likes.includes(userdata.uid),
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
        const isLiked = comment.likes.includes(userdata.uid);
        const newLikeCount = isLiked
          ? comment.likecount - 1
          : comment.likecount + 1;
        const newLikes = isLiked
          ? comment.likes.filter((uid) => uid !== userdata.uid)
          : [...comment.likes, userdata.uid];

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
        uid: userdata.uid,
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
  }, [showComments,postdata]);
  const checkIfLiked = async () => {
    if (userdata) {
      const postRef = doc(db, "posts", postdata.id);
      const docSnap = await getDoc(postRef);
      if (docSnap.exists()) {
        if (docSnap.data().likes.includes(userdata.uid)) {
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
        sender: userdata.uid,
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
          likes: arrayRemove(userdata.uid),
          likecount: increment(-1),
        });
      } else {
        setLiked(true);
        setPostdata({ ...postdata, likecount: postdata.likecount + 1 });
        await updateDoc(postRef, {
          likes: arrayUnion(userdata.uid),
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
  const Shareposttt = async () => {
    const url = `${window.location.origin}/feed/${postdata.uid}/${postdata.id}`;
    navigator.share({
      title: "Post - Muse",
      text: postdata.caption,
      url: url,
    });
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
        uid: userdata.uid,
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
  return (
    <>
      <div
        className=" z-10 justify-center relative  w-full py-4  lg:px-96 object-fill"
        key={postdata.id}
      >
        <Toaster/>
        {showComments && (
          <div className="absolute inset-0 h-full w-full  flex justify-center items-center lg:px-96 py-4 z-50">
            <div className=" bg-white bg-clip-padding backdrop-filter backdrop-blur-3xl bg-opacity-80 shadow-2xl border-1 border-black rounded-xl p-8 h-full w-full">
            <button
                className="absolute text-center  text-xl"
                onClick={() => setShowComments(false)}
              >
                Close
              </button>
              <div className="comments h-full  overflow-y-auto">
                {commentList.map((comment) => (
                  <div
                    key={comment.timestamp + Math.random()}
                    className="comment transition transform-gpu rounded-xl bg-gray-600 my-5 p-5 mx-5 bg-opacity-10"
                  >
                    <div className="flex z-20">
                      {usermetadata[comment.uid] ? (
                        <Link href={`/${usermetadata[comment.uid].userName}`}>
                          <div className="flex ">
                            <Image
                              className="rounded-full h-6 w-6 "
                              src={usermetadata[comment.uid].pfp}
                              height={50}
                              width={50}
                              alt="Commenter Profile Pic"
                            />

                            <div
                              className="hy text-xs w-24 opacity-80 ml-2"
                              style={{ marginTop: "2px" }}
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
                        style={{ marginTop: "2px" }}
                      >
                        {comment.timestamp}
                      </div>
                      <div
                        className="btnl text-2xl  ml-10 "
                        onClick={() => handleCommentLike(comment.id)}
                      >
                        {!commentlikes[comment.id] ? (
                          <div className="lp text-xl">
                            <FaRegHeart />
                          </div>
                        ) : (
                          <TiHeartFullOutline style={{ color: "red" }} />
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
                        {commentreply[comment.id] ? "" : "Show Replies"}
                      </div>
                      {commentreply[comment.id] && (
                        <div className="q">
                          {replies[comment.id] &&
                            (replies[comment.id].length > 0 ? (
                              <>
                                {replies[comment.id].map((reply) => (
                                  <>
                                    <div
                                      className="flex z-20 my-3"
                                      key={reply.id}
                                    >
                                      {usermetadata[comment.uid] ? (
                                        <Link
                                          href={`/${
                                            usermetadata[reply.uid].userName
                                          }`}
                                        >
                                          <div className="flex ">
                                            <Image
                                              className="rounded-full h-6 w-6 "
                                              src={usermetadata[reply.uid].pfp}
                                              height={50}
                                              width={50}
                                              alt="Commenter Profile Pic"
                                            />

                                            <div
                                              className="hy text-xs w-24 opacity-80 ml-2"
                                              style={{ marginTop: "2px" }}
                                            >
                                              {usermetadata[reply.uid].userName}
                                            </div>
                                          </div>
                                        </Link>
                                      ) : (
                                        <>Loading..</>
                                      )}
                                      <div
                                        className="time text-xs opacity-60"
                                        style={{ marginTop: "2px" }}
                                      >
                                        {reply.timestamp}
                                      </div>
                                    </div>
                                    <p className="-mt-2 mb-2">
                                      {reply.content}
                                    </p>
                                  </>
                                ))}
                              </>
                            ) : (
                              <div className="flex justify-center w-full mt-20">
                                No Replies Yet
                              </div>
                            ))}
                          <div className="lp flex">
                            <input
                              type="text"
                              className="text-sm text-black w-5/6 rounded-2xl leading-6 px-2 py-1 transition duration-100 border border-gray-300 bg-gray-200 block h-9 focus:border-purple-600 focus:bg-white"
                              placeholder="Reply"
                              value={reply}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleReplySubmit(comment);
                                }
                              }}
                              onChange={(e) => setReply(e.target.value)}
                              autoFocus
                              autoComplete=""
                              autoCorrect="" // Prevent event propagation
                            />

                            <button
                              className="ml-2 btn px-2"
                              // onClick={handleCommentSubmit}
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
                  <div className="flex justify-center w-full mt-20">
                    No Comments Yet
                  </div>
                )}
              </div>
              <div className="gf rounded-xl pt-6 w-full"></div>
              
              <div className="comment-section flex fixed bottom-4 -ml-8 w-full p-4">
                <input
                  type="text"
                  class="text-sm text-black w-5/6 rounded-2xl leading-6 px-2 py-1 transition duration-100 border border-gray-300 bg-gray-200 block h-9 hover:border-gray-400 focus:border-purple-600 focus:bg-white"
                  placeholder="Add a comment emoji 😀"
                  value={comment}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleCommentSubmit();
                    }
                  }}
                  onChange={(e) => setComment(e.target.value)}
                />

                <button
                  className="ml-5 btn px-10"
                  onClick={handleCommentSubmit}
                >
                  Comment
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="df bg-white bg-opacity-40 rounded-2xl px-2 py-2 ">
          {usermetadata && usermetadata[postdata.uid] && (
            <div className="header flex justify-between">
              <div className="flex items-center">
                <div className="profile-pic">
                  <Image
                    className="rounded-full h-16 w-16 object-cover"
                    src={usermetadata[postdata.uid].pfp}
                    width={100}
                    height={100}
                    alt="Profile Picture"
                  />
                </div>
                <div className="username ml-2  text-3xl">
                  {usermetadata[postdata.uid].userName}
                </div>
              </div>
              <div className="time mt-4">
                {formatFirebaseTimestamp(postdata.timestamp)}
              </div>
            </div>
          )}
          <div className="gf  rounded-xl  pt-6 z-20 w-full  ">
            <Carousel showThumbs={false} >
              {postdata?.mediaFiles.map((media) => (
                <>
                  {isVideoFile(media) ? (
                    <>
                      <video
                        className="max-h-96 w-full bg-transparent bg-opacity-80  rounded-xl"
                        src={media}
                        controls
                        style={{ maxHeight: "500px" }}
                        // className="h-96 rounded-xl w-96"
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
                        // style={{maxHeight: "500px"}}
                      />
                    </>
                  )}
                </>
              ))}
            </Carousel>
            <div className="footer ">
              <div className="flex justify-between">
                <div className="like flex">
                  <div className="btnl text-2xl" onClick={handleLike}>
                    {!liked ? (
                      <FaRegHeart />
                    ) : (
                      <TiHeartFullOutline style={{ color: "red" }} />
                    )}
                    <div />
                  </div>
                  <div className="likes text-xl font-bold">
                    {postdata.likecount} likes
                  </div>
                </div>
                <div className="l12 mt-2 flex text-3xl">
                  <div
                    className="share cursor-pointer mr-3"
                    onClick={() => Shareposttt()}
                  >
                    <FaShare />
                  </div>
                  <div
                    className="report cursor-pointer mr-3"
                    onClick={() => Reportposttt()}
                  >
                    <MdOutlineReportGmailerrorred />
                  </div>
                </div>
              </div>

              {post ? (
                <div className="caption text-xl font-bold m-1 w-36">
                  {postdata.caption}
                </div>
              ) : null}

              <div
                className="comments flex font-bold"
                onClick={() => setShowComments(!showComments)}
              >
                <button>
                  <FaComments />
                </button>
                {postdata ? postdata.commentcount : 0} comments
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FeedPost;
