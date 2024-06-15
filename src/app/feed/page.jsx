"use client";
import app from "@/lib/firebase/firebaseConfig";
import React, { use, useContext, useEffect, useState } from "react";
import {
  deleteUser,
  getAuth,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
const CreatePost = dynamic(() => import("@/components/Createpost"), {
  ssr: false,
});
const CreateReel = dynamic(() => import("@/components/CreateReel"), {
  ssr: false,
});
import { useRouter } from "next/navigation";
import "../styles/gradients.css";
import "../styles/feed.css";
import {
  collection,
  getDocs,
  limit,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { updateThemeColor } from "@/externalfn/updateThemeColour";
import Image from "next/image";
import { getFirestore, getDoc, doc } from "firebase/firestore";
import { useSidebarStore } from "../store/zustand";
import dynamic from "next/dynamic";
import FeedPost from "@/components/FeedPost";
import SparklesText from "@/components/SparkleText";
const MainLoading = dynamic(() => import("@/components/MainLoading"));
const ShareMenu = dynamic(() => import("@/components/ShareMenu"));
const PostComment = dynamic(() => import("@/components/PostComment"));
const TaggedUser = dynamic(() => import("@/components/TaggedUser"));
const Home = () => {
  const auth = getAuth(app);
  const [user, setUser] = useState(auth.currentUser);
  const [createpostmenu, setcreatepostmenu] = useState(false);
  const [createreelopen, setcreatereelopen] = useState(false);
  const router = useRouter();
  const [userdata, setUserData] = useState(null);
  const db = getFirestore(app);
  const [posts, setPosts] = useState([]);
  const [postloading, setPostLoading] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [searchtext, setSearchtext] = useState("");
  const [sharemenu, setSharemenu] = useState(false);
  const [taggedusermenu, setTaggedusermenu] = useState(false);
  const [sharepostdata, setSharepostdata] = useState(null);
  const [commentpostdata, setCommentpostdata] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const {
    isOpen,
    toggle,
    initialLoad,
    toggleload,
    usermetadata,
    unread,
    enqueueUserMetadata,
  } = useSidebarStore();
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
    updateThemeColor();
  }, []);
  async function fetchData() {
    const idToken = await gettoken();
    if (idToken) {
      try {
        const response = await fetch("/api/feed", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
            email: user.email,
          },
        });
        const userData = await response.json();
        setPosts(userData.posts);
        console.log(userData);
        userData.posts.map((post) => {
          enqueueUserMetadata(post.uid);
          console.log(post.timestamp, "timestamp");
        });
        setPostLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
  }
  useEffect(() => {
    fetchData();
  }, [user]);
  const searchUsers = async () => {
    try {
      console.log("Searching users..." + searchtext);

      // Query for userName
      const userNameQuery = query(
        collection(db, "username"),
        where("userName", ">=", searchtext),
        orderBy("userName"),
        limit(5)
      );
      const userNameSnapshot = await getDocs(userNameQuery);

      // Query for fullname
      const fullNameQuery = query(
        collection(db, "username"),
        where("fullname", ">=", searchtext),
        orderBy("fullname"),
        limit(5)
      );
      const fullNameSnapshot = await getDocs(fullNameQuery);

      // Combine results
      const results = [];
      userNameSnapshot.forEach((doc) => {
        results.push({ ...doc.data() });
      });
      fullNameSnapshot.forEach((doc) => {
        const data = doc.data();
        if (!results.some((result) => result.userName === data.userName)) {
          results.push(data);
        }
      });

      console.log("Search results:", results);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

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
  const handleCreatePost = () => {
    setcreatepostmenu(!createpostmenu);
  };
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
  }, [auth, router]);
  useEffect(() => {
    if (searchtext.length > 0) {
      searchUsers();
    } else {
      setSearchResults([]);
    }
  }, [searchtext]);
  useEffect(() => {
    if (!postloading) {
      toggleload();
    }
  }, [postloading]);
  return (
    <div className=" lg:ml-5 w-full h-full">
      {sharemenu && (
        <ShareMenu
          userdata={userdata}
          postdata={sharepostdata}
          usermetadata={usermetadata}
          enqueueUserMetadata={enqueueUserMetadata}
          userName={usermetadata[sharepostdata?.uid]?.userName}
          setSharemenu={setSharemenu}
        />
      )}
      {taggedusermenu && (
        <TaggedUser
          postdata={commentpostdata}
          usermetadata={usermetadata}
          enqueueUserMetadata={enqueueUserMetadata}
          close={() => setTaggedusermenu(false)}
        />
      )}
      {createpostmenu && (
        <CreatePost
          onClose={() => setcreatepostmenu(!createpostmenu)}
          userdata={userdata}
          usermetadata={usermetadata}
          enqueueUserMetadata={enqueueUserMetadata}
        />
      )}
      {createreelopen && (
        <CreateReel
          onClose={() => setcreatereelopen(!createreelopen)}
          userdata={userdata}
          usermetadata={usermetadata}
          enqueueUserMetadata={enqueueUserMetadata}
        />
      )}
      {showComments && (
        <div className="">
          <PostComment
            postdata={commentpostdata}
            userdata={userdata}
            db={db}
            uid={userdata.uid}
            usermetadata={usermetadata}
            enqueueUserMetadata={enqueueUserMetadata}
            setShowComments={setShowComments}
          />
        </div>
      )}
      {postloading && initialLoad && <MainLoading />}
      {postloading && !initialLoad && (
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
                <div className="de font-lucy mt-24 md-text-3xl">
                  🌟 Loading your universe of endless updates... 💬
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {userdata && !postloading && (
        <div>
          <div className="main2 md:rounded-2xl bg-white dark:bg-black md:bg-clip-padding md:backdrop-filter md:backdrop-blur-3xl md:bg-opacity-20 shadow-2xl border-1 border-black h-full overflow-y-auto">
            <div className="flex justify-between pt-3 px-2 pb-3 bg-white rounded-b-3xl dark:bg-feedheader shadow-xl shadow-fuchsia-200 dark:shadow-none  sticky top-0 z-20 ">
              <h1 class="bg-gradient-to-r from-purple-500 via-fuchsia-400 to-pink-400 text-4xl font-lucy inline-block text-transparent bg-clip-text">
                Muse
              </h1>
              <div className="sd flex ">
                <Image
                  src="/icons/plus.png"
                  height={100}
                  width={100}
                  className="  w-8 h-8 mt-1 mr-4"
                  alt="Create Post"
                  onClick={handleCreatePost}
                />
                <Image
                  src="/icons/reel.png"
                  height={100}
                  width={100}
                  className="  w-7 h-7 mt-1.5 mr-4"
                  alt="Create Post"
                  onClick={() => setcreatereelopen(!createreelopen)}
                />
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
            {postloading && (
              <div className="flex justify-center ">
                Loading Feed..............
              </div>
            )}
            <div className="pol font-rethink ">
              <div className="feed w-full h-full overflow-y-auto">
                <div className="buf h-5 bg-white dark:bg-black"></div>
                {posts && posts.length > 0 ? (
                  posts.map((post) => (
                    <FeedPost
                      key={post.id}
                      post={post}
                      userdata={userdata}
                      setSharemenu={setSharemenu}
                      setSharepostdata={setSharepostdata}
                      enqueueUserMetadata={enqueueUserMetadata}
                      usermetadata={usermetadata}
                      setTaggedusermenu={setTaggedusermenu}
                      db={db}
                      showComments={showComments}
                      setCommentpostdata={setCommentpostdata}
                      setShowComments={setShowComments}
                    />
                  ))
                ) : (
                  <div className="flex justify-center items-center h-96 w-full text-3xl font-bold">
                    No posts to show
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
