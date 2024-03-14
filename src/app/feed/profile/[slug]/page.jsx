"use client";
import { getAuth, signOut } from "firebase/auth";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
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
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";
import Link from "next/link";
import Layout from "../../layout";
import { LayoutGrid } from "../../../../components/layoutgrid";
const FeedPost = dynamic(() => import("@/components/FeedPost"), { ssr: false });
const Page = ({ params }) => {
  const { slug } = params;
  const router = useRouter();
  const searchParams = useSearchParams();
  const postid = searchParams.get("postid") || -1;
  console.log(slug);
  const [searchtext, setSearchtext] = React.useState("");
  const [userdata, setUserData] = React.useState(null);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [currentuserdata, setCurrentUserData] = React.useState(null);
  const [reels, setReels] = React.useState([]);
  const [restrict, setRestrict] = React.useState(false);
  const [userdataloading, setUserDataLoading] = React.useState(true);
  const [pagestate, setPageState] = React.useState(0);
  const [restrictchecking, setRestrictChecking] = React.useState(true);
  const [globalrestrict, setGlobalRestrict] = React.useState(false);
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
        if (num == 1) setUserData(docSnap.data());
        else setCurrentUserData(docSnap.data());
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

      const f = !q; // Calculate f based on the previous state

      if (f) {
        console.log("adding follow");
        await updateDoc(userRef, {
          followers: arrayUnion(currentuserdata.uid),
          followerscount: increment(1),
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
    if (currentuserdata.blocked.includes(user.uid)) {
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
  return (
    <div className="md:ml-5 w-full h-full">
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
          {postid != -1 && showPost && (
            <FeedPost
              db={db}
              userdata={userdata}
              post={posts[postid]}
      
              currentuserdata={currentuserdata}
            />
          )}
          <div className="main2 grid rounded-2xl bg-white dark:bg-black md:bg-clip-padding md:backdrop-filter md:backdrop-blur-3xl md:bg-opacity-20 shadow-2xl border-1 p-2 App  border-black w-full h-full">
            {userdataloading && (
              <div className="text-2xl m-4 flex justify-center w-full h-full align-middle text-middle">
                Loading...
              </div>
            )}
            {userdata && (
              <div className="w-full overflow-y-auto scroll-smooth">
                <div className="posts h-full text-white w-full">
                  <div
                    className="header  w-full  rounded-xl h-1/3 object-center "
                    style={{
                      backgroundImage: `url(${userdata.pfp})`,
                    }}
                  >
                    <div className="lsad backdrop-blur-lg bg-opacity-50  rounded-xl bg-black z-30 drop-shadow-xl h-full w-full">
                      {/* <div className="s h-16"></div> */}
                      <div className="asd py-12">
                        <div className="flex justify-center w-full ">
                          <Image
                            src={userdata.pfp}
                            width={200}
                            height={200}
                            className="rounded-full h-36 w-36 object-cover"
                            alt="Profile Picture"
                          />
                          <div className="ok mx-16 mt-1">
                            <div className="text-3xl opacity-80 ">
                              {userdata.fullname}
                            </div>
                            <div className="text-3xl  font-bold">
                              @{userdata.userName}
                            </div>

                            <div className="qw opacity-90">{userdata.bio}</div>
                            {currentuserdata &&
                              userdata &&
                              currentuserdata.userName != userdata.userName && (
                                <>
                                  <button
                                    className="btn py-1 px-4 my-1"
                                    onClick={() => handlefollow()}
                                  >
                                    {follow ? "Following" : "Follow"}
                                  </button>
                                  <button
                                    className="btn ml-3 py-1 px-4 my-1"
                                    onClick={handleRestrict}
                                  >
                                    {restrict ? "Unrestrict" : "Restrict"}
                                  </button>
                                </>
                              )}
                          </div>
                          <div className="pk mt-7">
                            <div className="ojesd text-xl ">
                              {userdata.profession}
                            </div>
                            <div className="sad text-xl font-bold">
                              {userdata.org}
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between mt-3  mx-96">
                          <div className="followers text-center w-16">
                            <div className="text-4xl  font-bold">
                              {userdata.followers.length}
                            </div>
                            <div className="text-sm mr-6 opacity-80">
                              Followers
                            </div>
                          </div>
                          <div className="following text-center w-16">
                            <div className="text-4xl font-bold">
                              {userdata.following.length}
                            </div>
                            <div className="text-sm opacity-80">Following</div>
                          </div>
                          <div className="ml-6 posts">
                            <div className="text-4xl font-bold w-16">
                              {userdata.posts.length}
                            </div>
                            <div className="text-sm -ml-2 opacity-80">
                              Posts
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* <div className="absolute inset-0 h-1/2 bg-black bg-opacity-50 backdrop-blur-lg z-0"></div> */}
                    </div>
                  </div>
                  <div className="dsfs w-full flex justify-around my-3">
                    <button
                      className="btn py-2 px-3"
                      onClick={() => setPageState(0)}
                    >
                      Posts
                    </button>
                    <button
                      className="btn py-2 px-3"
                      onClick={() => setPageState(1)}
                    >
                      Reels
                    </button>
                    <button
                      className="btn py-2 px-3 "
                      onClick={() => setPageState(2)}
                    >
                      Tagged
                    </button>
                  </div>
                  <div className="postsxs w-full h-3/4 ">
                    {pagestate === 0 &&
                      (posts.length === 0 ? (
                        <div className="text-2xl m-4 flex justify-center w-full h-full align-middle text-middle">
                          No Posts Yet
                        </div>
                      ) : (
                        <div className="h-screen py-20 w-full">
                          <LayoutGrid cards={posts} type="posts" />
                        </div>
                      ))}
                    {pagestate === 1 &&
                      (reels.length === 0 ? (
                        <div className="text-2xl m-4 flex justify-center w-full h-full align-middle text-middle">
                          No Reels Yet
                        </div>
                      ) : (
                        <div>
                          <LayoutGrid cards={reels} type="reels" />
                        </div>
                      ))}
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
