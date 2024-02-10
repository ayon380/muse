"use client";
import { getAuth, signOut } from "firebase/auth";
import React, { useEffect } from "react";
import app from "@/lib/firebase/firebaseConfig";
import { getFirestore } from "firebase/firestore";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { arrayUnion, arrayRemove } from "firebase/firestore";
import { increment } from "firebase/firestore";
// import { get } from "http";
import "../styles/gradients.css";
import "../styles/feed.css";
import "../styles/slug.css"
import SideBar from "@/components/SideBar";
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
  const [searchtext, setSearchtext] = React.useState("");
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
    let temp = [];
    if (posts.length == userdata.postcount) return;
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
    }
    setPosts(temp);
  };
  // console.log(user);
  const emaillookup = async () => {
    const userRef = doc(db, "username", slug);
    const docSnap = await getDoc(userRef);
    console.log("emaillookup running...");
    if (docSnap.exists()) {
      // console.log("Document data:", docSnap.data());
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
    <div className="h-screen w-screen flex items-center font-rethink relative text-black ">
      <div className="main tndmain w-full bg-white rounded-2xl bg-clip-padding backdrop-filter backdrop-blur-2xl bg-opacity-40 shadow-2xl border-1 border-black mx-4 align-middle ">
        <div className="flex">
          <SideBar usage={"slug"} data={userdata} />
          <div className="main2 w-full">
            <div className="main2 rounded-2xl bg-opacity-50  bg-white  shadow-2xl  ">
              <div className="flex ">
                <input
                  className="w-96 mt-5 ml-5 h-12 text-2xl p-2  placeholder-italic  rounded-2xl bg-gray-300 border-black transition-all duration-300 outline-none shadow-2xl hover:shadow-3xl focus:shadow-3xl hover:bg-gray-400 focus:bg-gray-400"
                  type="text"
                  value={searchtext}
                  onChange={(e) => setSearchtext(e.target.value)}
                  placeholder="Search"
                  // Add hover and focus styles
                  style={{
                    // Initial styles
                    background: "rgba(192,192,192,0.5)", // Initial background color with opacity
                    // Hover styles
                    ":hover": {
                      transform: "scale(1.2)", // Scale up on hover
                      background: "rgba(192,192,192,0.7)", // Lighter background on hover
                    },
                    // Focus styles
                    ":focus": {
                      background: "rgba(192,192,192,0.8)", // Deeper background color when selected
                      outline: "none", // Remove outline when selected
                    },
                  }}
                />
              </div>
              <div className="posts ">
                <div className="heading m-4 font-lucy text-6xl">
                  Posts
                </div>
                <div className="flex pol h-5/6 flex-wrap overflow-y-auto">
                  {posts &&
                    posts.map((post, index) => (
                      <div key={index}>
                        <Link href={`/${userdata.userName}/?postno=${index}`}>
                          <div className="imagediv m-4 p-4 rounded-xl bg-gray-300 shadow-2xl ">
                            <Image
                              className="h-auto w-auto object-cover rounded-xl cursor-pointer"
                              src={post.mediaFiles[0]}
                              width={500}
                              height={500}
                              onClick={() => {
                                setShowPost(true);
                              }}
                              alt="Profile Picture"
                            />
                          </div>
                        </Link>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    // <div className="h-screen font-rethink relative text-black bg-white dark:bg-black dark:text-white">
    //   <div className="flex justify-between">
    //     <Link href="/">
    //       <div className="kl font-lucy text-6xl">Muse</div>
    //     </Link>
    //     <div className="io flex">
    //       <div onClick={handleProfileClick} className="lk">
    //         {currentuserdata ? (
    //           <Image
    //             className="rounded-full h-16 w-16 object-cover cursor-pointer"
    //             src={currentuserdata.pfp}
    //             width={100}
    //             height={100}
    //             alt="Profile Picture"
    //           />
    //         ) : (
    //           "Loading Image"
    //         )}
    //       </div>
    //       {showDropdown && (
    //         <DropdownMenu onLogout={handleLogout} onSettings={handleSettings} />
    //       )}
    //     </div>
    //   </div>
    //   <div className="contetn">
    //     <div className="heading">
    //       {userdata ? (
    //         <div className="flex justify-center">
    //           <Image
    //             className="rounded-full h-16 w-16 object-cover cursor-pointer"
    //             src={userdata.pfp}
    //             width={100}
    //             height={100}
    //             alt="Profile Picture"
    //           />
    //           <div className="fff">
    //             <div className="text -mt-1 font-bold text-xl  ">{userdata.userName}</div>
    //             <div className="ed">{userdata.bio}</div>
    //             {userdata.email != user.email ? (
    //               <button
    //                 className="bg-blue-600"
    //                 onClick={() => handlefollow()}
    //               >
    //                 {follow ? "Following" : "Follow"}
    //               </button>
    //             ) : null}
    //           </div>
    //           <div className="followers mr-2">
    //             <div className="followers">
    //               {userdata.followerscount} Followers
    //             </div>
    //           </div>
    //           <div className="following mr-2">
    //             <div className="following">
    //               {userdata.followingcount} Following
    //             </div>
    //           </div>
    //           <div className="posts">
    //             <div className="posts">{userdata.postcount} Posts</div>
    //           </div>
    //         </div>
    //       ) : null}
    //     </div>
    //     <div className="flex justify-center">
    //       {userdata ? (
    //         <>
    //           {posts.map((post, index) => (
    //             <div key={index} className="flex">
    //               <Link href={`/${userdata.userName}/?postno=${index}`}>
    //                 <Image
    //                   className="h-16 w-16 object-cover cursor-pointer"
    //                   src={post.mediaFiles[0]}
    //                   width={100}
    //                   height={100}
    //                   onClick={() => {
    //                     setShowPost(true);
    //                   }}
    //                   alt="Profile Picture"
    //                 />
    //               </Link>
    //             </div>
    //           ))}
    //         </>
    //       ) : null}
    //     </div>
    //   </div>
    //   {userdata && showPost ? (
    //     <FeedPost
    //       post={posts[postno]}
    //       userdata={userdata}
    //       currentuserdata={currentuserdata}
    //       onClose={() => {
    //         setShowPost(false);
    //         router.push(`/${userdata.userName}`);
    //       }}
    //     />
    //   ) : null}
    // </div>
  );
};

export default Page;
