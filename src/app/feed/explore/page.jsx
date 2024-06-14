"use client";
import React, { use } from "react";
import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import app from "@/lib/firebase/firebaseConfig";
import Image from "next/image";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { useSidebarStore } from "@/app/store/zustand";
import { onAuthStateChanged } from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
const MainLoading = dynamic(() => import("../../../components/MainLoading"));
const ProfilePost = dynamic(() => import("../../../components/ProfilePost"));
const SearchExplore = dynamic(() =>
  import("../../../components/SearchExplore")
);
const PostCommentProfile = dynamic(
  () => import("@/components/PostCommentProfile"),
  {
    ssr: false,
  }
);
import SparklesText from "@/components/SparkleText";
const ShareMenuProfile = dynamic(() => import("@/components/ShareMenuProfile"));
const TaggedUserProfile = dynamic(() =>
  import("@/components/TaggedUserProfile")
);
const Explore = () => {
  const [userdata, setUserData] = useState(null);
  const auth = getAuth(app);
  const [user, setUser] = useState(auth.currentUser);
  const router = useRouter();
  const [postid, setPostId] = useState(-1);
  const [posts, setPosts] = useState([]);
  const [reels, setReels] = useState([]);
  const [hashposts, setHashposts] = useState([]);
  const { initialLoad, toggle, toggleload } = useSidebarStore();
  const [loading, setloading] = useState(true);
  const [feed, setfeed] = useState([]);
  const [expllorepagestate, setexpllorepagestate] = useState("");
  const { usermetadata, enqueueUserMetadata, unread } = useSidebarStore();
  const [showComments, setShowComments] = React.useState(false);
  const [sharemenuopen, setSharemenuopen] = React.useState(false);
  const [searchopen, setSearchopen] = React.useState(false);
  const [taggeduseropen, setTaggeduseropen] = React.useState(false);
  const db = getFirestore(app);
  const getuserdata = async (currentUser) => {
    const userRef = doc(db, "users", currentUser.email);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      console.log("Document data:", docSnap.data());
      setUserData(docSnap.data());
    } else {
      console.log("No such document!");
      // Handle the case where user data doesn't exist
    }
  };
  async function gettoken() {
    if (user) {
      try {
        const idToken = await user.getIdToken();
        console.log(idToken);
        return idToken;
      } catch (error) {
        console.log(error);
      }
    }
    return null;
  }
  useEffect(() => {
    if (postid != "-1" && posts.length > 0) {
      const post = posts.find((post) => {
        return post.id === postid;
      });
      const uid = post.uid;
      console.log(uid);
      enqueueUserMetadata(uid);
    }
  }, [postid]);

  useEffect(() => {
    const fetchexplore = async () => {
      if (user) {
        const response = await fetch("/api/explore", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await gettoken()}`,
            email: user.email,
          },
        });
        const data = await response.json();
        if (data.status === "true") {
          data.fdata.posts.map((post) => {
            post.type = "post";
          });
          data.fdata.reels.map((reel) => {
            reel.type = "reel";
          });
          setPosts(data.fdata.posts);
          setReels(data.fdata.reels);
        }
        setloading(false);
      }
    };
    fetchexplore();
  }, [user]);
  // const
  useEffect(() => {
    if (expllorepagestate) {
      console.log(expllorepagestate + "Current  hashtags");
    }
  }, [expllorepagestate]);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        // Redirect to login screen if user is not logged in
        router.push("/login");
      } else {
        getuserdata(user);
      }
    });

    return () => unsubscribe();
  }, [auth]);
  useEffect(() => {
    console.log(posts);
    const mixedFeed = [...posts, ...reels].sort(() => Math.random() - 0.5);
    setfeed(mixedFeed);
  }, [posts]);
  useEffect(() => {
    if (!loading) {
      toggleload();
    }
  }, [loading]);
  const onclose = () => {
    setPostId(-1);
    // setShowPost(false);
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

  const fetchposts = async () => {
    if (user && expllorepagestate) {
      let postsMap = new Map();
      console.log(expllorepagestate + " Current hashtags");

      // Create an array of promises
      const promises = expllorepagestate.map(async (hashtag) => {
        const hashref = collection(db, "posts");
        const q = query(
          hashref,
          where("hashtags", "array-contains", hashtag),
          orderBy("timestamp", "desc"),
          limit(10)
        );
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          postsMap.set(doc.id, doc.data());
        });
      });

      // Wait for all promises to resolve
      await Promise.all(promises);
      setHashposts([...postsMap.values()]);
    }
  };

  useEffect(() => {
    if (hashposts) {
      console.log(hashposts + " Hashposts");
    }
  }, [hashposts]);

  useEffect(() => {
    fetchposts();
  }, [expllorepagestate]);
  return (
    <div className=" md:ml-5 w-full h-full">
      {loading && initialLoad && <MainLoading />}
      {/* {expllorepagestate} */}
      {loading && !initialLoad && (
        <>
          <div className="main2 md:rounded-2xl bg-white dark:bg-black md:bg-clip-padding md:backdrop-filter md:backdrop-blur-3xl md:bg-opacity-20 shadow-2xl border-1 border-black h-full overflow-y-auto">
            <div className="flex justify-center items-center h-full">
              <div className="edwdw ">
                {" "}
                {/* Added text-center class here */}
                <div className="sd flex justify-center">
                  <Image
                    src="/loading.gif"
                    height={150}
                    width={150}
                    alt="Loading"
                  />
                </div>
                <div className="de font-lucy mt-24 mx-10 text-center md-text-3xl">
                  🔍 Exploring the digital cosmos for your perfect match...
                  Let&apos;s uncover some gems! 💎
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {searchopen && (
        <SearchExplore
          userdata={userdata}
          db={db}
          uid={userdata.uid}
          usermetadata={usermetadata}
          enqueueUserMetadata={enqueueUserMetadata}
          close={() => setSearchopen(false)}
          setexpllorepagestate={setexpllorepagestate}
        />
      )}
      {userdata && !loading && (
        <div>
          {showComments && (
            <div className="">
              <PostCommentProfile
                postid={postid}
                userdata={userdata}
                db={db}
                uid={userdata.uid}
                usermetadata={usermetadata}
                enqueueUserMetadata={enqueueUserMetadata}
                setShowComments={setShowComments}
              />
            </div>
          )}
          {sharemenuopen && (
            <ShareMenuProfile
              userdata={userdata}
              postid={postid}
              userName={userdata.userName}
              setSharemenu={setSharemenuopen}
              usermetadata={usermetadata}
              enqueueUserMetadata={enqueueUserMetadata}
            />
          )}
          {taggeduseropen && (
            <TaggedUserProfile
              usermetadata={usermetadata}
              postid={postid}
              db={db}
              enwueueUserMetadata={enqueueUserMetadata}
              close={() => setTaggeduseropen(false)}
            />
          )}
          {postid !== -1 && posts[0] && (
            <div
              className="lop h-screen w-screen fixed top-0   z-10 bg-white dark:bg-black overflow-y-auto"
              onClick={(e) => {
                if (e.target.classList.contains("lop")) {
                  onclose();
                }
              }}
            >
              <div>
                <div className="dd mt-32">
                  <button onClick={() => setPostId(-1)}>Back</button>
                </div>
                <ProfilePost
                  db={db}
                  userdata={userdata}
                  post={posts.find((post) => {
                    return post.id === postid;
                  })}
                  onclose={() => {
                    setPostId(-1);
                    // setShowPost(false);
                  }}
                  type="explore"
                  setShowComments={setShowComments}
                  usermetadata={usermetadata}
                  setSharemenu={setSharemenuopen}
                  enqueueUserMetadata={enqueueUserMetadata}
                  currentuserdata={userdata}
                  setTaggeduseropen={setTaggeduseropen}
                />
                {hashposts.length > 0 &&
                  hashposts.map((post, index) => (
                    <div className="mb-10" key={index}>
                      {post.id !== postid && (
                        <ProfilePost
                          db={db}
                          userdata={userdata}
                          post={post}
                          onclose={() => {
                            setPostId(-1);
                            // setShowPost(false);
                          }}
                          type="explore"
                          setShowComments={setShowComments}
                          usermetadata={usermetadata}
                          setSharemenu={setSharemenuopen}
                          enqueueUserMetadata={enqueueUserMetadata}
                          currentuserdata={userdata}
                          setTaggeduseropen={setTaggeduseropen}
                        />
                      )}
                    </div>
                  ))}
                <div className="h-32 "></div>
              </div>
            </div>
          )}
          <div className="main2 md:rounded-2xl dark:bg-black bg-white md:bg-clip-padding md:backdrop-filter md:backdrop-blur-3xl md:bg-opacity-20 shadow-2xl border-1 border-black md:p-10 overflow-y-auto">
            <div className="flex justify-between pt-3 px-2 pb-4 bg-white rounded-b-3xl dark:bg-feedheader shadow-xl  dark:shadow-none  sticky top-0 z-20 ">
              <h1 class="bg-gradient-to-r from-purple-500 via-fuchsia-400 to-pink-400 text-4xl inline-block text-transparent bg-clip-text">
                Explore
              </h1>
              <div className="s mt-2">
                <button
                  onClick={() => {
                    setSearchopen((prev) => !prev);
                  }}
                >
                  <Image
                    src="/icons/search.png"
                    height={50}
                    width={50}
                    className=" dark:invert w-7 h-7 mr-4"
                    alt="Search"
                  />
                </button>

                <button onClick={toggle}>
                  <Image
                    src="/icons/sidebar.png"
                    height={50}
                    width={50}
                    className="  w-7 h-7 mr-4"
                    alt="Sidebar"
                  />
                  <span className="absolute top-3 right-5 bg-red-500 text-white rounded-full px-1 text-xs">
                    {unread}
                  </span>
                </button>
              </div>
            </div>
            <ResponsiveMasonry columnsCountBreakPoints={{ 350: 3 }}>
              <Masonry>
                {feed.map((post) => (
                  <div key={post.id} className="m-0.5 md:m-2">
                    {post.type == "post" ? (
                      <div className="">
                        {!isVideoFile(post.mediaFiles[0]) ? (
                          <Image
                            onClick={() => {
                              setPostId(post.id);
                              // console.log(post.hashtags+"Hashtags");
                              setexpllorepagestate(post.hashtags);
                            }}
                            src={post.mediaFiles[0]}
                            alt=""
                            width={300}
                            height={300}
                            className="md:rounded-3xl rounded-xl w-full"
                          />
                        ) : (
                          <Image
                            onClick={() => {
                              setPostId(post.id);
                              // console.log(post.hashtags+"Hashtags");
                              setexpllorepagestate(post.hashtags);
                            }}
                            src="/thumbnail.png"
                            alt=""
                            width={300}
                            height={300}
                            className="md:rounded-3xl rounded-xl w-full"
                          />
                        )}
                      </div>
                    ) : (
                      <div
                        onClick={() => {
                          router.push(`/feed/reels?reelid=${post.id}`);
                        }}
                      >
                        {post.thumbnail ? (
                          <Image
                            src={post.thumbnail}
                            alt=""
                            width={300}
                            height={300}
                            className="md:rounded-2xl rounded-lg w-full"
                          />
                        ) : (
                          <>
                            <Image
                              src="/thumbnail.png"
                              alt=""
                              width={300}
                              height={300}
                              className="md:rounded-2xl rounded-lg w-full"
                            />{" "}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </Masonry>
            </ResponsiveMasonry>
          </div>
        </div>
      )}
    </div>
  );
};

export default Explore;
