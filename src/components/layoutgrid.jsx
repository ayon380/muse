"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";
import Image from "next/image";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from "react-responsive-carousel";

export const LayoutGrid = ({ cards, type }) => {
  const [selected, setSelected] = useState(null);
  const [lastSelected, setLastSelected] = useState(null);
  console.log(cards);
  const handleClick = (card) => {
    setLastSelected(selected);
    setSelected(card);
  };

  const handleOutsideClick = () => {
    setLastSelected(null);
    setSelected(null);
  };

  return (
    <div className="w-full h-full p-10 grid grid-cols-1 md:grid-cols-3 max-w-7xl mx-auto gap-4">
      {cards.map((card, idx) => (
        <div key={card.id} className={cn("")}>
          <motion.div
            onClick={() => handleClick(card)}
            className={cn(
              // card.className,
              "relative overflow-hidden",
              selected?.id === card.id
                ? "rounded-lg cursor-pointer absolute inset-0 backdrop-filter backdrop-blur-3xl h-1/2 w-full md:w-1/2 m-auto z-20 flex justify-center items-center flex-wrap flex-col"
                : lastSelected?.id === card.id
                ? "z-40 bg-white rounded-xl h-full w-full"
                : "bg-white rounded-xl h-full w-full"
            )}
            layout
          >
            {selected?.id === card.id && (
              <SelectedCard selected={selected} type={type} />
            )}
            <BlurImage card={card} type={type} isSelected={selected?.id === card.id} />
          </motion.div>
        </div>
      ))}
      <motion.div
        onClick={handleOutsideClick}
        className={cn(
          "absolute h-full w-full left-0 top-0 bg-black  blur-3xl rounded-2xl opacity-0 z-10",
          selected?.id ? "pointer-events-auto" : "pointer-events-none"
        )}
        animate={{ opacity: selected?.id ? 0.3 : 0 }}
      />
    </div>
  );
};
function isVideoFile(url) {
  // List of common video file extensions
  const videoExtensions = ["mp4", "mov", "avi", "mkv", "wmv", "flv", "webm"];

  // Check if the URL contains any of the video file extensions
  const hasVideoExtension = videoExtensions.some((extension) =>
    url.includes(`.${extension}`)
  );

  // Check if the URL contains a query parameter indicating a video file
  const hasVideoQueryParameter = url.match(
    /\.(mp4|mov|avi|mkv|wmv|flv|webm)\?[\w=&-]+/
  );

  // Return true if either condition is met
  return hasVideoExtension || hasVideoQueryParameter;
}

const BlurImage = ({ card, type,isSelected }) => {
  const [loaded, setLoaded] = useState(false);
  // console.log(card.mediaFiles);
  return (
    <>
      {type == "posts" && (
        <div className="hj">
          {isVideoFile(card.mediaFiles[0]) ? (
            <video
              src={card.mediaFiles[0]}
              className={cn(
                "object-cover object-top absolute inset-0 h-full w-full transition duration-200"
                // loaded ? "blur-none" : "blur-md"
              )}
              alt="thumbnail"
            />
          ) : (
            <Image
              src={card.mediaFiles[0]}
              alt="thumbnail"
              layout="fill"
              objectFit="cover"
              className={cn(
                "object-cover object-top absolute inset-0 h-full w-full  transition duration-200"
                // loaded ? "blur-none" : "blur-md"
              )}
              onLoad={() => setLoaded(true)}
            />
          )}
        </div>
      )}
      {type == "reels" && (
        <div className="w-96 h-96">
          <video
            src={card.mediaFiles}
            className={cn(
              "object-cover object-top absolute inset-0 h-full w-full transition duration-200"
              // loaded ? "blur-none" : "blur-md"
            )}
            alt="thumbnail"
            controls={isSelected}
          />
        </div>
      )}
    </>
  );
};

const SelectedCard = ({ selected, type }) => {
  const [state, setState] = useState(0);
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 100,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.3,
        ease: "easeInOut",
      }}
      className=" h-auto w-auto sdfss flex flex-col backdrop-filter backdrop-blur-3xl justify-end rounded-lg shadow-2xl relative z-[60]"
    >
      {/* <div className="absolute inset-0 z-10 backdrop-filter backdrop-blur-3xl"></div> */}

      {type == "posts" && (
        <div className="oj backdrop-filter  backdrop-blur-2xl rounded-xl h-96  w-96 z-50 ">
          <Carousel autoFocus autoPlay infiniteLoop>
            {selected?.mediaFiles.map((media) => (
              <>
                {isVideoFile(media) ? (
                  <>
                    <video
                      src={media}
                      controls
                      className="h-96 rounded-xl w-96"
                    />
                  </>
                ) : (
                  <>
                    <Image
                      src={media}
                      height="500"
                      width="500"
                      alt=""
                      className="rounded-xl"
                    />
                  </>
                )}
              </>
            ))}
          </Carousel>
        </div>
      )}

      <motion.div
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 0.6,
        }}
        className="absolute inset-0 h-full w-full  z-10"
      />
      <motion.div
        initial={{
          opacity: 0,
          y: 100,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
        }}
        className="relative px-8 pb-4 z-[70]"
      >
        {/* <div className=" w-full text-black bg-transparent relative">
          <h1>{selected?.caption}</h1>
          <p>Likes: {selected?.likecount}</p>
          <p>Comments: {selected?.commentcount}</p>
          <p>Hashtags: {selected?.hashtags.join(", ")}</p>
          <p>Tagged Users: {selected?.taggedUsers.join(", ")}</p>
        </div> */}
      </motion.div>
    </motion.div>
  );
};
