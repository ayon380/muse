"use client";
import app from "@/lib/firebase/firebaseConfig";
import React, { useEffect, useState } from "react";
import {
    getAuth,
    onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, updateDoc, increment, getFirestore, arrayRemove, arrayUnion } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Image from "next/image";
const SideBar = ({ usage, data }) => {
    const [profileData, setProfileData] = useState(null);
    const auth = getAuth(app);
    const [userdata, setUserData] = useState(null);
    const router = useRouter();
    const [follow, setFollow] = React.useState(false);
    const db = getFirestore(app);
    const checkfollow = () => {
        if (
            userdata &&
            data &&
            userdata.followers.includes(profileData.userName)
        ) {
            console.log("checkfollow running..." + true);
            return true;
        } else return false;
    };
    const [user, setUser] = useState(auth.currentUser);
    useEffect(() => {
        const getuserdata = async (userEmail, num) => {
            const userRef = doc(db, "users", userEmail);
            const docSnap = await getDoc(userRef);

            if (docSnap.exists()) {
                console.log("Document data:", docSnap.data());
                if (num === 1)
                    setUserData(docSnap.data());
                if (num === 2)
                    setProfileData(docSnap.data());
            } else {
                console.log("No such document!");
                // Handle the case where user data doesn't exist
            }
        };

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            if (!user) {
                // Redirect to login screen if user is not logged in
                router.push("/login");
            } else {
                // If the usage is "feed", display the current user's data
                if (usage === "feed") {
                    getuserdata(user.email, 1);
                } else {
                    // Otherwise, display the primary user's data
                    setUserData(data)
                    getuserdata(user.email, 2);
                    // Get additional data for the primary user

                }
            }
        });

        return () => unsubscribe();
    }, [auth, router, db, user, data]);
    useEffect(() => {
        const hjk = async () => {
            if (userdata && profileData && (userdata.email != profileData.email)) {
                const userref = doc(db, "users", userdata.email);
                const temp = await getDoc(userref);
                const profileref = doc(db, "users", profileData.email);
                const temp1 = await getDoc(profileref);
                if (temp.exists()) {
                    setUserData(temp.data());
                }
                if (temp1.exists()) {
                    setProfileData(temp1.data());
                }
                // const arr=analyzeColors(userdata.pfp);
                // console.log(arr);
            }
        }
        hjk();
    }, [follow]);
    useEffect(() => {
        if (userdata && profileData) {
            setFollow(checkfollow());
        }
    }, [userdata, profileData]);
    const handleLogout = () => {
        auth.signOut().then(() => {
            // Sign-out successful.
            router.push("/login");
        });
    }
    const handlefollow = async () => {
        // Update follow state using the functional form
        try {
            const f = !follow;
            const userRef = doc(db, "users", userdata.email);
            const currentuserRef = doc(db, "users", user.email);

            // Calculate f based on the previous state

            if (f) {
                console.log("adding follow");
                await updateDoc(userRef, {
                    followers: arrayUnion(profileData.userName),
                    followerscount: increment(1),
                });
                await updateDoc(currentuserRef, {
                    following: arrayUnion(userdata.userName),
                    followingcount: increment(1),
                });
            } else {
                console.log("removing follow");
                await updateDoc(userRef, {
                    followers: arrayRemove(profileData.userName),
                    followerscount: increment(-1),
                });
                await updateDoc(currentuserRef, {
                    following: arrayRemove(userdata.userName),
                    followingcount: increment(-1),
                });
            }
            console.log(f);
            setFollow(f);
        } catch (error) {
            console.error("Error updating follow status:", error);
            // Handle error appropriately, e.g., show error message to the user
        }
    };
    return (
        <div className="bg-white dark:bg-black  rounded-xl bg-clip-padding backdrop-filter backdrop-blur-3xl bg-opacity-40 shadow-2xl border-1 border-black lpo">
            {userdata && (
                <div className="main1 w-96">
                    <div className="text-8xl font-lucy text-center mt-4 ">
                        Muse
                    </div>
                    <div className="flex justify-center">
                        <div className="pfp my-4 ">
                            <Image
                                className="rounded-full h-24 object-cover w-24"
                                src={userdata.pfp}
                                width={100}
                                height={100}
                                alt=""
                            />
                        </div>
                    </div>
                    <div className="usernamw text-center font-bold text-2xl">
                        {userdata.userName}
                    </div>
                    <div className="bio text-center opacity-80 my-5">
                        {userdata.bio}
                    </div>
                    <div className="flex justify-around ml-2">
                        <div className="followers text-center w-16">
                            <div className="text-2xl font-bold">
                                {userdata.followers.length}
                            </div>
                            <div className="text-sm">Followers</div>
                        </div>
                        <div className="following text-center w-16 ">
                            <div className="text-2xl font-bold">
                                {userdata.following.length}
                            </div>
                            <div className="text-sm ">Following</div>
                        </div>
                        <div className="posts">
                            <div className="text-2xl font-bold w-16">
                                {userdata.posts.length}
                            </div>
                            <div className="text-sm -ml-2">Posts</div>
                        </div>
                    </div>
                    {(userdata && profileData && (userdata.email != profileData.email)) ? (
                        <div className="flex my-6 justify-center">
                            <button
                                className="bg-blue-600 text-xl rounded-xl p-3 shadow-2xl backdrop-blur-lg hover:opacity-90"
                                onClick={() => handlefollow()}
                            >
                                {follow ? "Following" : "Follow"}
                            </button></div>
                    ) : null}
                    <div className="options flex flex-col justify-evenly h-3/5 items-center">
                        <div className="explore">
                            <div className="text-2xl font-bold text-center cursor-pointer" onClick={() => router.push('/feed')}>Feed</div>
                        </div>
                        <div className="explore">
                            <div className="text-2xl font-bold text-center">Explore</div>
                        </div>
                        <div className="Reels">
                            <div className="text-2xl font-bold text-center">Reels</div>
                        </div>
                        <div className="messages">
                            <div className="text-2xl font-bold text-center cursor-pointer" onClick={() => { router.push('/feed/messages') }}>Messages</div>
                        </div>
                        <div className="settings cursor-pointer ">
                            <div className="text-2xl font-bold cursor-pointer  text-center " onClick={() => router.push('/feed/settings')}>Settings</div>
                        </div>
                        <div className="logout">
                            <div
                                className="text-2xl font-bold cursor-pointer text-center"
                                onClick={handleLogout}
                            >
                                Logout
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default SideBar;