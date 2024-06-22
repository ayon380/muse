import React, { useState, useEffect, useRef } from "react";
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
import BottomSheet from "./BottomSheet";
const PostComment = ({
  setShowComments,
  db,
  userdata,
  postid,
  usermetadata,
  enqueueUserMetadata,
  uid,
}) => {
  const [commentList, setCommentList] = useState([]);
  const [commentsloading, setCommentsloading] = useState(true);
  const [commentlikes, setCommentlikes] = useState({});
  const [replies, setReplies] = useState({});
  const [commentreply, setCommentreply] = useState({});
  const [isOpen, setIsOpen] = useState(true);
  const [reeldata, setreeldata] = useState({});

  // const [reply, setReply] = useState("");
  // const [comment, setComment] = useState("");
  const inputref = useRef();
  const replyref = useRef();

  const limit = 50;
  const { setpostdataupdate } = useSidebarStore();
  console.log(postid);
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
      const q = await getDoc(doc(db, "reels", postid));
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
      const reply = replyref.current.value;
      if (reply.trim() === "") {
        return;
      }

      const commentId = comment.id;
      const replyRef = collection(db, "replies");
      const replyData = {
        content: reply,
        likecount: 0,
        uid: uid,
        timestamp: new Date(),
      };
      replyref.current.value = "";
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
    // try {
    let comment = inputref.current.value;
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
    const postRef = doc(db, "reels", postid);
    await updateDoc(postRef, {
      commentcount: increment(1),
      comments: arrayUnion(q.id),
    });
    await updateDoc(doc(commentRef, q.id), {
      id: q.id,
    });
    commentData.timestamp = formatTimestamp(commentData.timestamp);
    setCommentList((prevState) => [...prevState, commentData]);
    // setComment("");

    inputref.current.value = "";
    sendNotification("commentpost");
    //   setpostdataupdate(post);
    toast.success("Comment posted successfully");
    //   } catch (error) {
    //     toast.error("Error posting comment: " + error.message);
    //   }
  };
  const sendNotification = async (type) => {
    try {
      const notificationData = {
        id: "",
        sender: userdata.uid,
        postid: postid,
        type: "comment",
        subtype: type,
        receiver: reeldata.uid,
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
  const getreeldata = async () => {
    try {
      const q = await getDoc(doc(db, "reels", postid));
      setreeldata(q.data());
    } catch (error) {
      console.error("Error fetching reel data:", error);
    }
  };
  useEffect(() => {
    setTimeout(() => {
      getComments();
      getreeldata();
    }, 1000);
  }, []);

  useEffect(() => {
    setIsOpen(true);
  }, []);

  const close = () => {
    setShowComments(false);
  };

  return (
    <div className=" Comment dark:bg-black">
      <BottomSheet show={isOpen} heading="Comments" onClose={close}>
        <div className="comments sheetcontent bg-fuchsia-50 dark:bg-black  p-5 pb-20 w-full h-full overflow-y-auto">
          {commentList.length === 0 && !commentsloading && (
            <div className="text-center text-gray-500 dark:text-gray-400">
              No comments yet
            </div>
          )}
          {commentList.map((comment) => (
            <motion.div
              key={comment.id}
              className="comment transition transform-gpu bg-fuchsia-100 dark:bg-black rounded-xl my-3 p-3 md:mx-5"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex z-20 items-center">
                {usermetadata[comment.uid] ? (
                  <Link
                    href={`/feed/profile/${usermetadata[comment.uid].userName}`}
                  >
                    <div className="flex items-center">
                      <div className="profile-pic-container flex justify-center items-center">
                        <Image
                          className="profile-pic rounded-full h-5 w-5 object-cover"
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
                  <>
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="lds-ring">
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mt-4">
                        Loading...
                      </p>
                    </div>
                  </>
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
              <div className="comment-content md:text-base mt-2 dark:text-gray-300">
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
                    <input
                      className="border rounded-lg p-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                      ref={replyref}
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
                    className="text-xs text-fuchsia-400 mt-2 ml-5 transition hover:underline"
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
                      className="reply-content bg-fuchsia-200 dark:bg-gray-800 rounded-lg p-3 mt-2 ml-5 md:text-sm"
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
                              <span className="text-blue-500 text-xs  ml-2 dark:text-blue-300">
                                {usermetadata[reply.uid].userName}
                              </span>
                            </div>
                          </Link>
                        )}
                        <span className="text-gray-500 text-xs  dark:text-gray-400">
                          {reply.timestamp}
                        </span>
                      </div>
                      <div className="dark:text-gray-300 text">
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
              className="w-full rounded-full p-2 dark:bg-feedheader text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
              // value={comment}
              // onChange={(e) => {
              //   setComment(e.target.value);
              //   e.preventDefault();
              // }}
              ref={inputref}
              placeholder="Write a comment..."
            />
            <button
              className="ml-4 disabled:bg-purple-300 bg-purple-500 text-white py-2 px-4 rounded-full text-sm transition hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400"
              onClick={handleCommentSubmit}
            >
              Comment
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
};

export default PostComment;
