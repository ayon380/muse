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
import BottomSheet from "./BottomSheet";
const Follower = ({
  currentuserdata,
  userdata,
  usermetadata,
  postdata,
  enqueueUserMetadata,
  close,
}) => {
  const [isOpen, setIsOpen] = React.useState(true);
  const Router = useRouter();
  React.useEffect(() => {
    setIsOpen(true);
    postdata.taggedUsers.forEach((follower) => {
      if (!usermetadata[follower]) {
        enqueueUserMetadata(follower);
      }
    });
  }, []);


  return (
    <BottomSheet show={isOpen} heading="Tagged Users" onClose={close}>
      <Toaster />
      {postdata.taggedUsers.length === 0 && (
        <p className="text-gray-500 text-center mt-20">No tagged users Yet</p>
      )}
      {postdata.taggedUsers.map((follower) => {
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
    </BottomSheet>
  );
};

export default Follower;
