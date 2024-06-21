import React from "react";
import Image from "next/image";
import {
  arrayRemove,
  arrayUnion,
  doc,
  increment,
  updateDoc,
} from "firebase/firestore";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import BottomNav from "./Bottomnav";
import BottomSheet from "./BottomSheet";

const Follower = ({
  currentuserdata,
  userdata,
  usermetadata,
  enqueueUserMetadata,
  close,
  db,
}) => {
  const [following, setfollowing] = React.useState(currentuserdata.following);
  const [isOpen, setIsOpen] = React.useState(true);
  const Router = useRouter();
  const handleremove = async (follower) => {
    try {
      const uref = doc(db, "users", currentuserdata.email);
      const pref = doc(db, "users", usermetadata[follower].email);
      console.log(usermetadata[follower].email);
      await updateDoc(uref, {
        following: arrayRemove(follower),
        followingcount: increment(-1),
      });
      await updateDoc(pref, {
        followers: arrayRemove(currentuserdata.uid),
        followerscount: increment(-1),
      });
      setfollowing(following.filter((fol) => fol !== follower));
      toast.success("Successfully Removed");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getdata = async () => {
    currentuserdata.following.forEach(async (follower) => {
      if (!usermetadata[follower]) {
        enqueueUserMetadata(follower);
      }
    });
  };

  React.useEffect(() => {
    getdata();
  }, []);

  React.useEffect(() => {
    setIsOpen(true);
  }, []);

  return (
    <BottomSheet show={isOpen} heading="Following" onClose={close}>
      <div className="p-5">
        {following.map((follower) => {
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
                {userdata.email == currentuserdata.email && (
                  <button
                    onClick={() => handleremove(follower)}
                    className="ml-auto bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors duration-300"
                  >
                    UnFollow
                  </button>
                )}
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
