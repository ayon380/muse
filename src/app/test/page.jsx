"use client";
import React, { useState, useRef, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import useInfiniteScroll from "react-easy-infinite-scroll-hook";
const dummyData = [
  { id: "message-1", text: "Hello" },
  { id: "message-2", text: "How are you?" },
  { id: "message-3", text: "I'm doing great, thanks!" },
  { id: "message-4", text: "That's good to hear." },
  { id: "message-5", text: "What are your plans for today?" },
  { id: "message-6", text: "I'm going to work on a new project." },
  { id: "message-7", text: "Sounds interesting!" },
  { id: "message-8", text: "Yes, I'm excited about it." },
  { id: "message-9", text: "Good luck with that!" },
  { id: "message-10", text: "Thank you!" },
  { id: "message-1", text: "Hello" },
  { id: "message-2", text: "How are you?" },
  { id: "message-3", text: "I'm doing great, thanks!" },
  { id: "message-4", text: "That's good to hear." },
  { id: "message-5", text: "What are your plans for today?" },
  { id: "message-6", text: "I'm going to work on a new project." },
  { id: "message-7", text: "Sounds interesting!" },
  { id: "message-8", text: "Yes, I'm excited about it." },
  { id: "message-9", text: "Good luck with that!" },
  { id: "message-10", text: "Thank you!" },
  { id: "message-1", text: "Hello" },
  { id: "message-2", text: "How are you?" },
  { id: "message-3", text: "I'm doing great, thanks!" },
  { id: "message-4", text: "That's good to hear." },
  { id: "message-5", text: "What are your plans for today?" },
  { id: "message-6", text: "I'm going to work on a new project." },
  { id: "message-7", text: "Sounds interesting!" },
  { id: "message-8", text: "Yes, I'm excited about it." },
  { id: "message-9", text: "Good luck with that!" },
  { id: "message-10", text: "Thank you!" },
  { id: "message-1", text: "Hello" },
  { id: "message-2", text: "How are you?" },
  { id: "message-3", text: "I'm doing great, thanks!" },
  { id: "message-4", text: "That's good to hear." },
  { id: "message-5", text: "What are your plans for today?" },
  { id: "message-6", text: "I'm going to work on a new project." },
  { id: "message-7", text: "Sounds interesting!" },
  { id: "message-8", text: "Yes, I'm excited about it." },
  { id: "message-9", text: "Good luck with that!" },
  { id: "message-10", text: "Thank you!" },
  { id: "message-1", text: "Hello" },
  { id: "message-2", text: "How are you?" },
  { id: "message-3", text: "I'm doing great, thanks!" },
  { id: "message-4", text: "That's good to hear." },
  { id: "message-5", text: "What are your plans for today?" },
  { id: "message-6", text: "I'm going to work on a new project." },
  { id: "message-7", text: "Sounds interesting!" },
  { id: "message-8", text: "Yes, I'm excited about it." },
  { id: "message-9", text: "Good luck with that!" },
  { id: "message-10", text: "Thank you!" },
  { id: "message-1", text: "Hello" },
  { id: "message-2", text: "How are you?" },
  { id: "message-3", text: "I'm doing great, thanks!" },
  { id: "message-4", text: "That's good to hear." },
  { id: "message-5", text: "What are your plans for today?" },
  { id: "message-6", text: "I'm going to work on a new project." },
  { id: "message-7", text: "Sounds interesting!" },
  { id: "message-8", text: "Yes, I'm excited about it." },
  { id: "message-9", text: "Good luck with that!" },
  { id: "message-10", text: "Thank you!" },
  { id: "message-1", text: "Hello" },
  { id: "message-2", text: "How are you?" },
  { id: "message-3", text: "I'm doing great, thanks!" },
  { id: "message-4", text: "That's good to hear." },
  { id: "message-5", text: "What are your plans for today?" },
  { id: "message-6", text: "I'm going to work on a new project." },
  { id: "message-7", text: "Sounds interesting!" },
  { id: "message-8", text: "Yes, I'm excited about it." },
  { id: "message-9", text: "Good luck with that!" },
  { id: "message-10", text: "Thank you!" },
  { id: "message-1", text: "Hello" },
  { id: "message-2", text: "How are you?" },
  { id: "message-3", text: "I'm doing great, thanks!" },
  { id: "message-4", text: "That's good to hear." },
  { id: "message-5", text: "What are your plans for today?" },
  { id: "message-6", text: "I'm going to work on a new project." },
  { id: "message-7", text: "Sounds interesting!" },
  { id: "message-8", text: "Yes, I'm excited about it." },
  { id: "message-9", text: "Good luck with that!" },
  { id: "message-10", text: "Thank you!" },
  { id: "message-1", text: "Hello" },
  { id: "message-2", text: "How are you?" },
  { id: "message-3", text: "I'm doing great, thanks!" },
  { id: "message-4", text: "That's good to hear." },
  { id: "message-5", text: "What are your plans for today?" },
  { id: "message-6", text: "I'm going to work on a new project." },
  { id: "message-7", text: "Sounds interesting!" },
  { id: "message-8", text: "Yes, I'm excited about it." },
  { id: "message-9", text: "Good luck with that!" },
  { id: "message-10", text: "Thank you!" },
  { id: "message-1", text: "Hello" },
  { id: "message-2", text: "How are you?" },
  { id: "message-3", text: "I'm doing great, thanks!" },
  { id: "message-4", text: "That's good to hear." },
  { id: "message-5", text: "What are your plans for today?" },
  { id: "message-6", text: "I'm going to work on a new project." },
  { id: "message-7", text: "Sounds interesting!" },
  { id: "message-8", text: "Yes, I'm excited about it." },
  { id: "message-9", text: "Good luck with that!" },
  { id: "message-10", text: "Thank you!" },
  { id: "message-1", text: "Hello" },
  { id: "message-2", text: "How are you?" },
  { id: "message-3", text: "I'm doing great, thanks!" },
  { id: "message-4", text: "That's good to hear." },
  { id: "message-5", text: "What are your plans for today?" },
  { id: "message-6", text: "I'm going to work on a new project." },
  { id: "message-7", text: "Sounds interesting!" },
  { id: "message-8", text: "Yes, I'm excited about it." },
  { id: "message-9", text: "Good luck with that!" },
  { id: "message-10", text: "Thank you!" },
  { id: "message-1", text: "Hello" },
  { id: "message-2", text: "How are you?" },
  { id: "message-3", text: "I'm doing great, thanks!" },
  { id: "message-4", text: "That's good to hear." },
  { id: "message-5", text: "What are your plans for today?" },
  { id: "message-6", text: "I'm going to work on a new project." },
  { id: "message-7", text: "Sounds interesting!" },
  { id: "message-8", text: "Yes, I'm excited about it." },
  { id: "message-9", text: "Good luck with that!" },
  { id: "message-10", text: "Thank you!" },
  { id: "message-1", text: "Hello" },
  { id: "message-2", text: "How are you?" },
  { id: "message-3", text: "I'm doing great, thanks!" },
  { id: "message-4", text: "That's good to hear." },
  { id: "message-5", text: "What are your plans for today?" },
  { id: "message-6", text: "I'm going to work on a new project." },
  { id: "message-7", text: "Sounds interesting!" },
  { id: "message-8", text: "Yes, I'm excited about it." },
  { id: "message-9", text: "Good luck with that!" },
  { id: "message-10", text: "Thank you!" },
  { id: "message-1", text: "Hello" },
  { id: "message-2", text: "How are you?" },
  { id: "message-3", text: "I'm doing great, thanks!" },
  { id: "message-4", text: "That's good to hear." },
  { id: "message-5", text: "What are your plans for today?" },
  { id: "message-6", text: "I'm going to work on a new project." },
  { id: "message-7", text: "Sounds interesting!" },
  { id: "message-8", text: "Yes, I'm excited about it." },
  { id: "message-9", text: "Good luck with that!" },
  { id: "message-10", text: "Thank you!" },
  { id: "message-1", text: "Hello" },
  { id: "message-2", text: "How are you?" },
  { id: "message-3", text: "I'm doing great, thanks!" },
  { id: "message-4", text: "That's good to hear." },
  { id: "message-5", text: "What are your plans for today?" },
  { id: "message-6", text: "I'm going to work on a new project." },
  { id: "message-7", text: "Sounds interesting!" },
  { id: "message-8", text: "Yes, I'm excited about it." },
  { id: "message-9", text: "Good luck with that!" },
  { id: "message-10", text: "Thank you!" },
  { id: "message-1", text: "Hello" },
  { id: "message-2", text: "How are you?" },
  { id: "message-3", text: "I'm doing great, thanks!" },
  { id: "message-4", text: "That's good to hear." },
  { id: "message-5", text: "What are your plans for today?" },
  { id: "message-6", text: "I'm going to work on a new project." },
  { id: "message-7", text: "Sounds interesting!" },
  { id: "message-8", text: "Yes, I'm excited about it." },
  { id: "message-9", text: "Good luck with that!" },
  { id: "message-10", text: "Thank you!" },
  { id: "message-1", text: "Hello" },
  { id: "message-2", text: "How are you?" },
  { id: "message-3", text: "I'm doing great, thanks!" },
  { id: "message-4", text: "That's good to hear." },
  { id: "message-5", text: "What are your plans for today?" },
  { id: "message-6", text: "I'm going to work on a new project." },
  { id: "message-7", text: "Sounds interesting!" },
  { id: "message-8", text: "Yes, I'm excited about it." },
  { id: "message-9", text: "Good luck with that!" },
  { id: "message-10", text: "Thank you!" },
  { id: "message-1", text: "Hello" },
  { id: "message-2", text: "How are you?" },
  { id: "message-3", text: "I'm doing great, thanks!" },
  { id: "message-4", text: "That's good to hear." },
  { id: "message-5", text: "What are your plans for today?" },
  { id: "message-6", text: "I'm going to work on a new project." },
  { id: "message-7", text: "Sounds interesting!" },
  { id: "message-8", text: "Yes, I'm excited about it." },
  { id: "message-9", text: "Good luck with that!" },
  { id: "message-10", text: "Thank you!" },
  //generate more dummy messages

  // Add more dummy messages as needed
];

const MessageChat = () => {
  const [items, setItems] = useState(dummyData.slice(0, 10).reverse());
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState({
    up: true,
    down: false,
  });

  const loadMoreItems = () => {
    setIsLoading(true);
    setTimeout(() => {
      const remainingItems = dummyData.slice(items.length).reverse();
      const newItems = remainingItems.slice(0, 10);
      setItems((prevItems) => [...newItems, ...prevItems]);
      setHasMore((prevHasMore) => ({
        ...prevHasMore,
        up: remainingItems.length > 10,
      }));
      setIsLoading(false);
    }, 1000);
  };

  useEffect(() => {
    if (!hasMore.up) {
      const remainingItems = dummyData.slice(items.length);
      setHasMore((prevHasMore) => ({
        ...prevHasMore,
        up: remainingItems.length > 0,
      }));
    }
  }, [items, hasMore.up]);

  const ref = useInfiniteScroll({
    next: loadMoreItems,
    rowCount: items.length,
    hasMore,
    reverse: { column: true },
  });

  return (
    <div className="ee">
      <div
        ref={ref}
        style={{
          height: 150,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column-reverse",
        }}
      >
        {items.map((item, i) => (
          <div key={i}>{item.text}</div>
        ))}
        {isLoading && <div>Loading...</div>}
      </div>
    </div>
  );
};

export default MessageChat;
