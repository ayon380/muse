import React, { use, useEffect, useState } from 'react';
import { FaRegHeart } from "react-icons/fa6";
import { FaShare } from "react-icons/fa";
import { MdOutlineReportGmailerrorred } from "react-icons/md";
import { FaComments } from "react-icons/fa";
import { TiHeartFullOutline } from "react-icons/ti";
import Image from "next/image";
import AliceCarousel from 'react-alice-carousel';

import "react-alice-carousel/lib/alice-carousel.css";
import "react-image-gallery/styles/css/image-gallery.css";
import { usePathname, useRouter } from 'next/navigation';
import ReactPlayer from 'react-player';
import toast, { Toaster } from 'react-hot-toast';
import { updateDoc, getDoc, arrayUnion, arrayRemove, addDoc, collection } from 'firebase/firestore';
import { doc, increment } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import app from '@/lib/firebase/firebaseConfig';

const GetUserData = async (userName) => {
    try {
        const userRef = doc(db, "username", userName);
        const userSnapshot = await getDoc(userRef);
        return userSnapshot.data();
    } catch (error) {
        console.error("Error checking user existence:", error.message);
        return null;
    }
};
const Post = ({ userdata, post, onClose, currentuserdata }) => {
    // console.log(post);
    const pathname = usePathname();
    const [liked, setLiked] = React.useState(false);
    const [likeCount, setLikeCount] = React.useState(0);
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = React.useState(true);
    const [showReplies, setshowReplies] = React.useState([]);
    const [showcomments, setshowcomments] = React.useState(false);
    const db = getFirestore(app); // Get Firestore instance
    const [comment, setComment] = React.useState('');
    const [posttt, setPosttt] = React.useState(null);
    const [comments, setComments] = React.useState([]);
    const [reply, setReply] = React.useState('');
    const [replies, setReplies] = React.useState([]);
    const [commentslikes, setcommentslikes] = React.useState([]);
    const setcommentslikesfunc = async () => {
        if (posttt) {
            const commentslikes = []; // Initialize an array to store likes for each comment
            for (let i = 0; i < posttt.commentcount; i++) {
                const commentRef = doc(db, 'comments', posttt.comments[i]);
                try {
                    const commentSnapshot = await getDoc(commentRef);
                    if (commentSnapshot.exists()) {
                        const commentData = commentSnapshot.data();
                        const likedByCurrentUser = commentData.likes.includes(currentuserdata.userName);
                        commentslikes.push(likedByCurrentUser);
                    }
                } catch (error) {
                    console.error("Error fetching comment:", error);
                    // Handle error if needed
                }
            }
            console.log(commentslikes + "Comments likes");
            setcommentslikes(commentslikes);
        }
        return []; // Return an empty array if posttt is not defined
    };
    const getComments = async () => {
        console.log("Getting comments" + posttt.comments.length);
        if (posttt) {
            let comm = []
            for (let i = 0; i < posttt.commentcount; i++) {
                const comref = doc(db, `comments`, posttt.comments[i]);
                const comdata = await getDoc(comref);
                comm.push(comdata.data());
            }
            setComments(comm);
        }
    }
    React.useEffect(() => {
        if (commentslikes) {
            console.log(commentslikes + "Comments likes");
        }
    }, [commentslikes]);
    // Function to share posttt
    const Shareposttt = async () => {
        navigator.share({
            title: "Muse",
            text: "Muse",
            url: pathname,
        });
    };

    // Function to report posttt
    const Reportposttt = async () => {
        router.push(`/report/${posttt_id}`);
    };

    // Function to handle modal close
    const handleClose = () => {
        setIsModalOpen(false);
        onClose();
    };

    // Function to format Firebase timestamp
    function formatFirebaseTimestamp(firebaseTimestamp) {
        // Check if the timestamp is valid
        if (!firebaseTimestamp || !(firebaseTimestamp instanceof Date)) {
            return "Invalid date";
        }

        const now = new Date();
        const timestampDate = firebaseTimestamp
        const timeDifference = now - timestampDate;
        const seconds = Math.floor(timeDifference / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (seconds < 60) {
            return "Just now";
        } else if (minutes === 1) {
            return "A minute ago";
        } else if (minutes < 60) {
            return `${minutes} minutes ago`;
        } else if (hours === 1) {
            return "An hour ago";
        } else if (hours < 24) {
            return `${hours} hours ago`;
        } else if (days === 1) {
            return "Yesterday";
        } else if (days < 7) {
            return `${days} days ago`;
        } else {
            // If it's more than a week, you might want to display the actual date
            const options = { year: "numeric", month: "long", day: "numeric" };
            return timestampDate.toLocaleDateString(undefined, options);
        }
    }

    // Function to check if the posttt is liked by the current user
    const checkIfLiked = () => {
        if (posttt && currentuserdata) {
            return posttt.likes.includes(currentuserdata.userName);
        }
    };
    React.useEffect(() => {
        if (userdata && currentuserdata) {
            setPosttt(post);
            const isLiked = checkIfLiked();
            setLiked(isLiked);
            // Set the state with the returned value
            setcommentslikesfunc(); // Call the function
        }
    }, [userdata, currentuserdata, post]);


    // Function to handle like/unlike
    const handleLike = async () => {
        setLiked(prevLiked => !prevLiked); // Toggle liked state
        try {
            const f = !liked;
            if (f) {
                // If not already liked, add user to likes array and increment like count
                await updateDoc(doc(db, 'posts', posttt.id), {
                    likes: arrayUnion(currentuserdata.userName),
                    likecount: increment(1)
                });
                setLikeCount(prevCount => prevCount + 1); // Update like count locally
            } else {
                // If already liked, remove user from likes array and decrement like count
                await updateDoc(doc(db, 'posts', posttt.id), {
                    likes: arrayRemove(currentuserdata.userName),
                    likecount: increment(-1)
                });
                setLikeCount(prevCount => prevCount - 1); // Update like count locally
            }
        } catch (error) {
            toast.error('Error !!' + error.message);
        }
    };

    // Function to render media array
    const getImageArray = () => {
        if (userdata && posttt) {
            let mediaArray = [];
            for (let i = 0; i < posttt.mediaFiles.length; i++) {
                const mediaFile = posttt.mediaFiles[i];
                if (mediaFile.includes('jpeg') || mediaFile.includes('png') || mediaFile.includes('jpg') || mediaFile.includes('gif')) {
                    mediaArray.push(
                        <Image key={`image-${i}`} src={mediaFile} width={500} height={500} alt="posttt Image" />
                    );
                } else if (mediaFile.includes('mp4') || mediaFile.includes('webm') || mediaFile.includes('ogg')) {
                    mediaArray.push(
                        <ReactPlayer key={`video-${i}`} url={mediaFile} playing loop light controls={true} width={500} height={500} />
                    );
                }
            }
            return mediaArray;
        }
    };
    const postttcomment = async () => {
        try {
            const commentData = {
                id: "",
                userName: currentuserdata.userName,
                content: comment,
                likes: [],
                timestamp: new Date(),
                replies: [],
                likecount: 0
            };
            const comref = collection(db, 'comments');
            const temp = await addDoc(comref, commentData);
            await updateDoc(doc(db, 'posts', posttt.id), {
                commentcount: increment(1),
                comments: arrayUnion(temp.id)
            });
            const temp2 = await getDoc(doc(db, 'posts', posttt.id));
            await updateDoc(doc(db, 'comments', temp.id), {
                id: temp.id
            });
            setPosttt(temp2.data());
            console.log("Comment Added" + temp.id);
            setComment('');
            toast.success('Comment posted successfully');
        } catch (error) {
            toast.error('Error !!' + error.message);
        }
    };

    React.useEffect(() => {
        if (posttt) {
            console.log("Posttt changed" + posttt.id);
            const temp = setcommentslikesfunc(); // Call the function
            getComments();
            setLikeCount(posttt ? posttt.likecount : 0);
            const q = checkIfLiked();
            setLiked(q);
        }
    }, [posttt]);
    const postttreply = async (index) => {
        try {
            const replyData = {
                userName: currentuserdata.userName,
                content: reply,
            };
            const postttRef = doc(db, 'posts', posttt.id);
            await updateDoc(postttRef, {
                comments: arrayUnion(replyData)
            });
            setReply('');
            toast.success('Reply posttted successfully');
        }
        catch (error) {
            toast.error('Error !!' + error.message);
        }
    }
    const handlecommentlike = async (commentIndex) => {
        try {
            const commentRef = doc(db, 'comments', posttt.comments[commentIndex]);
            const q = await getDoc(commentRef);
            const com = q.data();
            if (!commentslikes[commentIndex] && !com.likes.includes(currentuserdata.userName)) {
                await updateDoc(commentRef, {
                    likes: arrayUnion(currentuserdata.userName),
                    likecount: increment(1)

                });
            } else {
                await updateDoc(commentRef, {
                    likes: arrayRemove(currentuserdata.userName),
                    likecount: increment(-1)
                });
            }
            getComments();
            setcommentslikesfunc(); // Call the function
            toast.success('Comment liked successfully');
        } catch (error) {
            console.error('Error updating comment like:', error); // Handle any other errors
        }
    };


    return (
        <div className={`fixed inset-0 z-50 bg-opacity-70 overflow-y-auto flex justify-center transition-opacity duration-300 backdrop-blur-sm items-center ${isModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>{posttt && <>
            <Toaster />
            <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" onClick={handleClose}></div>
            <div className="bg-white dark:bg-gray-700 text-black dark:text-white bg-opacity-70 backdrop-blur-sm rounded-lg p-8 transition-transform duration-300 transform-gpu scale-100 lg:scale-75">
                {!showcomments && commentslikes ? <div className='font-rethink w-96'>
                    <div className="card">
                        <div className="c1 flex justify-between">
                            <div className="c11 flex m-2">
                                <div className="img1 h-16 w-16  overflow-hidden">
                                    {userdata ? (
                                        <Image
                                            className="rounded-full h-12 w-12 mr-1 object-cover cursor-pointer"
                                            src={userdata.pfp}
                                            width={100}
                                            height={100}
                                            alt="Profile Picture"
                                        />
                                    ) : (
                                        "Loading Image"
                                    )}
                                </div>
                                {userdata ? (
                                    <>
                                        <div className="name text-xl mt-2 mr-6 font-bold font-rethink">{userdata.userName}</div>
                                        <div className="time mt-3">{posttt && formatFirebaseTimestamp(posttt.timestamp.toDate())}</div>
                                    </>
                                ) : null}
                            </div>
                            <div className="l12 mt-2 flex text-3xl">
                                <div className="share cursor-pointer mr-3" onClick={() => Shareposttt()}>
                                    <FaShare />
                                </div>
                                <div className="report cursor-pointer mr-3" onClick={() => Reportposttt()}>
                                    <MdOutlineReportGmailerrorred />
                                </div>
                            </div>
                        </div>
                        {posttt ? <AliceCarousel items={getImageArray()}></AliceCarousel> : null}
                        {posttt ? <div className="caption text-xl font-bold m-1">{posttt.caption}</div> : null}
                        <div className="like flex">
                            <div className="btnl text-2xl" onClick={handleLike}>
                                {!liked ? <FaRegHeart /> : <TiHeartFullOutline style={{ color: 'red' }} />}
                                <div />
                            </div>
                            <div className="likes text-xl font-bold">{likeCount} likes</div>
                        </div>
                        <div className="comments flex font-bold">
                            <button onClick={() => setshowcomments(true)}>
                                <FaComments /></button> {posttt ? posttt.commentcount : 0} comments
                        </div>

                    </div>
                </div>
                    : <>gfgfgf{showcomments}
                        {<div className="comments">
                            {(posttt && comments.length > 0) ? comments.map((comment, index) => (
                                <div key={index} className="comment my-2">
                                    <div className="flex justify-between">
                                        <div className="commenter mr-3 text-sm font-bold">{comment.userName}</div>

                                        <div className="time text-sm opacity-70">
                                            {formatFirebaseTimestamp(comment.timestamp.toDate())}
                                        </div></div>
                                    <div className="flex justify-between">
                                        <div className="commenttext">{comment.content}</div>
                                        <div className="likes text-sm flex">
                                            <div className="btnl text-2xl" onClick={() => handlecommentlike(index)}>
                                                {!commentslikes[index] ? <FaRegHeart /> : <TiHeartFullOutline style={{ color: 'red' }} />}

                                            </div>
                                            <button onClick={() => handlecommentlike(index)}>
                                                {comment.likecount} likes</button>
                                        </div>
                                        {replies && <button onClick={() => setshowReplies(!showReplies)}>Show Replies</button>}</div>
                                    {showReplies && <div> {comment.replies.map((reply, index) => (
                                        <div key={index} className="reply">
                                            <div className="replier">{reply.userName}</div>
                                            <div className="replytext">{reply.content}</div>
                                            <div className="time">
                                                {formatFirebaseTimestamp(reply.timestamp.toDate())}
                                            </div>

                                        </div>
                                    ))}

                                    </div>}

                                </div>
                            )) : <div>No comments yet</div>}
                            <div className="addcomments">
                                <input type="text" placeholder="Add a comment" value={comment} onChange={(e) => setComment(e.target.value)} />
                                <button onClick={postttcomment}>posttt</button>
                            </div>
                            <button className='bg-blue-500 hover:bg-blue-800 m-5 z-50' onClick={() => setshowcomments(false)}>Close Comment Section</button>
                        </div>}</>}
            </div></>} </div>
    );
};

export default Post;
