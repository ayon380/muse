import React from 'react';
import { FaRegHeart } from "react-icons/fa6";
import { FaShare } from "react-icons/fa";
import { MdOutlineReportGmailerrorred } from "react-icons/md";
import { FaComments } from "react-icons/fa";
import { TiHeartFullOutline } from "react-icons/ti";
import Image from "next/image";
import AliceCarousel from 'react-alice-carousel';
import "react-alice-carousel/lib/alice-carousel.css";
import "react-image-gallery/styles/css/image-gallery.css";
import { useRouter } from 'next/navigation';
import ReactPlayer from 'react-player';
import toast from 'react-hot-toast';
import { updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { doc, increment } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import app from '@/lib/firebase/firebaseConfig';

const Post = ({ userdata, post, onClose, currentuserdata }) => {
    const [liked, setLiked] = React.useState(false);
    const [likeCount, setLikeCount] = React.useState(0);
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = React.useState(true);
    const db = getFirestore(app); // Get Firestore instance
    const [showcomments, setshowcomments] = React.useState(false);

    // Function to share post
    const SharePost = async () => {
        navigator.share({
            title: "Muse",
            text: "Muse",
            url: "https://muse-mauve.vercel.app",
        });
    };

    // Function to report post
    const ReportPost = async () => {
        router.push(`/report/${post_id}`);
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

    // Function to check if the post is liked by the current user
    const checkIfLiked = () => {
        if (post && currentuserdata) {
            return post.likes.includes(currentuserdata.userName);
        }
    };

    React.useEffect(() => {
        if (userdata && currentuserdata) {
            const isLiked = checkIfLiked();
            setLiked(isLiked);
            setLikeCount(post ? post.likecount : 0); // Set initial like count
        }
    }, [userdata, currentuserdata, post]);

    // Function to handle like/unlike
    const handleLike = async () => {
        setLiked(prevLiked => !prevLiked); // Toggle liked state
        try {
            const f = !liked;
            if (f) {
                // If not already liked, add user to likes array and increment like count
                await updateDoc(doc(db, 'posts', post.id), {
                    likes: arrayUnion(currentuserdata.userName),
                    likecount: increment(1)
                });
                setLikeCount(prevCount => prevCount + 1); // Update like count locally
            } else {
                // If already liked, remove user from likes array and decrement like count
                await updateDoc(doc(db, 'posts', post.id), {
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
        if (userdata && post) {
            let mediaArray = [];
            for (let i = 0; i < post.mediaFiles.length; i++) {
                const mediaFile = post.mediaFiles[i];
                if (mediaFile.includes('jpeg') || mediaFile.includes('png') || mediaFile.includes('jpg') || mediaFile.includes('gif')) {
                    mediaArray.push(
                        <Image key={`image-${i}`} src={mediaFile} width={500} height={500} alt="Post Image" />
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

    return (
        <div className={`fixed inset-0 z-50 bg-opacity-70 overflow-y-auto flex justify-center transition-opacity duration-300 backdrop-blur-sm items-center ${isModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" onClick={handleClose}></div>
            <div className="bg-white dark:bg-gray-700 text-black dark:text-white bg-opacity-70 backdrop-blur-sm rounded-lg p-8 transition-transform duration-300 transform-gpu scale-100 lg:scale-75">
                <div className='font-rethink w-96'>
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
                                        <div className="time mt-3">{post && formatFirebaseTimestamp(post.timestamp.toDate())}</div>
                                    </>
                                ) : null}
                            </div>
                            <div className="l12 mt-2 flex text-3xl">
                                <div className="share cursor-pointer mr-3" onClick={() => SharePost()}>
                                    <FaShare />
                                </div>
                                <div className="report cursor-pointer mr-3" onClick={() => ReportPost()}>
                                    <MdOutlineReportGmailerrorred />
                                </div>
                            </div>
                        </div>
                        {post ? <AliceCarousel items={getImageArray()}></AliceCarousel> : null}
                        {post ? <div className="caption text-xl font-bold m-1">{post.caption}</div> : null}
                        <div className="like flex">
                            <div className="btnl text-2xl" onClick={handleLike}>
                                {!liked ? <FaRegHeart /> : <TiHeartFullOutline style={{ color: 'red' }} />}
                                <div />
                            </div>
                            <div className="likes text-xl font-bold">{likeCount} likes</div>
                        </div>
                        <div className="comments flex font-bold">
                            <FaComments />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Post;
