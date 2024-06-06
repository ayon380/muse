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
const Follower = ({
  currentuserdata,
  userdata,
  usermetadata,
  postdata,
  enqueueUserMetadata,
  
  close,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
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
    <div
      className={`fixed top-0 py-10  left-0 w-full h-full flex items-center justify-center z-50 bg-opacity-50 bg-black transition-all duration-250 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        className={`bg-white rounded-xl p-4 mx-4 w-full max-w-2xl h-full max-h-screen overflow-y-auto transition-all duration-500 ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Tagged Users</h2>
          <button
            onClick={() => {
              setIsOpen(false);
              setTimeout(close, 500);
            }}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-300"
          >
            Close
          </button>
        </div>
        <Toaster />
        {postdata.taggedUsers.length === 0 && (
          <p className="text-gray-500 text-center ">No tagged users Yet</p>
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
      </div>
    </div>
  );
};

export default Follower;
