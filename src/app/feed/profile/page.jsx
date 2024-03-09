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
import { Toaster } from "react-hot-toast";
import "../../styles/gradients.css";
import "../../styles/feed.css";
import "../../styles/slug.css";
import SideBar from "@/components/SideBar";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";
import Link from "next/link";
import { get } from "http";
const FeedPost = dynamic(() => import("@/components/FeedPost"), { ssr: false });
const Page = ({ params }) => {
  const { slug } = params;
  const router = useRouter();
  const searchParams = useSearchParams();
  const postno = searchParams.get("postno") || -1;
  console.log(postno);
  const [searchtext, setSearchtext] = React.useState("");
  const [userdata, setUserData] = React.useState(null);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [currentuserdata, setCurrentUserData] = React.useState(null);
  const checkfollow = () => {
    if (
      userdata &&
      currentuserdata &&
      userdata.followers.includes(currentuserdata.uid)
    ) {
      console.log("checkfollow running..." + true);
      return true;
    } else return false;
  };
  const [follow, setFollow] = React.useState(false);
  useEffect(() => {
    if (userdata && currentuserdata) {
      const q = checkfollow();
      setFollow(q);
    }
  }, [userdata, currentuserdata]);
  const auth = getAuth(app);
  const user = auth.currentUser;
  const db = getFirestore(app);
  const [showPost, setShowPost] = React.useState(false);
  useEffect(() => {
    if (postno > -1) setShowPost(true);
  }, [postno]);
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
    if (docSnap.docs[0].exists()) {
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
    setFollow((prevFollow) => !prevFollow); // Update follow state using the functional form
    try {
      const userRef = doc(db, "users", userdata.email);
      const currentuserRef = doc(db, "users", user.email);

      const f = !follow; // Calculate f based on the previous state

      if (f) {
        console.log("adding follow");
        await updateDoc(userRef, {
          followers: arrayUnion(currentuserdata.userName),
          followerscount: increment(1),
        });
        await updateDoc(currentuserRef, {
          following: arrayUnion(userdata.userName),
          followingcount: increment(1),
        });
      } else {
        console.log("removing follow");
        await updateDoc(userRef, {
          followers: arrayRemove(currentuserdata.userName),
          followerscount: increment(-1),
        });
        await updateDoc(currentuserRef, {
          following: arrayRemove(userdata.userName),
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
    router.push(`/${userdata.userName}`);
  };
  return (
    <div className="h-screen w-screen flex absolute dark:text-white p-4">
      {/* <div className="lp "> */}
      <SideBar
        usage={"slug"}
        data={userdata}
        currentuserdata={currentuserdata}
      />
      {/* </div> */}
      <Toaster />
      {postno > -1 && showPost && (
        <FeedPost
          userdata={userdata}
          post={posts[postno]}
          onClose={onclose}
          currentuserdata={currentuserdata}
        />
      )}
      {userdata && (
        <div className="main2 w-full rounded-2xl bg-white bg-clip-padding backdrop-filter backdrop-blur-3xl overflow-y-auto bg-opacity-20 shadow-2xl border-1 border-black h-auto ml-6">
          <div className="w-full ">
            <div className="flex justify-between sticky top-0 bg-opacity-20 bg-white backdrop-filter backdrop-blur  border-1 border-black border-opacity-20 rounded-xl shadow-lg z-20 b">
              <div className="heading m-4 font-lucy text-6xl">Posts</div>
              <input
                className="w-96 mt-5 ml-5 h-12 text-2xl p-2 placeholder-italic rounded-2xl bg-gray-300 border-black transition-all duration-300  mr-6 outline-none shadow-2xl hover:shadow-3xl focus:shadow-3xl hover:bg-gray-400 focus:bg-gray-400"
                type="text"
                value={searchtext}
                onChange={(e) => setSearchtext(e.target.value)}
                placeholder="Search"
              />
            </div>
            <div className="posts  w-full overflow-y-auto">
              <div className="h-full w-full  ">
                {posts.length === 0 && (
                  <div className="text-2xl m-4 flex justify-center w-full h-full align-middle text-middle">
                    No Posts Yet
                  </div>
                )}
                <ResponsiveMasonry
                  columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}
                >
                  <Masonry>
                    {posts &&
                      posts.map((post, index) => (
                        <div key={index}>
                          <Link href={`/${userdata.userName}/?postno=${index}`}>
                            <div className="group m-4 p-4 rounded-xl bg-gray-300 shadow-2xl">
                              <Image
                                className="h-auto w-auto object-cover rounded-xl cursor-pointer transition-transform duration-300 transform-gpu scale-100 group-hover:scale-110"
                                src={post.mediaFiles[0]}
                                width={500}
                                height={500}
                                onClick={() => setShowPost(true)}
                                alt="Profile Picture"
                              />
                            </div>
                          </Link>
                        </div>
                      ))}
                  </Masonry>
                </ResponsiveMasonry>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
