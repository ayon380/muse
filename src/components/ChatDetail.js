import React, { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { deleteDoc } from "firebase/firestore";
import Image from "next/image";
import BottomSheet from "./BottomSheet";
import { updateDoc, doc } from "firebase/firestore";
import dynamic from "next/dynamic";
const Modal = dynamic(() => import("./Modal"));
const ChatDetail = ({
  onClose,
  roomdata,
  usermetadata,
  router,
  userdata,
  db,
  refetchroomdata,
}) => {
  const [theme, setTheme] = useState(roomdata.theme);
  const [showModal, setShowModal] = useState(false);

  const deletechat = async () => {
    try {
      // Delete the document from "messagerooms" collection
      console.log("Deleting chat:", roomdata.roomid);
      await deleteDoc(doc(db, "messagerooms", roomdata.roomid));

      // Update each participant's document in the "chats" collection
      await Promise.all(
        roomdata.participants.map(async (participant) => {
          // Get the participant's chat document reference
          const participantDoc = doc(db, "chats", participant);

          // Remove the room ID from the participant's "rooms" array
          await updateDoc(participantDoc, {
            rooms: roomdata.rooms.filter((room) => room !== roomdata.roomid),
          });
        })
      );

      // Call onClose to perform any closing actions
      router.push("/feed/messages");
      onClose();
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };
  const colors = {
    primary: "#ff5e5e",
    secondary: "#ffc107",
    background: "#1a1a1a",
    text: "#ffffff",
  };
  useEffect(() => {
    const func = async () => {
      await updateDoc(doc(db, "messagerooms", roomdata.roomid), {
        theme: theme,
      });
    };
    if (roomdata.theme != theme) {
      func();
      refetchroomdata();
    }
  }, [theme]);

  // Define some animations
  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };
  return (
    <BottomSheet show={true} heading="Chat Details" onClose={onClose}>
      <div>
        {showModal && (
          <Modal
            content="Are you sure you want to delete this chat? This action cannot be undone. All the Messages and memories will be lost.🥹"
            title="Delete Chat"
            setShowModal={setShowModal}
            type="deletepost"
            handleDelete={deletechat}
            handleinfofunc={null}
          />
        )}
        <Toaster />

        <>
          {/* <h2 className="text-2xl font-bold mb-4 ">Group Chat Info</h2> */}
          <Image
            src={
              roomdata.participants[0] != userdata.uid
                ? usermetadata[roomdata.participants[0]].pfp
                : usermetadata[roomdata.participants[1]].pfp
            }
            height={100}
            width={500}
            alt="854"
            className="rounded-md h-60 object-cover w-full "
          />

          <div className="lp p-8">
            <Link
              href={`/feed/profile/${
                roomdata.participants[0] != userdata.uid
                  ? usermetadata[roomdata.participants[0]].userName
                  : usermetadata[roomdata.participants[1]].userName
              }`}
            >
              <p className="font-bold text-center text-xl mb-2">
                @
                {roomdata.participants[0] != userdata.uid
                  ? usermetadata[roomdata.participants[0]].userName
                  : usermetadata[roomdata.participants[1]].userName}
              </p>
            </Link>
            <p className="font-bold text-center text-xl mb-2">
              {roomdata.messages.length} Messages
            </p>
            <div className="sdf">
              <div className="h1 text-center opacity-75">Chat Theme</div>
              <div className="flex flex-wrap justify-center overflow-y-auto h-96">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="t1 p-4"
                >
                  <button onClick={() => setTheme("default")} className="">
                    <div
                      className={`p-0.5 rounded-lg ${
                        theme == "default" ? "border-4 border-purple-300" : ""
                      }`}
                    >
                      <div className="qw w-28 h-28 rounded-lg bg-purple-300"></div>
                    </div>
                    <div className="we">Default</div>
                  </button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="t2 p-4"
                >
                  <button onClick={() => setTheme("space")} className="">
                    <div
                      className={`p-0.5 rounded-lg ${
                        theme == "space" ? "border-4 border-purple-300" : ""
                      }`}
                    >
                      <Image
                        src="/chatbg/space.jpg"
                        height={100}
                        className="w-28 h-28 rounded-lg object-cover"
                        width={100}
                        alt="Space"
                      />
                    </div>
                    <div className="we">Space</div>
                  </button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="t3 p-4"
                >
                  <button onClick={() => setTheme("love")} className="">
                    <div
                      className={`p-0.5 rounded-lg ${
                        theme == "love" ? "border-4 border-purple-300" : ""
                      }`}
                    >
                      <Image
                        src="/chatbg/love.jpeg"
                        height={100}
                        className="w-28 h-28 rounded-lg object-cover"
                        width={100}
                        alt="Space"
                      />
                    </div>
                    <div className="we">Love</div>
                  </button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="t4 p-4"
                >
                  <button onClick={() => setTheme("heaven")} className="">
                    <div
                      className={`p-0.5 rounded-lg ${
                        theme == "heaven" ? "border-4 border-purple-300" : ""
                      }`}
                    >
                      <Image
                        src="/chatbg/heaven.jpeg"
                        height={100}
                        className="w-28 h-28 rounded-lg object-cover"
                        width={100}
                        alt="Space"
                      />
                    </div>
                    <div className="we">Heaven</div>
                  </button>
                </motion.div>
              </div>
            </div>
            <div className="flex justify-center">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowModal(true)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg transition-colors duration-300"
              >
                Delete Chat
              </motion.button>
            </div>
            <div className="flex justify-center ">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onClose()}
                className=" text-white px-4 py-2 rounded-lg transition-colors duration-300"
              >
                <Image
                  src="/icons/close.png"
                  height={20}
                  width={20}
                  alt="Close"
                />
              </motion.button>
            </div>
          </div>
        </>
      </div>
    </BottomSheet>
  );
};

export default ChatDetail;
