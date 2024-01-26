import React from 'react'
import { FaRegHeart } from "react-icons/fa6";
import { FaShare } from "react-icons/fa";
import { MdOutlineReportGmailerrorred } from "react-icons/md";
import { FaComments } from "react-icons/fa";
import { TiHeartFullOutline } from "react-icons/ti";
import Image from "next/image";
const post_id='55rt'
import { useRouter } from 'next/navigation';
const Post = ({ userdata }) => {
    const [liked, setLiked] = React.useState(false)
    const router=useRouter()
    // const userdata=userdata;
    const SharePost = async () => {
        navigator.share({
          title: "Muse",
          text: "Muse",
          url: "https://muse-ten.vercel.app/",
        });
      };
      const ReportPost = async () => {
        router.push(`/report/${post_id}`);
      };
    console.log(userdata);
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
                        <div className="name  text-xl mt-2 mr-6 font-bold font-rethink">ayon380_</div>
                        <div className="time mt-3">9h ago</div>
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
                <Image
                    src="/nature.jpg"
                    className=""
                    width={1000}
                    height={1000}
                    alt="Post Image"
                />
                <div className="caption text-xl font-bold m-1">GTA 6 First Picturee</div>
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