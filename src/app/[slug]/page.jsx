"use client";
import { getAuth, signOut } from "firebase/auth";
import React, { useEffect } from "react";
import app from "@/lib/firebase/firebaseConfig";
import { getFirestore } from "firebase/firestore";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { arrayUnion, arrayRemove } from "firebase/firestore";
import { increment } from "firebase/firestore";
// import { get } from "http";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";
import Link from "next/link";
const FeedPost = dynamic(() => import("@/components/FeedPost"), { ssr: false });
const Page = ({ params }) => {
  const { slug } = params;
  const router = useRouter();
  const searchParams = useSearchParams();
  const postno = searchParams.get("postno") || -1;
  console.log(postno);
  const [userdata, setUserData] = React.useState(null);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [currentuserdata, setCurrentUserData] = React.useState(null);
  const checkfollow = () => {
    if (
      userdata &&
      currentuserdata &&
      userdata.followers.includes(currentuserdata.userName)
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
    if (posts.length == userdata.postcount) return;
    for (let i = 0; i < userdata.posts.length; i++) {
      const postRef = doc(db, "posts", userdata.posts[i]);
      const docSnap = await getDoc(postRef);
      if (docSnap.exists()) {
        // console.log("Document data:", docSnap.data());
        setPosts((posts) => [...posts, docSnap.data()]);
      } else {
        console.log("No such document!");
        // Handle the case where user data doesn't exist
      }
      // console.log(docSnap.data());
    }
   
  };
  // console.log(user);
  const emaillookup = async () => {
    const userRef = doc(db, "username", slug);
    const docSnap = await getDoc(userRef);
    console.log("emaillookup running...");
    if (docSnap.exists()) {
      console.log("Document data:", docSnap.data());
      return docSnap.data().email;
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
        console.log("Document data:", docSnap.data());
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
        userdata.followers.includes(currentuserdata.userName) ||
        currentuserdata.email === user.email)
    ) {
      console.log("getposts running...");
      getposts();
    }
  }, [user, userdata, currentuserdata]);

  const DropdownMenu = ({ onLogout, onSettings }) => {
    return (
      <div className="absolute right-0 mt-16 w-48 bg-white border rounded-md overflow-hidden shadow-md z-10">
        <button
          className="block text-center w-full px-4 py-2  text-sm text-gray-700 hover:bg-gray-100"
          onClick={() => {
            router.push(`/${currentuserdata.userName}`);
          }}
        >
          My Profile
        </button>
        <button
          className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
          onClick={onLogout}
        >
          Logout
        </button>
        <button
          className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
          onClick={onSettings}
        >
          Settings
        </button>
      </div>
    );
  };
  const handleLogout = async () => {
    try {
      console.log("logout");
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Sign-out error:", error.message);
    }
  };
  const handleSettings = () => {
    // Handle settings action
    router.push("/settings");
    console.log("Navigate to settings or perform other settings action");
    // You can navigate to a settings page or show a modal, etc.
  };
  const handleProfileClick = () => {
    setShowDropdown(!showDropdown);
  };
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

  return (
    <div className="h-screen font-rethink relative text-black bg-white dark:bg-black dark:text-white">
      <div className="flex justify-between">
        <Link href="/">
          <div className="kl font-lucy text-6xl">Muse</div>
        </Link>
        <div className="io flex">
          <div onClick={handleProfileClick} className="lk">
            {currentuserdata ? (
              <Image
                className="rounded-full h-16 w-16 object-cover cursor-pointer"
                src={currentuserdata.pfp}
                width={100}
                height={100}
                alt="Profile Picture"
              />
            ) : (
              "Loading Image"
            )}
          </div>
          {showDropdown && (
            <DropdownMenu onLogout={handleLogout} onSettings={handleSettings} />
          )}
        </div>
      </div>
      <div className="contetn">
        <div className="heading">
          {userdata ? (
            <div className="flex justify-center">
              <Image
                className="rounded-full h-16 w-16 object-cover cursor-pointer"
                src={userdata.pfp}
                width={100}
                height={100}
                alt="Profile Picture"
              />
              <div className="fff">
                <div className="text -mt-1 font-bold text-xl  ">{userdata.userName}</div>
                <div className="ed">{userdata.bio}</div>
                {userdata.email != user.email ? (
                  <button
                    className="bg-blue-600"
                    onClick={() => handlefollow()}
                  >
                    {follow ? "Following" : "Follow"}
                  </button>
                ) : null}
              </div>
              <div className="followers mr-2">
                <div className="followers">
                  {userdata.followerscount} Followers
                </div>
              </div>
              <div className="following mr-2">
                <div className="following">
                  {userdata.followingcount} Following
                </div>
              </div>
              <div className="posts">
                <div className="posts">{userdata.postcount} Posts</div>
              </div>
            </div>
          ) : null}
        </div>
        <div className="flex justify-center">
          {userdata ? (
            <>
              {posts.map((post, index) => (
                <div key={index} className="flex">
                  <Link href={`/${userdata.userName}/?postno=${index}`}>
                    <Image
                      className="h-16 w-16 object-cover cursor-pointer"
                      src={post.mediaFiles[0]}
                      width={100}
                      height={100}
                      onClick={() => {
                        setShowPost(true);
                      }}
                      alt="Profile Picture"
                    />
                  </Link>
                </div>
              ))}
            </>
          ) : null}
        </div>
      </div>
      {userdata && showPost ? (
        <FeedPost
          post={posts[postno]}
          userdata={userdata}
          currentuserdata={currentuserdata}
          onClose={() => {
            setShowPost(false);
            router.push(`/${userdata.userName}`);
          }}
        />
      ) : null}
    </div>
  );
};

export default Page;
