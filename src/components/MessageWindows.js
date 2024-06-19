"use client";
import React, { useEffect, useMemo, useState, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import useInfiniteScroll from "react-easy-infinite-scroll-hook";
const MyComponent = ({
  messages,
  userdata,
  usermetadata,
  setgifopen,
  convertToChatTime,
  handleCopy,
  handleDelete,
  isDropdownOpen,
  setshowaddfiles,
  loadolder,
  setMediaViewerOpen,
  loadingold,
  maxlength,
  handledropdown,
  selectedMessage,
  handlemessagereply,
  preventDefault,
}) => {
  const scrollContainerRef = useRef(null);
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    const lastMessageElement = scrollContainer?.lastElementChild;

    if (lastMessageElement) {
      lastMessageElement.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  return (
    <div className="text-white">
      <div
        ref={scrollContainerRef}
        style={{ overflowY: "auto", height: "50vh" }}
      >
        {messages.map((message) => (
          <div
            onClick={() => {
              setshowaddfiles(false);
              setgifopen(false);
            }}
            className="px-3 md:px-6 "
            key={message.timestamp + message.sender + message.text}
            // initial={{ opacity: 0, y: 50 }}
            // animate={{ opacity: 1, y: 0 }}
            // transition={{ duration: 0.5 }}
          >
            {message.sender == userdata.uid ? (
              <div className="ko flex justify-end my-5 ml-28">
                <div
                  className="e  text-right shadow-xl  bg-fuchsia-300 dark:bg-fuchsia-500 p-2 lg:p-5 rounded-2xl md:rounded-3xl rounded-tr-none cursor-pointer"
                  onClick={() => handledropdown(message)}
                >
                  <div className="lp">
                    <div className="flex justify-end">
                      <div className="time text-xs opacity-50 mr-2 mt-1">
                        {convertToChatTime(message.timestamp)}
                      </div>
                      {/* <div className="td text-sm font-bold">
                                      {usernames[message.sender]}
                                    </div> */}
                      <Image
                        className="rounded-full h-5 w-5 ml-1"
                        src={userdata.pfp}
                        alt="Profile Pic"
                        height={50}
                        width={50}
                      />
                    </div>
                    <div className="lp">
                      {message.type == "gif" && (
                        <>
                          {" "}
                          <Image
                            className=" rounded-xl text-center"
                            src={message.text}
                            alt=""
                            height={100}
                            width={100}
                          />
                        </>
                      )}
                      {message.type == "media" && (
                        <div
                          className="flex"
                          onClick={() => {
                            setMediaViewerOpen(true);
                            setmediaviewerfiles(message.text);
                          }}
                        >
                          {message.text.map((media, index) => (
                            <div key={index}>
                              {media.startsWith("https://firebasestorage") &&
                                (media.includes("mp4") ||
                                  media.includes("mov") ||
                                  media.includes("mkv") ||
                                  media.includes("hevc")) && (
                                  <video
                                    loop
                                    src={media}
                                    alt=""
                                    controls
                                    className="rounded-xl h-36 w-36 m-2 object-cover"
                                  />
                                )}
                              {media.startsWith("https://firebasestorage") &&
                                (media.includes("jpg") ||
                                  media.includes("heif") ||
                                  media.includes("jpeg")) && (
                                  <Image
                                    src={media}
                                    alt=""
                                    height={100}
                                    width={100}
                                    className="rounded-xl h-36 w-36 m-2 object-cover"
                                    onContextMenu={preventDefault} // Prevent right-click context menu
                                    onMouseDown={preventDefault} // Prevent drag start
                                    onDragStart={preventDefault} // Prevent drag
                                  />
                                )}
                            </div>
                          ))}
                        </div>
                      )}

                      {message.type == "text" &&
                        (message.text ? (
                          <span className="fg text-lg md:text-xl text-wrap">
                            {message.text
                              .split(/(@\S+|https?:\/\/\S+)/)
                              .map((part, index) => {
                                if (part.startsWith("@")) {
                                  // If it's a mention, create a link
                                  return (
                                    <a href={`/${part.slice(1)}`} key={index}>
                                      <strong>{part}</strong>
                                    </a>
                                  );
                                } else if (part.includes("muse.nofilter")) {
                                  // If it's a Muse post, create a link
                                  return (
                                    <a href={message.text} key={message.text}>
                                      <div className="flex items-center justify-center px-4 py-2 rounded-md bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold hover:from-purple-600 hover:to-pink-700 transition duration-300">
                                        <span>See Post</span>
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          className="h-5 w-5 ml-2"
                                          viewBox="0 0 20 20"
                                          fill="currentColor"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                                            clipRule="evenodd"
                                          />
                                        </svg>
                                      </div>
                                    </a>
                                  );
                                } else if (part.startsWith("http")) {
                                  // If it's a website link, create a link
                                  return (
                                    <a href={part} key={index}>
                                      <strong>{part}</strong>
                                    </a>
                                  );
                                } else {
                                  // Otherwise, render it as plain text
                                  return (
                                    <React.Fragment key={index}>
                                      {part}
                                    </React.Fragment>
                                  );
                                }
                              })}
                          </span>
                        ) : (
                          <div className="fg text-xl">{message.text}</div>
                        ))}
                    </div>
                  </div>
                  {isDropdownOpen && selectedMessage == message && (
                    <motion.div
                      className="dropdown-menu  mt-4 flex"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{
                        opacity: isDropdownOpen ? 1 : 0,
                        height: isDropdownOpen ? "auto" : 0,
                      }}
                      transition={{
                        duration: 0.3,
                        ease: "easeInOut",
                      }}
                      layoutTransition={{
                        type: "tween",
                        duration: 0.3,
                        ease: "easeInOut",
                      }}
                    >
                      <button onClick={() => handlemessagereply(message)}>
                        <Image
                          className="h-5 w-5 rounded-full"
                          src="/icons/reply.png"
                          height={50}
                          width={50}
                          alt=""
                        />
                      </button>
                      {message.readstatus ? (
                        <>
                          {""}
                          <Image
                            className="w-5 h-5 
                                            "
                            src="/icons/readt.png"
                            height={100}
                            width={100}
                            alt="delete"
                          />
                        </>
                      ) : (
                        <>
                          {" "}
                          <Image
                            className="w-5 h-5 "
                            src="/icons/read.png"
                            height={50}
                            width={50}
                            alt="delete"
                          />
                        </>
                      )}
                      <button
                        className=" ml-2 dropdown-item mr-2 disabled:hidden"
                        onClick={() => handleCopy(message.text)}
                        disabled={
                          message.type == "media" || message.type == "gif"
                        }
                      >
                        <Image
                          className="w-5 h-5 "
                          src="/icons/copy.png"
                          height={50}
                          width={50}
                          alt="delete"
                        />
                      </button>
                      <button className="dropdown-item" onClick={handleDelete}>
                        <Image
                          className="w-5 h-5 "
                          src="/icons/delete.png"
                          height={50}
                          width={50}
                          alt="delete"
                        />
                      </button>
                      {/* Delete button */}
                    </motion.div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="ko  flex right-0 my-5">
                  <div
                    className="e bg-purple-300 dark:bg-purple-500 p-2 lg:p-5 shadow-xl rounded-2xl  md:rounded-3xl rounded-tl-none"
                    onClick={() => handledropdown(message)}
                  >
                    <div className="lp">
                      <div className="flex">
                        {/* {console.log(pfps[message.sender])} */}
                        {usermetadata[message.sender] && (
                          <Image
                            src={usermetadata[message.sender].pfp}
                            className="rounded-full h-5 w-5 mr-1"
                            alt="Profile Pic"
                            height={50}
                            width={50}
                          />
                        )}

                        <div className="time text-xs ml-1  opacity-50">
                          {convertToChatTime(message.timestamp)}
                        </div>
                      </div>
                      {message.type == "gif" && (
                        <>
                          {" "}
                          <Image
                            className=" rounded-xl text-center"
                            src={message.text}
                            alt=""
                            height={100}
                            width={100}
                          />
                        </>
                      )}
                      {message.type == "media" && (
                        <div
                          className="flex"
                          onClick={() => {
                            setmediaviewerfiles(message.text);
                            setMediaViewerOpen(true);
                          }}
                        >
                          {message.text.map((media, index) => (
                            <div key={index}>
                              {media.startsWith("https://firebasestorage") &&
                                (media.includes("mp4") ||
                                  media.includes("mov") ||
                                  media.includes("mkv") ||
                                  media.includes("hevc")) && (
                                  <video
                                    loop
                                    src={media}
                                    alt=""
                                    controls
                                    className="rounded-xl h-36 w-36 m-2 object-cover"
                                  />
                                )}
                              {media.startsWith("https://firebasestorage") &&
                                (media.includes("jpg") ||
                                  media.includes("heif") ||
                                  media.includes("jpeg")) && (
                                  <Image
                                    src={media}
                                    alt=""
                                    height={100}
                                    width={100}
                                    className="rounded-xl h-36 w-36 m-2 object-cover"
                                  />
                                )}
                            </div>
                          ))}
                        </div>
                      )}
                      {message.type == "text" &&
                        (message.text ? (
                          <span className="fg text-lg md:text-xl text-wrap">
                            {message.text
                              .split(/(@\S+|https?:\/\/\S+)/)
                              .map((part, index) => {
                                if (part.startsWith("@")) {
                                  // If it's a mention, create a link
                                  return (
                                    <a href={`/${part.slice(1)}`} key={index}>
                                      <strong>{part}</strong>
                                    </a>
                                  );
                                } else if (part.includes("muse.nofilter")) {
                                  // If it's a Muse post, create a link
                                  return (
                                    <a href={message.text} key={message.text}>
                                      <div className="flex items-center justify-center px-4 py-2 rounded-md bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold hover:from-purple-600 hover:to-pink-700 transition duration-300">
                                        <span>See Post</span>
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          className="h-5 w-5 ml-2"
                                          viewBox="0 0 20 20"
                                          fill="currentColor"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                                            clipRule="evenodd"
                                          />
                                        </svg>
                                      </div>
                                    </a>
                                    // <>Muse Post</>
                                  );
                                } else if (part.startsWith("http")) {
                                  // If it's a website link, create a link
                                  return (
                                    <a href={part} key={index}>
                                      <strong>{part}</strong>
                                    </a>
                                  );
                                } else {
                                  // Otherwise, render it as plain text
                                  return (
                                    <React.Fragment key={index}>
                                      {part}
                                    </React.Fragment>
                                  );
                                }
                              })}
                          </span>
                        ) : (
                          <div className="fg text-xl">{message.text}</div>
                        ))}
                    </div>
                    {isDropdownOpen && selectedMessage == message && (
                      <div
                        className="dropdown-menu  mt-4 flex"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{
                          opacity: isDropdownOpen ? 1 : 0,
                          height: isDropdownOpen ? "auto" : 0,
                        }}
                        transition={{
                          duration: 0.3,
                          ease: "easeInOut",
                        }}
                        layoutTransition={{
                          type: "tween",
                          duration: 0.3,
                          ease: "easeInOut",
                        }}
                      >
                        <button onClick={() => handlemessagereply(message)}>
                          <Image
                            className="h-5 w-5 rounded-full"
                            src="/icons/reply.png"
                            height={50}
                            width={50}
                            alt=""
                          />
                        </button>

                        <button
                          className=" ml-2 dropdown-item mr-2 disabled:hidden"
                          onClick={() => handleCopy(message.text)}
                          disabled={
                            message.type == "media" || message.type == "gif"
                          }
                        >
                          <Image
                            className="w-5 h-5 "
                            src="/icons/copy.png"
                            height={50}
                            width={50}
                            alt="delete"
                          />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      {/* ... */}
    </div>
  );
};

export default MyComponent;
