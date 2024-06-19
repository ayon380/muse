"use client";
import { getAuth, signOut } from "firebase/auth";
import React, { useEffect } from "react";
import app from "@/lib/firebase/firebaseConfig";
import { collection, getFirestore, query } from "firebase/firestore";
import { doc, getDoc, getDocs, updateDoc, where } from "firebase/firestore";
import { arrayUnion, arrayRemove } from "firebase/firestore";
import { increment } from "firebase/firestore";
// import { get } from "http";
import toast, { Toaster } from "react-hot-toast";
import "../../../styles/feed.css";
import "../../../styles/slug.css";
import { useSidebarStore } from "@/app/store/zustand";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";
const ProfilePost = dynamic(() => import("@/components/ProfilePost"), {
  ssr: false,
});
const PostCommentProfile = dynamic(
  () => import("@/components/PostCommentProfile"),
  {
    ssr: false,
  }
);
const ShareMenuProfile = dynamic(() => import("@/components/ShareMenuProfile"));
const Follower = dynamic(() => import("@/components/Follower"), { ssr: false });
const TaggedUserProfile = dynamic(() =>
  import("@/components/TaggedUserProfile")
);
const Following = dynamic(() => import("@/components/Follwing"));
const Page = ({ params }) => {
  const { slug } = params;
  const router = useRouter();
  const searchParams = useSearchParams();
  const postid = searchParams.get("postid") || -1;
  console.log(slug);
  const [searchtext, setSearchtext] = React.useState("");
  const [userdata, setUserData] = React.useState(null);
  const [taggeduseropen, setTaggeduseropen] = React.useState(false);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [currentuserdata, setCurrentUserData] = React.useState(null);
  const [reels, setReels] = React.useState([]);
  const [restrict, setRestrict] = React.useState(false);
  const [userdataloading, setUserDataLoading] = React.useState(true);
  const [pagestate, setPageState] = React.useState(0);
  const [restrictchecking, setRestrictChecking] = React.useState(true);
  const [showComments, setShowComments] = React.useState(false);
  const [taggedPosts, setTaggedPosts] = React.useState([]);
  const [savedPosts, setSavedPosts] = React.useState([]);
  const [globalrestrict, setGlobalRestrict] = React.useState(false);
  const [followersbox, setFollowersbox] = React.useState();
  const [followingbox, setfollowingbox] = React.useState();
  const [sharemenuopen, setSharemenuopen] = React.useState(false);
  const { usermetadata, enqueueUserMetadata, initialLoad, toggleload } =
    useSidebarStore();
  const checkfollow = () => {
    console.log(userdata.followers);
    console.log(currentuserdata.uid);
    if (
      userdata &&
      currentuserdata &&
      userdata.followers.includes(currentuserdata.uid)
    ) {
      console.log("checkfollow running..." + true);
      return true;
    } else return false;
  };
  const checkrestrict = () => {
    console.log(userdata.blocked);
    console.log(currentuserdata.uid);
    if (
      userdata &&
      currentuserdata &&
      currentuserdata.blocked.includes(userdata.uid)
    ) {
      console.log("checkrestrict running..." + true);
      return true;
    } else return false;
  };

  const getReels = async () => {
    if (!userdata) return;
    console.log("getreels running...");
    let temp = [];
    for (let i = 0; i < userdata.reels.length; i++) {
      const postRef = doc(db, "reels", userdata.reels[i]);
      const docSnap = await getDoc(postRef);
      if (docSnap.exists()) {
        // console.log("Document data:", docSnap.data());
        temp.push(docSnap.data());
      } else {
        console.log("No such document!");
        // Handle the case where user data doesn't exist
      }
      // console.log(docSnap.data());
      // console.log(docSnap.data());
      console.log(temp);
    }
    setReels(temp);
  };
  useEffect(() => {
    if (userdata && pagestate == 1) getReels();
  }, [pagestate]);

  const [follow, setFollow] = React.useState(false);
  useEffect(() => {
    if (userdata && currentuserdata) {
      const q = checkfollow();
      const r = checkrestrict();
      setRestrict(r);
      setFollow(q);
      setRestrictChecking(false);
    }
  }, [userdata, currentuserdata]);

  const auth = getAuth(app);
  const user = auth.currentUser;
  const db = getFirestore(app);
  const [showPost, setShowPost] = React.useState(false);
  useEffect(() => {
    if (postid != -1) setShowPost(true);
  }, [postid]);
  const [posts, setPosts] = React.useState([]);
  const getposts = async () => {
    if (!userdata) return;
    console.log("getposts running...");
    let temp = [];
    for (let i = 0; i < userdata.posts.length; i++) {
      const postRef = doc(db, "posts", userdata.posts[i]);
      const docSnap = await getDoc(postRef);
      if (docSnap.exists()) {
        // console.log("Document data:", docSnap.data());

        temp.push(docSnap.data());
      } else {
        console.log("No such document!");
        // Handle the case where user data doesn't exist
      }
      // console.log(docSnap.data());
      // console.log(docSnap.data());
      console.log(temp);
    }
    setPosts(temp);
    toggleload();
  };
  // console.log(user);
  const emaillookup = async () => {
    const userRef = collection(db, "username");
    const q = query(userRef, where("userName", "==", slug));
    const docSnap = await getDocs(q);
    console.log("emaillookup running...");
    if (docSnap.docs[0]) {
      // console.log("Document data:", docSnap.data());
      return docSnap.docs[0].data().email;
    } else {
      console.log("No such document!");
      // Handle the case where user data doesn't exist
    }
  };
  const getuserdata = async (email, num) => {
    try {
      const userRef = doc(db, "users", email);
      const docSnap = await getDoc(userRef);
      console.log("getuserdata running...");
      if (docSnap.exists()) {
        // console.log("Document data:", docSnap.data());
        if (num == 1) {
          setUserData(docSnap.data());
          enqueueUserMetadata(docSnap.data().uid);
        } else setCurrentUserData(docSnap.data());
      } else {
        console.log("No such document!");
        // Handle the case where user data doesn't exist
      }
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    const fun = async () => {
      const em = await emaillookup();
      console.log(em);
      getuserdata(em, 1);
      if (user) getuserdata(user.email, 2);
      setUserDataLoading(false);
    };
    fun();
  }, [user, follow]);

  useEffect(() => {
    if (
      userdata &&
      currentuserdata &&
      (userdata.pubpriv !== "Private" ||
        userdata.followers.includes(currentuserdata.uid) ||
        currentuserdata.email === user.email)
    ) {
      console.log("getposts running...");
      getposts();
    }
  }, [user, userdata, currentuserdata]);

  const handlefollow = async () => {
    const q = follow;
    setFollow(!follow); // Update follow state using the functional form
    try {
      const userRef = doc(db, "users", userdata.email);
      const currentuserRef = doc(db, "users", user.email);
      const user1ref = doc(db, "username", userdata.uid);
      const f = !q; // Calculate f based on the previous state

      if (f) {
        console.log("adding follow");
        await updateDoc(userRef, {
          followers: arrayUnion(currentuserdata.uid),
          followerscount: increment(1),
        });
        await updateDoc(user1ref, {
          score: increment(5),
        });
        await updateDoc(currentuserRef, {
          following: arrayUnion(userdata.uid),
          followingcount: increment(1),
        });
      } else {
        console.log("removing follow");
        await updateDoc(userRef, {
          followers: arrayRemove(currentuserdata.uid),
          followerscount: increment(-1),
        });
        await updateDoc(currentuserRef, {
          following: arrayRemove(userdata.uid),
          followingcount: increment(-1),
        });
      }
    } catch (error) {
      console.error("Error updating follow status:", error);
      // Handle error appropriately, e.g., show error message to the user
    }
  };
  const onclose = () => {
    setShowPost(false);
    getposts();
    router.push(`/feed/profile/${userdata.userName}`);
  };
  const handleRestrict = async () => {
    // const userref = doc(db, "users", userdata.email);
    setRestrict(!restrict);
    const currentuserref = doc(db, "users", user.email);
    if (currentuserdata.blocked.includes(userdata.uid)) {
      await updateDoc(currentuserref, {
        blocked: arrayRemove(userdata.uid),
      });
      toast.success(`${userdata.userName} Unrestricted`);
    } else {
      await updateDoc(currentuserref, {
        blocked: arrayUnion(userdata.uid),
      });
      toast.success(`${userdata.userName} Restricted`);
      return;
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
  const getTaggedPosts = async () => {
    if (!userdata) return;
    console.log("getTaggedPosts running...");
    let temp = [];
    for (let i = 0; i < userdata.taggedPosts.length; i++) {
      const postRef = doc(db, "posts", userdata.taggedPosts[i]);
      const docSnap = await getDoc(postRef);
      if (docSnap.exists()) {
        // console.log("Document data:", docSnap.data());

        temp.push(docSnap.data());
      } else {
        console.log("No such document!");
        // Handle the case where user data doesn't exist
      }
      // console.log(docSnap.data());
      // console.log(docSnap.data());
      console.log(temp);
    }
    setTaggedPosts(temp);
  };
  const getSavedPosts = async () => {
    if (!userdata) return;
    console.log("getSavedPosts running...");
    let temp = [];
    for (let i = 0; i < userdata.savedposts.length; i++) {
      const postRef = doc(db, "posts", userdata.savedposts[i]);
      const docSnap = await getDoc(postRef);
      if (docSnap.exists()) {
        // console.log("Document data:", docSnap.data());

        temp.push(docSnap.data());
      } else {
        console.log("No such document!");
        // Handle the case where user data doesn't exist
      }
      // console.log(docSnap.data());
      // console.log(docSnap.data());
      console.log(temp);
    }
    setSavedPosts(temp);
  };
  const checkbothfollow = () => {
    if (
      userdata &&
      currentuserdata &&
      userdata.followers.includes(currentuserdata.uid) &&
      currentuserdata.followers.includes(userdata.uid)
    ) {
      return true;
    } else return false;
  };
  const handlestartchat = async () => {
    router.push(`/feed/messages?chatwindow=${userdata.uid}`);
  };
  function formatFirebaseTimestamp(timestamp) {
    const { seconds, nanoseconds } = timestamp;

    // Convert the seconds and nanoseconds to milliseconds
    const milliseconds = seconds * 1000 + nanoseconds / 1000000;

    // Create a new Date object using the milliseconds
    const date = new Date(milliseconds);

    // Format the date into a readable string for social media posts
    const options = {
      month: "short",
      day: "numeric",
      year: "numeric",
    };
    const readableDate = date.toLocaleString("en-US", options);

    return readableDate;
  }
  return (
    <div className=" w-full h-full">
      <Toaster />
      {userdata &&
      currentuserdata &&
      !restrictchecking &&
      userdata.blocked.includes(currentuserdata.uid) ? (
        <div className="main2 grid md:rounded-2xl bg-white z-50  md:bg-clip-padding md:backdrop-filter md:backdrop-blur-3xl md:bg-opacity-20 shadow-2xl border-1 p-2 App  border-black w-full h-full">
          RESTRICTED
        </div>
      ) : (
        <>
          {followersbox && (
            <Follower
              db={db}
              close={() => setFollowersbox(false)}
              currentuserdata={userdata}
              usermetadata={usermetadata}
              userdata={currentuserdata}
              enqueueUserMetadata={enqueueUserMetadata}
            />
          )}
          {followingbox && (
            <Following
              close={() => setfollowingbox(false)}
              db={db}
              userdata={currentuserdata}
              currentuserdata={userdata}
              usermetadata={usermetadata}
              enqueueUserMetadata={enqueueUserMetadata}
            />
          )}
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
              userdata={currentuserdata}
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
          {postid !== -1 && showPost && posts[0] && (
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
                post={
                  pagestate === 0
                    ? posts.find((post) => post.id == postid)
                    : pagestate === 2
                    ? taggedPosts.find((post) => post.id == postid)
                    : savedPosts.find((post) => post.id == postid)
                }
                onclose={onclose}
                type="profile"
                setShowComments={setShowComments}
                usermetadata={usermetadata}
                setSharemenu={setSharemenuopen}
                enqueueUserMetadata={enqueueUserMetadata}
                currentuserdata={currentuserdata}
                setTaggeduseropen={setTaggeduseropen}
              />
            </div>
          )}
          <div className="main2 grid md:rounded-2xl bg-white dark:bg-black md:bg-clip-padding md:backdrop-filter md:backdrop-blur-3xl md:bg-opacity-20 shadow-2xl border-1 md:p-2 App  border-black w-full h-full">
            {userdataloading && (
              <div className="text-2xl m-4 flex justify-center w-full h-full align-middle text-middle">
                Loading...
              </div>
            )}
            {userdata && posts && (
              <div className="w-full overflow-y-auto scroll-smooth">
                <div className="posts h-full text-white w-full">
                  <div
                    className="header  w-full  object-center "
                    style={{
                      backgroundImage: `url(${userdata.pfp})`,
                      height: "400px",
                    }}
                  >
                    <div className="lsad backdrop-blur-lg bg-opacity-50   bg-black z-30 drop-shadow-xl h-full w-full">
                      <div className="flex justify-center">
                        <Image
                          src={userdata.pfp}
                          width={500}
                          height={500}
                          className="rounded-full mt-5 h-32 w-32   md:h-36 md:w-36 object-cover"
                          alt="Profile Picture"
                        />
                      </div>
                      <div className="text-xl mt-5 text-center md:text-3xl  font-bold">
                        @{userdata.userName}
                      </div>
                      <div className="text-center text md:text-3xl opacity-80 ">
                        {userdata.fullname}
                      </div>
                      <div className="qw opacity-80 h-10 mt-3 text-center">
                        {userdata.bio}
                      </div>
                      <div className="flex justify-center">
                        {currentuserdata &&
                          userdata &&
                          currentuserdata.userName !== userdata.userName && (
                            <>
                              <button
                                className="py-2 px-4 my-2 rounded-full bg-fuchsia-300 text-black font-semibold transition-colors duration-300 hover:bg-fuchsia-600"
                                onClick={handlefollow}
                              >
                                {follow ? "Following" : "Follow"}
                              </button>
                            </>
                          )}
                        {currentuserdata &&
                          userdata &&
                          currentuserdata.userName !== userdata.userName &&
                          checkbothfollow() && (
                            <>
                              <button
                                className="py-2 px-4 my-2 ml-2 rounded-full bg-fuchsia-300 text-black font-semibold transition-colors duration-300 hover:bg-fuchsia-600"
                                onClick={() => {
                                  handlestartchat();
                                }}
                              >
                                Message
                              </button>
                            </>
                          )}{" "}
                      </div>
                    </div>
                  </div>
                  <div className="flex dark:text-white text-black  justify-between mt-6 mx-16 md:mx-16">
                    <div
                      className="flex flex-col items-center cursor-pointer"
                      onClick={() => setfollowingbox(true)}
                    >
                      <div className=" md:text-4xl font-bold text-purple-600 bg-gradient-to-r from-purple-500 via-fuchsia-400 to-pink-400 text-3xl inline-block text-transparent bg-clip-text">
                        {userdata.following.length}
                      </div>
                      <div className="text-sm md:text-base opacity-60">
                        Following
                      </div>
                    </div>
                    <div
                      className="flex flex-col -ml-5 items-center cursor-pointer"
                      onClick={() => setFollowersbox(true)}
                    >
                      <div className="text-4xl  md:text-5xl font-bold bg-gradient-to-r from-purple-500 via-fuchsia-400 to-pink-400  inline-block text-transparent bg-clip-text">
                        {userdata.followers.length}
                      </div>
                      <div className="text-sm md:text-base opacity-60">
                        Followers
                      </div>
                    </div>
                    {/* <div className="flex flex-col items-center">
                      <div className="text-3xl md:text-4xl font-bold text-purple-600">
                        {usermetadata[userdata.uid] &&
                          usermetadata[userdata.uid].score}
                      </div>
                      <div className="text-sm md:text-base opacity-80">
                        ZScore
                      </div>
                    </div> */}
                    <div className="flex flex-col items-center">
                      <div className="text-3xl md:text-4xl font-bold text-purple-600 bg-gradient-to-r from-purple-500 via-fuchsia-400 to-pink-400  inline-block text-transparent bg-clip-text">
                        {userdata.posts.length}
                      </div>
                      <div className="text-sm md:text-base opacity-60">
                        Posts
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center my-4">
                    <div className="flex items-center  bg-gradient-to-r from-purple-400 to-pink-500 rounded-full overflow-hidden">
                      <button
                        className={`px-4 py-2 w-20 text-sm text-white transition-colors duration-300 ${
                          pagestate === 0
                            ? "bg-purple-600 hover:bg-purple-700"
                            : "hover:bg-purple-600"
                        }`}
                        onClick={() => setPageState(0)}
                      >
                        Posts
                      </button>
                      <button
                        className={`px-4 py-2 w-20 text-sm text-white transition-colors duration-300 ${
                          pagestate === 1
                            ? "bg-purple-600 hover:bg-purple-700"
                            : "hover:bg-purple-600"
                        }`}
                        onClick={() => setPageState(1)}
                      >
                        Reels
                      </button>
                      <button
                        className={`px-4 py-2 w-20 text-sm text-white transition-colors duration-300 ${
                          pagestate === 2
                            ? "bg-purple-600 hover:bg-purple-700"
                            : "hover:bg-purple-600"
                        }`}
                        onClick={() => {
                          setPageState(2);
                          getTaggedPosts();
                        }}
                      >
                        Tagged
                      </button>
                      <button
                        className={`px-4 py-2 w-20 text-sm text-white transition-colors duration-300 ${
                          pagestate === 4
                            ? "bg-purple-600 hover:bg-purple-700"
                            : "hover:bg-purple-600"
                        }`}
                        onClick={() => {
                          setPageState(4);
                          // getTaggedPosts();
                        }}
                      >
                        More
                      </button>
                      {currentuserdata &&
                        currentuserdata.email === userdata.email && (
                          <button
                            className={`px-4 py-2 text-sm text-white transition-colors duration-300 ${
                              pagestate === 3
                                ? "bg-purple-600 hover:bg-purple-700"
                                : "hover:bg-purple-600"
                            }`}
                            onClick={() => {
                              setPageState(3);
                              getSavedPosts();
                            }}
                          >
                            Saved
                          </button>
                        )}
                    </div>
                  </div>
                  <div className="postsxs w-full pb-40 ">
                    {pagestate === 0 && (
                      <>
                        {posts.length === 0 ? (
                          <div className="text-2xl m-4 flex justify-center items-center w-full h-full">
                            No Posts Yet
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 md:grid-cols-4 gap-1 p-1">
                            {posts.map((post, index) => (
                              <div
                                key={index}
                                className="relative h-52"
                                onClick={() => {
                                  router.push(
                                    `/feed/profile/${userdata.userName}?postid=${post.id}`
                                  );
                                }}
                              >
                                {isVideoFile(post.mediaFiles[0]) ? (
                                  <>
                                    <video
                                      src={post.mediaFiles[0]}
                                      className="w-full h-full object-cover rounded-md lg:rounded-lg "
                                    ></video>
                                  </>
                                ) : (
                                  <>
                                    <Image
                                      src={post.mediaFiles[0]}
                                      alt=""
                                      width={300}
                                      height={300}
                                      className="w-full rounded-md md:rounded-lg h-full object-cover"
                                    />
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                    {pagestate === 1 && (
                      <>
                        {reels.length === 0 ? (
                          <div className="text-2xl m-4 flex justify-center items-center w-full h-full">
                            No Reels Yet
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 md:grid-cols-4 gap-1 p-1">
                            {reels.map((reel, index) => (
                              <div
                                key={index}
                                onClick={() => {
                                  router.push(`/feed/reels?reelid=${reel.id}`);
                                }}
                                className="relative h-52 "
                              >
                                <Image
                                  src={
                                    reel.thumbnail
                                      ? reel.thumbnail
                                      : "/thumbnail.png"
                                  }
                                  alt={reel.caption}
                                  height={800}
                                  width={400}
                                  className="object-cover w-full h-full rounded-md md:rounded-lg"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                    {pagestate === 2 && (
                      <div className="text-2xl m-4 flex justify-center items-center w-full h-full">
                        {taggedPosts.length > 0 ? (
                          <div className="grid grid-cols-3 md:grid-cols-4 gap-4 p-4">
                            {taggedPosts.map((post, index) => (
                              <div
                                key={index}
                                className="relative h-full"
                                onClick={() => {
                                  router.push(
                                    `/feed/profile/${userdata.userName}?postid=${post.id}`
                                  );
                                }}
                              >
                                {isVideoFile(post.mediaFiles[0]) ? (
                                  <>
                                    <video
                                      src={post.mediaFiles[0]}
                                      className="w-full h-full object-cover rounded-md lg:rounded-lg "
                                    ></video>
                                  </>
                                ) : (
                                  <>
                                    <Image
                                      src={post.mediaFiles[0]}
                                      alt=""
                                      width={100}
                                      height={100}
                                      className="w-full rounded-md md:rounded-lg h-full object-cover"
                                    />
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-2xl m-4 flex justify-center items-center w-full h-full">
                            No Tagged Posts Yet
                          </div>
                        )}
                      </div>
                    )}
                    {pagestate === 3 && (
                      <div className="text-2xl m-4 flex justify-center w-full h-full">
                        {savedPosts.length > 0 ? (
                          <div className="grid grid-cols-3 md:grid-cols-4 gap-4 p-4">
                            {savedPosts.map((post, index) => (
                              <div
                                key={index}
                                className="relative h-full"
                                onClick={() => {
                                  router.push(
                                    `/feed/profile/${userdata.userName}?postid=${post.id}`
                                  );
                                }}
                              >
                                {isVideoFile(post.mediaFiles[0]) ? (
                                  <>
                                    <video
                                      src={post.mediaFiles[0]}
                                      className="w-full h-full object-cover rounded-md lg:rounded-lg "
                                    ></video>
                                  </>
                                ) : (
                                  <>
                                    <Image
                                      src={post.mediaFiles[0]}
                                      alt=""
                                      width={100}
                                      height={100}
                                      className="w-full rounded-md md:rounded-lg h-36 object-cover"
                                    />
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-2xl m-4 flex justify-center items-center w-full h-full">
                            No Saved Posts Yet
                          </div>
                        )}
                      </div>
                    )}
                    {pagestate === 4 && (
                      <div className="text m-4 flex justify-center items-center w-full h-full">
                        <div className="df rounded-lg shadow-lg p-6 ">
                          {userdata && (
                            <>
                              {/* Display user's date of birth */}
                              <p className="mb-2">
                                <span className="font-semibold">
                                  Date of Birth:
                                </span>{" "}
                                {formatFirebaseTimestamp(userdata.dob)}
                              </p>

                              {/* Display user's gender */}
                              <p className="mb-2">
                                <span className="font-semibold">Gender:</span>{" "}
                                {userdata.gender}
                              </p>

                              {/* Display user's organization */}
                              <p className="mb-2">
                                <span className="font-semibold">
                                  Organization:
                                </span>{" "}
                                {userdata.org}
                              </p>

                              {/* Display user's profession */}
                              <p className="mb-2">
                                <span className="font-semibold">
                                  Profession:
                                </span>{" "}
                                {userdata.profession}
                              </p>

                              {/* Display user's public/private status */}
                              <p className="mb-2">
                                <span className="font-semibold">
                                  Public/Private:
                                </span>{" "}
                                {userdata.pubpriv}
                              </p>

                              {/* Display user's state and city (commented out) */}
                              {/* <p className="mb-2">
                              <span className="font-semibold">State:</span> {userdata.state}
                            </p>
                            <p className="mb-2">
                              <span className="font-semibold">City:</span> {userdata.city}
                            </p> */}
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {!userdata && !userdataloading && (
              <>
                <div className="text-2xl m-4 flex justify-center w-full h-full align-middle text-middle">
                  No User Found with this Username
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Page;
