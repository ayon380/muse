"use client";
import { useEffect, useRef, useState } from "react";
import { FaRegHeart, FaShare } from "react-icons/fa";
import { MdOutlineReportGmailerrorred } from "react-icons/md";
import { FaComments } from "react-icons/fa";
import { TiHeartFullOutline } from "react-icons/ti";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { collection, getDoc, setDoc } from "firebase/firestore";
import ReactPlayer from "react-player";
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

const Reel = ({ userdata, reel, isGlobalMuted }) => {
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
  const [usermetadata, setUsermetadata] = useState({});
  const handleShowComments = () => {
    setShowComments((prevState) => !prevState);
  };
  const getusermetadata = async (uid) => {
    if (usermetadata.uid === undefined) {
      const userRef = doc(db, "username", uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        setUsermetadata({ ...usermetadata, [uid]: docSnap.data() });
      }
    }
  };
  const getComments = async () => {
    // Clear the commentList state before fetching new comments
    // setCommentList([]);

    // Create a set to store unique comment IDs
    const uniqueCommentIds = new Set(reeldata.comments);
    const newCommentList = [];

    // Iterate through unique comment IDs
    for (const commentId of uniqueCommentIds) {
      const commentRef = doc(db, "comments", commentId);
      const docSnap = await getDoc(commentRef);
      if (docSnap.exists()) {
        const commentData = docSnap.data();
        await getusermetadata(commentData.uid);
        const r = formatFirebaseTimestamp(commentData.timestamp.toDate());
        commentData.timestamp = r;
        newCommentList.push(commentData);
      }
    }
    if (commentList.length !== newCommentList.length) {
      setCommentList(newCommentList);
    }
  };

  useEffect(() => {
    getComments();
  }, [showComments, reeldata]);
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
  const handleLike = async () => {
    if (userdata) {
      const postRef = doc(db, "reels", reeldata.id);
      if (liked) {
        await updateDoc(postRef, {
          likes: arrayRemove(userdata.uid),
          likecount: increment(-1),
        });
        setLiked(false);
      } else {
        await updateDoc(postRef, {
          likes: arrayUnion(userdata.uid),
          likecount: increment(1),
        });
        setLiked(true);
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
      const r= formatFirebaseTimestamp(commentData.timestamp);
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
  return (
    <div style={{ position: "relative" }}>
      <video
        className="reel snap-center"
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
        <div className="ko ">
          <div className="flex justify-between">
            <div className="lp flex ">
              <div className="btnl text-2xl" onClick={handleLike}>
                {!liked ? (
                  <FaRegHeart />
                ) : (
                  <TiHeartFullOutline style={{ color: "red" }} />
                )}
                <div />
              </div>
              <div className="likes text-xl font-bold">
                {reeldata.likecount} likes
              </div>
            </div>
            <div className="ki">
              <button className="share-button" onClick={Shareposttt}>
                <FaShare />
              </button>
              <button className="report-button" onClick={Reportposttt}>
                <MdOutlineReportGmailerrorred />
              </button>
            </div>
          </div>
          <div className="caption opacity-75">{reeldata.caption}</div>
          {reeldata.commentcount} Comments
          <button className="show-comments-button" onClick={handleShowComments}>
            <FaComments />
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
                  className="comment transition transform-gpu hover:scale-105 rounded-xl bg-gray-600 my-5 p-5 mx-5 bg-opacity-10"
                >
                  <div className="flex z-20">
                    {usermetadata[comment.uid] ? (
                      <Link href={`/${usermetadata[comment.uid].userName}`}>
                        <div className="flex">
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
                  </div>
                  <p>{comment.content}</p>
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
                Post
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
