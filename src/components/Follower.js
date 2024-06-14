import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { arrayRemove, doc, increment, updateDoc } from "firebase/firestore";
import BottomSheet from "./BottomSheet";
const Follower = ({
  currentuserdata,
  userdata,
  usermetadata,
  enqueueUserMetadata,
  close,
  db,
}) => {
  const [followers, setfollowers] = React.useState(currentuserdata.followers);
  const [isOpen, setIsOpen] = React.useState(true);
  const Router = useRouter();
  const getdata = async () => {
    currentuserdata.followers.forEach(async (follower) => {
      if (!usermetadata[follower]) {
        enqueueUserMetadata(follower);
      }
    });
  };
  const handleremove = async (follower) => {
    try {
      const uref = doc(db, "users", currentuserdata.email);
      const pref = doc(db, "users", usermetadata[follower].email);
      await updateDoc(uref, {
        followers: arrayRemove(follower),
        followerscount: increment(-1),
      });
      await updateDoc(pref, {
        following: arrayRemove(follower),
        followingcount: increment(-1),
      });
      setfollowers(followers.filter((fol) => fol !== follower));
      toast.success("Successfully Removed");
    } catch (error) {
      toast.error(error.message);
    }
  };

  React.useEffect(() => {
    getdata();
  }, []);

  React.useEffect(() => {
    setIsOpen(true);
  }, []);

  return (
    <BottomSheet show={isOpen} heading="Followers" onClose={close}>
      <div className="p-5">
        {followers.map((follower) => {
          if (usermetadata[follower]) {
            return (
              <div key={follower} className="flex items-center mb-4">
                <Image
                  src={usermetadata[follower].pfp}
                  height={50}
                  width={50}
                  alt={usermetadata[follower].pfp}
                  className=" w-10 h-10 rounded-full"
                />
                <p
                  className="ml-4 cursor-pointer"
                  onClick={() =>
                    Router.push(
                      `/feed/profile/${usermetadata[follower].userName}`
                    )
                  }
                >
                  {usermetadata[follower].userName}
                </p>
                {currentuserdata.email == userdata.email && (
                  <button
                    onClick={() => handleremove(follower)}
                    className="ml-auto bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors duration-300"
                  >
                    Remove
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
