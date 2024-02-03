import React from 'react'
import { FaRegHeart } from "react-icons/fa6";
import { FaShare } from "react-icons/fa";
import { MdOutlineReportGmailerrorred } from "react-icons/md";
import { FaComments } from "react-icons/fa";
import { TiHeartFullOutline } from "react-icons/ti";
import Image from "next/image";
const post_id = '55rt'
import AliceCarousel from 'react-alice-carousel';
import "react-alice-carousel/lib/alice-carousel.css";
import "react-image-gallery/styles/css/image-gallery.css";
import { useRouter } from 'next/navigation';
import ReactPlayer from 'react-player'
const Post = ({ userdata, postno }) => {
    const [liked, setLiked] = React.useState(false)
    const router = useRouter()
    console.log('feedpost component');
    // const userdata=userdata;
    const SharePost = async () => {
        navigator.share({
            title: "Muse",
            text: "Muse",
            url: "https://muse-mauve.vercel.app",
        });
    };
    const ReportPost = async () => {
        router.push(`/report/${post_id}`);
    };
    // console.log(userdata);
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



    const getimagearray = () => {
        if (userdata && postno >= 0 && userdata.posts[postno]) {
            let mediaArray = [];

            for (let i = 0; i < userdata.posts[postno].mediaFiles.length; i++) {
                const mediaFile = userdata.posts[postno].mediaFiles[i];
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
        <div className='font-rethink'>
            <div className="card ">
                <div className="c1 flex justify-between ">
                    <div className="c11 flex m-2 ">
                        <div className="img1">
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
                        {userdata ? <><div className="name  text-xl mt-2 mr-6 font-bold font-rethink">{userdata.userName}</div>
                            <div className="time mt-3">{formatFirebaseTimestamp(userdata.posts[postno].timestamp.toDate())}</div></> : null}
                    </div>
                    <div className="l12 mt-2 flex text-3xl ">
                        <div
                            className="share cursor-pointer mr-3"
                            onClick={() => SharePost()}
                        >
                            <FaShare />
                        </div>
                        <div
                            className="report cursor-pointer mr-3"
                            onClick={() => ReportPost()}
                        >
                            <MdOutlineReportGmailerrorred />
                        </div>
                    </div>
                </div>
                {userdata.posts[postno] ? <AliceCarousel items={getimagearray()}></AliceCarousel> : null}
                {userdata.posts[postno] ? <div className="caption text-xl font-bold m-1">{userdata.posts[postno].caption}</div> : null}
                <div className="like flex ">
                    <div className="btnl text-2xl " onClick={() => (setLiked(!liked))}>
                        {liked ? <FaRegHeart /> : <TiHeartFullOutline style={{ color: 'red' }} />}
                        <div />
                    </div>
                    <div className="likes text-xl font-bold">1,000 likes</div>
                </div>
                <div className="comments flex font-bold">
                    <FaComments />
                    sick Asfff lets goo
                </div>
            </div>
        </div>
    )
}

export default Post