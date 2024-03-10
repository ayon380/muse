"use client";
import { getAuth } from "firebase/auth";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import React, { useEffect } from "react";
import app from "@/lib/firebase/firebaseConfig";
import { collection, getFirestore, query } from "firebase/firestore";
import { doc, getDoc, getDocs, updateDoc, where } from "firebase/firestore";
// import { get } from "http";
import { Toaster } from "react-hot-toast";
import "../../styles/gradients.css";
import "../../styles/feed.css";
import "../../styles/slug.css";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";
import Link from "next/link";
const FeedPost = dynamic(() => import("@/components/FeedPost"), { ssr: false });
import { LayoutGrid } from "../../../components/layoutgrid";
const Page = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const postno = searchParams.get("postno") || -1;
  console.log(postno);
  const [userdata, setUserData] = React.useState(null);
  const [pagestate, setPageState] = React.useState(0);
  const [userdataloading, setUserdataloading] = React.useState(true);
  const [showPost, setShowPost] = React.useState(false);
  const [posts, setPosts] = React.useState([]);
  const auth = getAuth(app);
  const user = auth.currentUser;
  const db = getFirestore(app);
  useEffect(() => {
    if (postno > -1) setShowPost(true);
  }, [postno]);
  const getposts = async () => {
    if (!userdata) return;
    console.log("getposts running...");
    let temp = [];
    for (let i = 0; i < userdata.posts.length; i++) {
      const postRef = doc(db, "posts", userdata.posts[i]);
      const docSnap = await getDoc(postRef);
      if (docSnap.exists()) {
        temp.push(docSnap.data());
      } else {
        console.log("No such document!");
      }
      console.log(temp);
    }
    setPosts(temp);
  };
  const getuserdata = async (email) => {
    try {
      const userRef = doc(db, "users", email);
      const docSnap = await getDoc(userRef);
      console.log("getuserdata running...");
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      } else {
        console.log("No such document!");
      }
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    console.log("userdata changed");
    if (user) {
      console.log(user.email);
      getuserdata(user.email);
    }
  }, [user]);
  useEffect(() => {
    if (userdata) {
      getposts();
      console.log("posts loaded");
      setUserdataloading(false);
    }
  }, [userdata]);
  const onclose = () => {
    setShowPost(false);
    getposts();
    router.push(`/${userdata.userName}`);
  };
  return (
    <div className="ml-5 w-full h-full">
      <Toaster />
      {postno > -1 && showPost && (
        <FeedPost
          userdata={userdata}
          post={posts[postno]}
          onClose={onclose}
          currentuserdata={userdata}
        />
      )}
      <div className="main2 grid rounded-2xl bg-white bg-clip-padding backdrop-filter backdrop-blur-3xl bg-opacity-20 shadow-2xl border-1 p-2 App  border-black w-full h-full">
        {/* {userdataloading && (
          <div className="text-2xl m-4 flex justify-center w-full h-full align-middle text-middle">
            Loading...
          </div>
        )} */}
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
                        <div className="text-sm mr-6 opacity-80">Followers</div>
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
                        <div className="text-sm -ml-2 opacity-80">Posts</div>
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
                    <div>
                      {/* <ResponsiveMasonry
                      // columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}
                      >
                        <Masonry>
                          {posts &&
                            posts.map((post, index) => (
                              <div key={index}>
                                <Link
                                  href={`/feed/profile/${userdata.userName}?postno=${index}`}
                                >
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
                      </ResponsiveMasonry> */}
                      <LayoutGrid
                        data={posts}
                        userdata={userdata}
                        currentuserdata={userdata}
                      />
                    </div>
                  ))}
                {pagestate === 1 &&
                  (reels.length === 0 ? (
                    <div className="text-2xl m-4 flex justify-center w-full h-full align-middle text-middle">
                      No Reels Yet
                    </div>
                  ) : (
                    <div>
                      <ResponsiveMasonry
                      // columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}
                      >
                        <Masonry>
                          {reels &&
                            reels.map((reel, index) => (
                              <div key={index}>
                                <Link
                                  href={`/feed/profile/${userdata.userName}?postno=${index}`}
                                >
                                  <div className="group m-4 p-4 rounded-xl bg-gray-300 shadow-2xl">
                                    <video
                                      className="h-auto w-auto object-cover rounded-xl cursor-pointer transition-transform duration-300 transform-gpu scale-100 group-hover:scale-110"
                                      src={reel.mediaFiles}
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
    </div>
  );
};

export default Page;
