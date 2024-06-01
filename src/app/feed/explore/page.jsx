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
import { getFirestore, doc, getDoc } from "firebase/firestore";
const MainLoading = dynamic(() => import("../../../components/MainLoading"));
const ProfilePost = dynamic(() => import("../../../components/ProfilePost"));
const PostCommentProfile = dynamic(
  () => import("@/components/PostCommentProfile"),
  {
    ssr: false,
  }
);
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
  const { initialLoad, toggleload } = useSidebarStore();
  const [loading, setloading] = useState(true);
  const [feed, setfeed] = useState([]);
  const { usermetadata, enqueueUserMetadata } = useSidebarStore();
  const [showComments, setShowComments] = React.useState(false);
  const [sharemenuopen, setSharemenuopen] = React.useState(false);
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
  return (
    <div className=" md:ml-5 w-full h-full">
      {loading && initialLoad && <MainLoading />}
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
              className="lop h-screen w-screen fixed top-0 left-0 flex justify-center items-center z-10 backdrop-filter backdrop-blur-3xl"
              onClick={(e) => {
                if (e.target.classList.contains("lop")) {
                  onclose();
                }
              }}
            >
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
            </div>
          )}
          <div className="main2 md:rounded-2xl dark:bg-black bg-white md:bg-clip-padding md:backdrop-filter md:backdrop-blur-3xl md:bg-opacity-20 shadow-2xl border-1 border-black md:p-10 overflow-y-auto">
            <div className="header flex">
              <div className="lk text-3xl  ">Explore</div>
            </div>
            {/* <div className="er">frdtrte</div> */}
            <ResponsiveMasonry columnsCountBreakPoints={{ 350: 3 }}>
              <Masonry>
                {feed.map((post) => (
                  <div key={post.id} className="m-0.5 md:m-2">
                    {post.type == "post" ? (
                      <Image
                        onClick={() => {
                          setPostId(post.id);
                        }}
                        src={post.mediaFiles[0]}
                        alt=""
                        width={300}
                        height={300}
                        className="md:rounded-2xl rounded-lg w-full"
                      />
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
