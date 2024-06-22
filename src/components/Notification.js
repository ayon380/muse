// components/Notification.js
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { useSidebarStore } from "@/app/store/zustand";
import Image from "next/image";
import { useRouter } from "next/navigation";
const Notification = ({ data, onDismiss, unread }) => {
  const [visible, setVisible] = useState(true);
  const controls = useAnimation();
  //   console.log(notification);
  const router = useRouter();
  const { usermetadata } = useSidebarStore();
  const notification = data.message;
  //   console.log(data.message.type + "data");
  console.log(unread + "unread");
  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 1000000); // 10 seconds
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    controls
      .start({
        opacity: 0,
        y: -100,
        transition: { duration: 10, ease: "easeInOut" },
      })
      .then(() => {
        setVisible(false);
        onDismiss();
      });
  };

  const handleDragEnd = (event, info) => {
    if (info.offset.y < -100) {
      handleClose();
    }
  };

  if (!visible) return null;
  function convertToChatTime(timestamp) {
    const now = new Date();
    const messageDate = new Date(timestamp);

    // Check if messageDate is today or yesterday
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (messageDate >= today) {
      const hour = messageDate.getHours().toString().padStart(2, "0"); // Format the hour to ensure it's always two digits
      const minute = messageDate.getMinutes().toString().padStart(2, "0"); // Format the minute to ensure it's always two digits
      return `Today at ${hour}:${minute}`;
    } else if (messageDate >= yesterday) {
      const hour = messageDate.getHours().toString().padStart(2, "0"); // Format the hour to ensure it's always two digits
      const minute = messageDate.getMinutes().toString().padStart(2, "0"); // Format the minute to ensure it's always two digits
      return `Yesterday at ${hour}:${minute}`;
    } else {
      const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const day = days[messageDate.getDay()];
      const formattedDate = messageDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const hour = messageDate.getHours().toString().padStart(2, "0"); // Format the hour to ensure it's always two digits
      const minute = messageDate.getMinutes().toString().padStart(2, "0"); // Format the minute to ensure it's always two digits
      return `${day}, ${formattedDate} at ${hour}:${minute}`;
    }
  }
  const handlemessagerouting = (notification) => {
    handledismissnotification(notification);
    if (notification.chattype == "g") {
      router.push(
        `/feed/messages?roomid=${notification.roomid}&chattype=g&chatwindow=${notification.title}`
      );
    } else {
      router.push(
        `/feed/messages?roomid=${notification.roomid}&chattype=p&chatwindow=${notification.sender}`
      );
    }
    handleClose();
  };
  const handledismissnotification = async (notification) => {
    try {
      setnotificationOpen((prev) =>
        prev.filter((item) => item.id !== notification.id)
      );
      const notrf = collection(db, "notifications");
      const q = query(
        notrf,
        where("receiver", "==", userdata.uid),
        where("sender", "==", notification.sender),
        where("text", "==", notification.text),
        where("type", "==", notification.type)
      );
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });

      toast.success("Notification dismissed");
    } catch (error) {
      console.error("Error removing notification:", error);
      // Handle error appropriately, e.g., show error message to the user
    }
  };
  return (
    <AnimatePresence>
      <motion.div
        className="fixed top-2 left-0 right-0 mx-2  rounded-xl z-50 bg-white dark:bg-feedheader shadow-lg shadow-gray-800 "
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{
          opacity: 0,
          y: -200,
          transition: { duration: 1, ease: "easeInOut" },
        }}
        drag="y"
        dragConstraints={{ top: 0, bottom: window.innerHeight }}
        onDragEnd={handleDragEnd}
      >
        <div className=" ">
          {notification?.sender && usermetadata[notification.sender] && (
            <div
              key={notification.id}
              className="cursor-pointer text-black dark:text-white backdrop-filter backdrop-blur-2xl bg-opacity-50 bg-feedheader shadow-lg justify-between rounded-xl bg-transparent p-5 my-2"
            >
              {usermetadata[notification.sender] && (
                <div className="d flex w-full">
                  <div className="flex justify-between w-full ">
                    <Image
                      src={usermetadata[notification.sender].pfp}
                      width={50}
                      height={50}
                      alt="profile"
                      className="rounded-full h-10 w-12"
                    />
                    <div className="dfdsf px-5 w-full">
                      <div className="flex justify-between w-full">
                        <div className="text-sm font-semibold opacity-75">
                          {usermetadata[notification.sender].userName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {convertToChatTime(notification.timestamp)}
                        </div>
                      </div>

                      {usermetadata[notification.sender] && (
                        <div>
                          {notification.type == "message" &&
                            notification.messagetype == "media" && (
                              <div
                                className=" flex pt-2"
                                onClick={() => {
                                  handlemessagerouting(notification);
                                }}
                              >
                                <Image
                                  className="rounded-xl h-10 w-10"
                                  src={notification.text[0]}
                                  alt="Media File"
                                  height={100}
                                  width={100}
                                />
                                <div className="text pt-2 ml-4">
                                  {usermetadata[notification.sender].userName}{" "}
                                  sent you a media file
                                </div>
                              </div>
                            )}
                          {notification.type == "message" &&
                            notification.messagetype == "gif" && (
                              <div
                                className=" flex pt-2"
                                onClick={() => {
                                  handlemessagerouting(notification);
                                }}
                              >
                                <Image
                                  className="rounded-xl h-10 w-10"
                                  src={notification.text}
                                  alt="Media File"
                                  height={100}
                                  width={100}
                                />
                                <div className="text pt-2 ml-4">
                                  {usermetadata[notification.sender].userName}{" "}
                                  sent you a media file
                                </div>
                              </div>
                            )}
                          {notification.type == "message" && (
                            <div
                              className="pl"
                              onClick={() => {
                                handlemessagerouting(notification);
                              }}
                            >
                              {notification.messagetype == "text" && (
                                <div className="text">
                                  {notification.text.length > 100
                                    ? notification.text.slice(0, 100) + "..."
                                    : notification.text}
                                </div>
                              )}
                              <div className="text-xs"></div>
                            </div>
                          )}
                          {notification.type == "reellike" && (
                            <div
                              className="q"
                              onClick={() =>
                                router.push(
                                  `/feed/reels?reelid=${notification.reelid}`
                                )
                              }
                            >
                              {usermetadata[notification.sender] && (
                                <>
                                  <div className="text-sm">
                                    {usermetadata[notification.sender].userName}{" "}
                                    liked your Reel
                                  </div>
                                  <div className="text-xs"></div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="">
                      <div
                        className="sd ml-3 -mt-1 cursor-pointer"
                        onClick={() => handledismissnotification(notification)}
                      >
                        X
                      </div>
                      <div className="type ">
                        {notification.type == "like" && (
                          <div className="text-xs">
                            <Image
                              src="/icons/like.png"
                              height={50}
                              width={50}
                              className="dark:invert h-10 w-10"
                              alt="Like"
                            />
                          </div>
                        )}
                        {notification.type == "comment" && (
                          <div className="text-xs">
                            <Image
                              src="/icons/comment.png"
                              alt="Comment"
                              height={50}
                              className="dark:invert h-10 w-10"
                              width={50}
                            />
                          </div>
                        )}
                        {notification.type == "follow" && (
                          <div className="text-xs">
                            <Image
                              src="/icons/add.png"
                              height={50}
                              width={50}
                              className="dark:invert h-10 w-10"
                              alt="Add"
                            />
                          </div>
                        )}
                        {notification.type == "message" && (
                          <div className="text-xs">
                            <Image
                              src="/icons/message.svg"
                              height={50}
                              className="dark:invert h-10 w-10"
                              width={50}
                              alt="Message"
                            />
                          </div>
                        )}
                        {notification.type == "reellike" && (
                          <div className="text-xs">
                            <Image
                              src="/icons/like.png"
                              alt=""
                              className="dark:invert h-10 w-10"
                              height={50}
                              width={50}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Notification;
`   `;
