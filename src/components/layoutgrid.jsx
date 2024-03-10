"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";
import Image from "next/image";
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
                ? "rounded-lg cursor-pointer absolute inset-0 h-1/2 w-full md:w-1/2 m-auto z-50 flex justify-center items-center flex-wrap flex-col"
                : lastSelected?.id === card.id
                ? "z-40 bg-white rounded-xl h-full w-full"
                : "bg-white rounded-xl h-full w-full"
            )}
            layout
          >
            {selected?.id === card.id && <SelectedCard selected={selected} />}
            {card.id}
            <BlurImage card={card} type={type} />
          </motion.div>
        </div>
      ))}
      <motion.div
        onClick={handleOutsideClick}
        className={cn(
          "absolute h-full w-full left-0 top-0 bg-black opacity-0 z-10",
          selected?.id ? "pointer-events-auto" : "pointer-events-none"
        )}
        animate={{ opacity: selected?.id ? 0.3 : 0 }}
      />
    </div>
  );
};

const BlurImage = ({ card, type }) => {
  const [loaded, setLoaded] = useState(false);
  // console.log(card.mediaFiles);
  return (
    <>
      {type == "posts" && (
        <div className="hj">
          {card.mediaFiles.map((media) => (
            <div key={media}>
              {!media.includes("mp4") ? (
                <Image
                  src={media}
                  height="500"
                  width="500"
                  onLoad={() => setLoaded(true)}
                  className={cn(
                    "object-cover object-top absolute inset-0 h-full w-full transition duration-200",
                    loaded ? "blur-none" : "blur-md"
                  )}
                  alt="thumbnail"
                />
              ) : (
                <video src={media} className="h-96 w-96"/>
              )}
            </div>
          ))}
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
            controls
          />
        </div>
      )}
    </>
  );
};

const SelectedCard = ({ selected }) => {
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
      className="bg-transparent h-full w-full flex flex-col justify-end rounded-lg shadow-2xl relative z-[60]"
    >
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
        <div>
          <h1>{selected?.caption}</h1>
          <p>Likes: {selected?.likecount}</p>
          <p>Comments: {selected?.commentcount}</p>
          <p>Hashtags: {selected?.hashtags.join(", ")}</p>
          <p>Tagged Users: {selected?.taggedUsers.join(", ")}</p>
          {/* <p>Timestamp: {selected?.timestamp}</p> */}
        </div>
      </motion.div>
    </motion.div>
  );
};
