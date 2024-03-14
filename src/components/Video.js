"use client";
import { useEffect, useRef, useState } from "react";
import { FaRegHeart, FaShare } from "react-icons/fa";
import { MdOutlineReportGmailerrorred } from "react-icons/md";
import { TiHeartFullOutline } from "react-icons/ti";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { collection, getDoc, query, setDoc } from "firebase/firestore";
import toast, { Toaster } from "react-hot-toast";
import {
  getFirestore,
  updateDoc,
  arrayUnion,
  arrayRemove,
  addDoc,
  doc,
  increment,
} from "firebase/firestore";
import app from "@/lib/firebase/firebaseConfig";
import Link from "next/link";

const Reel = ({
  userdata,
  reel,
  isGlobalMuted,
  idx,
  setCurrentReel,
  usermetadata,
  enqueueUserMetadata,
}) => {
  const reelRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [comment, setComment] = useState("");
  const [commentList, setCommentList] = useState([]);
  const db = getFirestore(app);
  const [reeldata, setReeldata] = useState(reel);
  const router = useRouter();
  const [commentsloading, setCommentsloading] = useState(false);
  const [liked, setLiked] = useState(false);
  const [commentlikes, setCommentlikes] = useState({});
  const [replies, setReplies] = useState({});
  const [commentreply, setCommentreply] = useState({});
  const [reply, setReply] = useState("");
  const limit = 5;
  // const [isFullScreen, setIsFullScreen] = useState(false);
  const handleShowComments = () => {
    setShowComments((prevState) => !prevState);
  };
  // Create a promise queue

  const getComments = async () => {
    try {
      setCommentsloading(true);
      let newcomments = [];
      let i = 0;
      reeldata.comments.map(async (comment) => {
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
            const r = formatFirebaseTimestamp(q.timestamp.toDate());
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
            const r = formatFirebaseTimestamp(q.timestamp.toDate());
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
    console.log(commentList);
  }, [commentList]);
  useEffect(() => {
    if (showComments) getComments();
  }, [showComments]);
  const checkIfLiked = async () => {
    if (userdata) {
      const postRef = doc(db, "reels", reeldata.id);
      const docSnap = await getDoc(postRef);
      if (docSnap.exists()) {
        if (docSnap.data().likes.includes(userdata.uid)) {
          setLiked(true);
        }
      }
    }
  };
  const refetchReel = async () => {
    const postRef = doc(db, "reels", reeldata.id);
    const docSnap = await getDoc(postRef);
    if (docSnap.exists()) {
      setReeldata(docSnap.data());
    }
  };

  useEffect(() => {
    checkIfLiked();
  }, [userdata]);
  const sendNotification = async (reeldata) => {
    try {
      const notificationData = {
        id: "",
        sender: userdata.uid,
        reelid: reeldata.id,
        type: "reellike",
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
  const handleLike = async () => {
    if (userdata) {
      const postRef = doc(db, "reels", reeldata.id);
      if (liked) {
        setLiked(false);
        await updateDoc(postRef, {
          likes: arrayRemove(userdata.uid),
          likecount: increment(-1),
        });
      } else {
        setLiked(true);
        await updateDoc(postRef, {
          likes: arrayUnion(userdata.uid),
          likecount: increment(1),
        });
        sendNotification(reeldata);
      }
      refetchReel();
    }
  };
  useEffect(() => {
    const reel = reelRef.current;
    const handlePlayPause = () => {
      if (reel.paused) {
        reel.play();
        setIsPlaying(true);
        pauseOtherReels(reel);
        console.log(idx, "idx");
        // Set current reel index when the video starts playing
        setCurrentReel(idx);
      } else {
        reel.pause();
        setIsPlaying(false);
      }
    };
    const pauseOtherReels = (currentReel) => {
      document.querySelectorAll(".reel").forEach((otherReel) => {
        if (otherReel !== currentReel && !otherReel.paused) {
          otherReel.pause();
        }
      });
    };
    reel.addEventListener("click", handlePlayPause);
    // Intersection observer to check if the reel is mostly in viewport
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          reel.play();
          setIsPlaying(true);
          // Set current reel index when the video starts playing
          console.log(idx, "idx");
          // Set current reel index when the video starts playing
          setCurrentReel(idx);
        } else {
          reel.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(reel);
    return () => {
      reel.removeEventListener("click", handlePlayPause);
      observer.unobserve(reel);
    };
  }, []);

  useEffect(() => {
    setIsMuted(isGlobalMuted);
  }, [isGlobalMuted]);

  const handleButtonClick = () => {
    try {
      const reel = reelRef.current;
      if (reel.paused) {
        reel.play();
        setIsPlaying(true);
        pauseOtherReels(reel);
      } else {
        reel.pause();
        setIsPlaying(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleMuteToggle = () => {
    const reel = reelRef.current;
    const newState = !isMuted;
    reel.muted = newState;
    setIsMuted(newState);
  };
  const Reportposttt = async () => {
    router.push(`/report/reel/${reeldata.id}`);
  };
  useEffect(() => {
    handleMuteToggle();
  }, [isGlobalMuted]);
  const Shareposttt = async () => {
    const url = `${window.location.origin}/feed/reels/${reeldata.id}`;
    navigator.share({
      title: "Reel - Muse",
      text: reeldata.caption,
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
      const postRef = doc(db, "reels", reeldata.id);
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
      refetchReel();
      setComment("");
      toast.success("Comment posted successfully");
    } catch (error) {
      toast.error("Error posting comment: " + error.message);
    }
  };
  useEffect(() => {
    const func = async () => {
      if (userdata) {
        await enqueueUserMetadata(reeldata.uid);
      }
    };
    func();
    const reel = reelRef.current;
    const handleTimeUpdate = () => {
      const duration = reel.duration;
      if (reel.currentTime >= duration * 0.5 && duration && !reeldata.viewed) {
        ifviewed();
        setReeldata((prevReelData) => ({
          ...prevReelData,
          viewed: true,
        }));
      }
    };
    reel.addEventListener("timeupdate", handleTimeUpdate);
    return () => {
      reel.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [reeldata]);
  function formatFirebaseTimestamp(firebaseTimestamp) {
    // Check if the timestamp is valid
    console.log(firebaseTimestamp, "firebaseTimestamp");
    if (!firebaseTimestamp || !(firebaseTimestamp instanceof Date)) {
      return "Invalid date";
    }

    const now = new Date();
    const timestampDate = firebaseTimestamp;
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
  const ifviewed = async () => {
    try {
      console.log("viewed");
      if (userdata) {
        const postRef = doc(db, "reels", reeldata.id);
        await updateDoc(postRef, {
          views: arrayUnion(userdata.uid),
          viewcount: increment(1),
        });
        const userref = doc(db, "users", userdata.email);
        await updateDoc(userref, {
          viewedreels: arrayUnion(reeldata.id),
        });
        console.log("Updating hashtags");
        const userRef = doc(db, "metadata", userdata.uid);
        for (const hashtag of reeldata.hashtags) {
          await updateDoc(userRef, {
            [`${hashtag}`]: increment(1),
          });
        }
      }
    } catch (error) {
      toast.error("Error posting comment: " + error.message);
    }
  };
  const handleReplySubmit = async (comment) => {
    try {
      if (reply.trim() === "") {
        return;
      }
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
      setReply("");
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
  return (
    <div className="text-white" style={{ position: "relative" }}>
      <video
        className="reel snap-center text-white"
        ref={reelRef}
        src={reeldata.mediaFiles}
        loop
        controls={false}
      />
      <button
        className="play-pause-button"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "none",
          border: "none",
          color: "white",
          fontSize: "24px",
          cursor: "pointer",
          opacity: isPlaying ? 0 : 1,
          transition: "opacity 0.3s ease-in-out",
        }}
        onClick={handleButtonClick}
      >
        {isPlaying ? "Pause" : "Play"}
      </button>
      <div
        className="footer absolute mt-10 -mb-4 pb-4 pt-20 bottom-4 w-full"
        style={{
          backgroundImage:
            "linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent)",
        }}
      >
        <div className="ko p-4">
          {usermetadata[reeldata.uid] && (
            <div
              className="flex mb-2 cursor-pointer font-bold"
              onClick={() =>
                router.push(`/${usermetadata[reeldata.uid].userName}`)
              }
            >
              <Image
                className="h-8 mr-3 w-8 rounded-full object-center"
                src={usermetadata[reeldata.uid].pfp}
                alt="Profile Pic"
                height={50}
                width={50}
              />
              <div className="sa ">{usermetadata[reeldata.uid].userName}</div>
            </div>
          )}
          <div className="flex justify-between">
            <div className="lp flex ">
              <div className="btnl text-4xl h-10 w-10 " onClick={handleLike}>
                {!liked ? (
                  <div className="lp text-3xl">
                    <FaRegHeart />
                  </div>
                ) : (
                  <TiHeartFullOutline style={{ color: "red" }} />
                )}
                <div />
              </div>
              <div
                style={{ marginTop: "1px" }}
                className=" ml-2likes text-2xl  font-bold flex"
              >
                {reeldata.likecount}{" "}
                <div className="ok  font-normal text-base opacity-75 mt-1 ml-1">
                  likes
                </div>
              </div>
            </div>
            <div className="ki text-2xl">
              {/* <button>
                <Image src="/fullscreen.svg" alt="" height={50} width={50} />
              </button> */}
              <button className="share-button mr-2" onClick={Shareposttt}>
                <FaShare />
              </button>
              <button className="report-button" onClick={Reportposttt}>
                <MdOutlineReportGmailerrorred />
              </button>
            </div>
          </div>
          <div className="caption opacity-75">{reeldata.caption}</div>

          <button className="show-comments-button" onClick={handleShowComments}>
            {" "}
            {reeldata.commentcount} Comments
          </button>
        </div>

        {showComments && (
          <div
            className="comments-menu rounded-t-xl bg-white bg-clip-padding backdrop-filter backdrop-blur-3xl bg-opacity-20 shadow-2xl border-1 border-black w-full  z-10  overflow-y-auto "
            style={{
              width: "100%",
              height: "60vh",
              position: "absolute",
              bottom: 0,
              left: 0,
              transition: "height 0.5s",
            }}
          >
            <div className="lp w-full flex justify-center">
              <button className="my-3" onClick={() => setShowComments(false)}>
                ⬇️
              </button>
            </div>
            <div
              className="comments-list p-4 overflow-y-auto"
              style={{ height: "50vh" }}
            >
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
                                  <p className="-mt-2 mb-2">{reply.content}</p>
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
                            className="ml-5 btn px-10"
                            // onClick={handleCommentSubmit}
                            onClick={() => {
                              handleReplySubmit(comment);
                            }}
                          >
                            Reply
                          </button>
                          <button
                            className="btn ml-5 px-10"
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
            <div className="comment-section flex sticky bottom-0 p-4">
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

              <button className="ml-5 btn px-10" onClick={handleCommentSubmit}>
                Comment
              </button>
            </div>
          </div>
        )}
      </div>
      <Toaster />
    </div>
  );
};
export default Reel;
