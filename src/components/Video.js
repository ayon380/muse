"use client";
import { useEffect, useRef, useState } from "react";
import { FaRegHeart, FaShare } from "react-icons/fa";
import { MdOutlineReportGmailerrorred } from "react-icons/md";
import { TiHeartFullOutline } from "react-icons/ti";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { collection, getDoc, query, setDoc } from "firebase/firestore";
import { CoolMode } from "./Coolmode";
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
  setSharemenu,
  usermetadata,
  setShowComments,
  enqueueUserMetadata,
  setselectedReelid,
}) => {
  const reelRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const db = getFirestore(app);
  const [reeldata, setReeldata] = useState(reel);
  const router = useRouter();
  const [liked, setLiked] = useState(false);
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
    router.push(
      `/report?username=${usermetadata[reeldata.uid].userName}&reelId=${
        reeldata.id
      }`
    );
  };
  useEffect(() => {
    handleMuteToggle();
  }, [isGlobalMuted]);
  const Shareposttt = async () => {
    setSharemenu(true);
    setselectedReelid(reeldata.id);
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
        const hashtags = reeldata.hashtags;

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

  return (
    <div
      className="text-white bg-black rounded-3xl   b"
      style={{ position: "relative" }}
    >
      <video
        className="reel snap-center rounded-3xl bg-black text-white"
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
        className="footer rounded-3xl absolute mt-10 -mb-4 pb-4 pt-20 bottom-4 w-full"
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
                router.push(
                  `/feed/profile/${usermetadata[reeldata.uid].userName}`
                )
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
                <CoolMode
                  options={{
                    size: 30,
                    particleCount: 50,
                    speedHorz: 5,
                    speedUp: 10,
                  }}
                >
                  <button>
                    {!liked ? (
                      <Image
                        src="/icons/notliked.png"
                        alt="Not Liked"
                        className="h-7 dark:invert w-7"
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
                </CoolMode>
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
                <Image
                  src="/icons/feedsend.png"
                  alt="Share"
                  className="invert h-7 w-7 mr-4"
                  height={50}
                  width={50}
                />
              </button>
              <button className="report-button" onClick={Reportposttt}>
                <MdOutlineReportGmailerrorred />
              </button>
            </div>
          </div>
          <div className="caption opacity-75">{reeldata.caption}</div>

          <button
            className="show-comments-button opacity-50"
            onClick={() => {
              setShowComments(true);
              setselectedReelid(reeldata.id);
            }}
          >
            {" "}
            {reeldata.commentcount} Comments
          </button>
        </div>

        {/* {showComments && (
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
                                        href={`/${usermetadata[reply.uid].userName
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
        )} */}
      </div>
      <Toaster />
    </div>
  );
};
export default Reel;
