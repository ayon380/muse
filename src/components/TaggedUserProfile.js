import React from "react";
import Image from "next/image";
import {
  arrayRemove,
  arrayUnion,
  doc,
  increment,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import toast, { Toaster } from "react-hot-toast";
import BottomSheet from "./BottomSheet";
import { useRouter } from "next/navigation";
const Follower = ({
  currentuserdata,
  db,
  userdata,
  usermetadata,
  postid,
  enqueueUserMetadata,
  close,
}) => {
  const [isOpen, setIsOpen] = React.useState(true);
  const Router = useRouter();
  const [postdata, setPostData] = React.useState(null);
  const fetchpostdata = async () => {
    const postRef = doc(db, "posts", postid);
    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
      console.log("Document data:", postSnap.data());
      setPostData(postSnap.data());
    } else {
      console.log("No such document!");
      // Handle the case where user data doesn't exist
    }
  };

  React.useEffect(() => {
    const fetchData = async () => {
      setIsOpen(true);
      await fetchpostdata();
      if (postdata)
        postdata.taggedUsers.forEach((follower) => {
          if (!usermetadata[follower]) {
            enqueueUserMetadata(follower);
          }
        });
    };

    fetchData();
  }, []);
  return (
    <BottomSheet show={isOpen} heading="Tagged Users" onClose={close}>
      <div className="p-5">
        <Toaster />
        {postdata && postdata.taggedUsers.length === 0 && (
          <p className="text-gray-500 text-center ">No tagged users Yet</p>
        )}
        {postdata &&
          postdata.taggedUsers.map((follower) => {
            if (usermetadata[follower]) {
              return (
                <div key={follower} className="flex items-center mb-4">
                  <Image
                    src={usermetadata[follower].pfp}
                    height={50}
                    width={50}
                    alt=""
                    className="rounded-full h-10 w-10"
                  />
                  <p
                    className="ml-4  cursor-pointer"
                    onClick={() =>
                      Router.push(
                        `/feed/profile/${usermetadata[follower].userName}`
                      )
                    }
                  >
                    {usermetadata[follower].userName}
                  </p>
                </div>
              );
            }
            return null;
          })}
      </div>
    </BottomSheet>
  );
};

export default Follower;
