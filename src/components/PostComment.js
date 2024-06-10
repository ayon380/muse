import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { FaRegHeart } from "react-icons/fa";
import { TiHeartFullOutline } from "react-icons/ti";
import Image from "next/image";
import Link from "next/link";
import { useSidebarStore } from "../app/store/zustand";
import {
  getFirestore,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  addDoc,
  getDoc,
  collection,
  limit,
  doc,
  increment,
} from "firebase/firestore";
import toast from "react-hot-toast";

const PostComment = ({
  setShowComments,
  db,
  userdata,
  postdata,
  usermetadata,
  enqueueUserMetadata,
  uid,
}) => {
  const [commentList, setCommentList] = useState([]);
  const [commentsloading, setCommentsloading] = useState(false);
  const [commentlikes, setCommentlikes] = useState({});
  const [replies, setReplies] = useState({});
  const [commentreply, setCommentreply] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const [reply, setReply] = useState("");
  const [comment, setComment] = useState("");
  const limit = 50;
  const { setpostdataupdate } = useSidebarStore();

  function formatTimestamp(firebaseTimestamp) {
    if (
      !firebaseTimestamp ||
      typeof firebaseTimestamp !== "object" ||
      !("seconds" in firebaseTimestamp) ||
      !("nanoseconds" in firebaseTimestamp)
    ) {
      return "Invalid date";
    }

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
      const options = { year: "numeric", month: "long", day: "numeric" };
      return timestampDate.toLocaleDateString(undefined, options);
    }
  }

  const getComments = async () => {
    try {
      setCommentsloading(true);
      const q = await getDoc(doc(db, "posts", postdata.id));
      const ncom = q.data().comments;

      const newComments = await Promise.all(
        ncom.map(async (commentId) => {
          if (typeof commentId !== "string" || !commentId.trim()) {
            console.error(`Invalid comment ID: ${commentId}`);
            return null;
          }

          const trimmedCommentId = commentId.trim();

          try {
            const commentRef = doc(db, "comments", trimmedCommentId);
            const docSnap = await getDoc(commentRef);
            if (docSnap.exists()) {
              const commentData = docSnap.data();
              await enqueueUserMetadata(commentData.uid);
              commentData.timestamp = formatTimestamp(commentData.timestamp);
              setCommentlikes((prevCommentlikes) => ({
                ...prevCommentlikes,
                [trimmedCommentId]: commentData.likes.includes(uid),
              }));
              return commentData;
            } else {
              console.error(
                `Comment with ID ${trimmedCommentId} does not exist`
              );
              return null;
            }
          } catch (error) {
            console.error(
              `Error fetching comment with ID ${trimmedCommentId}:`,
              error
            );
            return null;
          }
        })
      );

      const uniqueComments = Array.from(
        new Set(
          newComments
            .filter((comment) => comment !== null)
            .map((comment) => comment.id)
        )
      ).map((id) => newComments.find((comment) => comment.id === id));

      setCommentList(uniqueComments);
      setCommentsloading(false);
    } catch (error) {
      console.error("Error fetching comments:", error);
      setCommentsloading(false);
    }
  };

  const handleCommentLike = async (commentId) => {
    if (userdata && commentId) {
      setCommentlikes((prevCommentlikes) => ({
        ...prevCommentlikes,
        [commentId]: !prevCommentlikes[commentId],
      }));
      setCommentList((prevCommentList) => {
        const updatedCommentList = prevCommentList.map((c) => {
          if (c.id === commentId) {
            return {
              ...c,
              likecount: commentlikes[commentId]
                ? c.likecount - 1
                : c.likecount + 1,
              likes: commentlikes[commentId]
                ? c.likes.filter((likeUid) => likeUid !== uid)
                : [...c.likes, uid],
            };
          }
          return c;
        });
        return updatedCommentList;
      });
      const commentRef = doc(db, "comments", commentId);
      const docSnap = await getDoc(commentRef);
      if (docSnap.exists()) {
        const comment = docSnap.data();
        const isLiked = comment.likes.includes(uid);
        const newLikeCount = isLiked
          ? comment.likecount - 1
          : comment.likecount + 1;
        const newLikes = isLiked
          ? comment.likes.filter((likeUid) => likeUid !== uid)
          : [...comment.likes, uid];

        await updateDoc(commentRef, {
          likes: newLikes,
          likecount: newLikeCount,
        });
      }
      toast.success("Comment liked successfully");
    }
  };

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
        replies: arrayUnion(q.id),
      });
      await updateDoc(doc(replyRef, q.id), {
        id: q.id,
      });
      replyData.timestamp = formatTimestamp(replyData.timestamp);
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
      toast.success("Reply posted successfully");
    } catch (error) {
      toast.error("Error posting reply: " + error.message);
    }
  };

  const getReplies = async (comment) => {
    try {
      const newReplies = await Promise.all(
        comment.replies.map(async (replyId) => {
          const replyRef = doc(db, "replies", replyId);
          const docSnap = await getDoc(replyRef);
          if (docSnap.exists()) {
            const replyData = docSnap.data();
            await enqueueUserMetadata(replyData.uid);
            replyData.timestamp = formatTimestamp(replyData.timestamp);
            return replyData;
          }
          return null;
        })
      );
      setReplies((prevReplies) => ({
        ...prevReplies,
        [comment.id]: newReplies.filter(Boolean),
      }));
    } catch (error) {
      console.error("Error fetching replies:", error);
    }
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
        comments: arrayUnion(q.id),
      });
      await updateDoc(doc(commentRef, q.id), {
        id: q.id,
      });
      commentData.timestamp = formatTimestamp(commentData.timestamp);
      setCommentList((prevState) => [...prevState, commentData]);
      setComment("");
      setpostdataupdate(postdata.id);
      toast.success("Comment posted successfully");
    } catch (error) {
      toast.error("Error posting comment: " + error.message);
    }
  };

  useEffect(() => {
    getComments();
  }, []);

  useEffect(() => {
    setIsOpen(true);
  }, []);

  const close = () => {
    setTimeout(() => setShowComments(false), 500);
    // setShowComments(false);
  };
  const [isDragging, setIsDragging] = useState(false);
  const sheetRef = useRef(null);
  const startYRef = useRef(0);
  const currentYRef = useRef(0);

  const openSheet = () => setIsOpen(true);
  const closeSheet = () => close();

  const handleTouchStart = (e) => {
    startYRef.current = e.touches[0].clientY;
    currentYRef.current = e.touches[0].clientY;
    setIsDragging(true);
    if (sheetRef.current) {
      sheetRef.current.style.transition = "none";
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    currentYRef.current = e.touches[0].clientY;
    const diff = currentYRef.current - startYRef.current;
    if (sheetRef.current && diff > 0) {
      sheetRef.current.style.transform = `translateY(${diff}px)`;
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging || !sheetRef.current) return;
    setIsDragging(false);
    const diff = currentYRef.current - startYRef.current;
    const threshold = sheetRef.current.clientHeight * 0.25;
    sheetRef.current.style.transition = "transform 0.3s ease-out";
    if (diff > threshold) {
      closeSheet();
      sheetRef.current.style.transform = "translateY(100%)";
    } else {
      sheetRef.current.style.transform = "translateY(0)";
    }
  };

  const handleOutsideClick = (e) => {
    if (isOpen && sheetRef.current && !sheetRef.current.contains(e.target)) {
      closeSheet();
    }
  };

  useEffect(() => {
    const handleTouchCancel = () => {
      if (sheetRef.current) {
        sheetRef.current.style.transition = "transform 0.3s ease-out";
        sheetRef.current.style.transform = isOpen
          ? "translateY(0)"
          : "translateY(100%)";
      }
      setIsDragging(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick, {
      passive: true,
    });
    document.addEventListener("touchcancel", handleTouchCancel);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
      document.removeEventListener("touchcancel", handleTouchCancel);
    };
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  useEffect(() => {
    if (sheetRef.current) {
      sheetRef.current.style.transform = isOpen
        ? "translateY(0)"
        : "translateY(100%)";
    }
  }, [isOpen]);
  return (
    <div className="relative Comment">
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40" />
      )}
      <div className="aa">
        <div
          ref={sheetRef}
          className="fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t-4 border-feedheader rounded-t-3xl shadow-lg z-50 transition-transform duration-300 ease-out"
          style={{
            transform: isOpen ? "translateY(0)" : "translateY(100%)",
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex justify-center pt-4 pb-2">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </div>
          <div className="px-4 pb-6 max-h-[70vh] overflow-y-auto">
            <div className="flex sticky z-50 bg-white dark:bg-black top-0 justify-between items-center mb-4 p-2 border-b dark:border-gray-700">
              <h2 className="text-2xl font-bold">Comments</h2>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setTimeout(close, 500);
                }}
                className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-400 transition-colors duration-300"
              >
                Close
              </button>
            </div>
            <div className="comments rounded-xl pt-5 mb-20 w-full h-full overflow-y-auto">
              {commentList.length === 0 && (
                <div className="text-center text-gray-500 dark:text-gray-400">
                  No comments yet
                </div>
              )}
              {commentList.map((comment) => (
                <motion.div
                  key={comment.id}
                  className="comment transition transform-gpu bg-gray-50 dark:bg-gray-800 rounded-xl my-3 p-5 mx-2 md:mx-5"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex z-20 items-center">
                    {usermetadata[comment.uid] ? (
                      <Link
                        href={`/feed/profile/${
                          usermetadata[comment.uid].userName
                        }`}
                      >
                        <div className="flex items-center">
                          <div className="profile-pic-container h-10 w-10 md:h-12 md:w-12 flex justify-center items-center">
                            <Image
                              className="profile-pic rounded-full h-full w-full object-cover"
                              src={usermetadata[comment.uid].pfp}
                              width={50}
                              height={50}
                              alt="Commenter Profile Pic"
                            />
                          </div>
                          <div className="text-xs w-24 opacity-80 ml-2 dark:text-gray-300">
                            {usermetadata[comment.uid].userName}
                          </div>
                        </div>
                      </Link>
                    ) : (
                      <>Loading..</>
                    )}
                    <div className="time text-xs opacity-60 ml-auto dark:text-gray-400">
                      {comment.timestamp}
                    </div>
                    <div
                      className="likes ml-3 flex items-center cursor-pointer"
                      onClick={() => handleCommentLike(comment.id)}
                    >
                      {commentlikes[comment.id] ? (
                        <TiHeartFullOutline className="text-red-500" />
                      ) : (
                        <FaRegHeart className="dark:text-gray-300" />
                      )}
                    </div>
                    <div className="text-xs ml-1 dark:text-gray-300">
                      {comment.likecount}
                    </div>
                  </div>
                  <div className="comment-content text-xs md:text-base mt-2 dark:text-gray-300">
                    {comment.content}
                  </div>
                  <div className="replies mt-3 md:ml-5">
                    <button
                      className="reply-btn text-xs opacity-60 dark:opacity-80 transition hover:opacity-80 dark:hover:opacity-90"
                      onClick={() =>
                        setCommentreply((prevState) => ({
                          ...prevState,
                          [comment.id]: !prevState[comment.id],
                        }))
                      }
                    >
                      Reply
                    </button>
                    {commentreply[comment.id] && (
                      <div className="reply-form flex flex-col mt-2">
                        <textarea
                          className="border rounded-lg p-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                          value={reply}
                          onChange={(e) => setReply(e.target.value)}
                          rows="2"
                          placeholder="Write your reply..."
                        />
                        <button
                          className="self-end mt-1 bg-blue-500 text-white py-1 px-2 rounded-lg text-xs transition hover:bg-blue-600"
                          onClick={() => handleReplySubmit(comment)}
                        >
                          Post Reply
                        </button>
                      </div>
                    )}
                    {comment.replies.length > 0 && (
                      <button
                        className="text-xs text-blue-500 mt-2 ml-5 transition hover:underline"
                        onClick={() => {
                          if (!replies[comment.id]) getReplies(comment);
                          else
                            setReplies((prevReplies) => ({
                              ...prevReplies,
                              [comment.id]: null,
                            }));
                        }}
                      >
                        {replies[comment.id] ? "Hide" : "View"} Replies
                      </button>
                    )}
                    {replies[comment.id] &&
                      replies[comment.id].map((reply, index) => (
                        <motion.div
                          key={index}
                          className="reply-content bg-gray-100 dark:bg-gray-800 rounded-lg p-2 mt-2 ml-5 text-xs md:text-sm"
                          initial={{ opacity: 0, y: 50 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5 }}
                        >
                          <div className="flex justify-between items-center">
                            {usermetadata[reply.uid] && (
                              <Link
                                href={`/feed/profile/${
                                  usermetadata[reply.uid].userName
                                }`}
                              >
                                <div className="flex items-center">
                                  <div className="profile-pic-container h-6 w-6 md:h-8 md:w-8 flex justify-center items-center">
                                    <Image
                                      className="profile-pic rounded-full h-full w-full object-cover"
                                      src={usermetadata[reply.uid].pfp}
                                      width={50}
                                      height={50}
                                      alt="Reply Profile Pic"
                                    />
                                  </div>
                                  <span className="text-blue-500 ml-2 dark:text-blue-300">
                                    {usermetadata[reply.uid].userName}
                                  </span>
                                </div>
                              </Link>
                            )}
                            <span className="text-gray-500 dark:text-gray-400">
                              {reply.timestamp}
                            </span>
                          </div>
                          <div className="dark:text-gray-300">
                            {reply.content}
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </motion.div>
              ))}
              {commentsloading && (
                <div className="text-center text-gray-500 dark:text-gray-400">
                  Loading...
                </div>
              )}
            </div>
            <div className="sticky bottom-0  w-full bg-white dark:bg-black py-4 px-6 shadow-lg">
              <div className="flex items-center">
                <input
                  className="w-full rounded-full p-3 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write a comment..."
                />
                <button
                  className="ml-4 bg-purple-500 text-white py-2 px-4 rounded-full text-sm transition hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  onClick={handleCommentSubmit}
                >
                  Comment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostComment;
