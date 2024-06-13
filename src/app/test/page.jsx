// components/LikeButton.jsx
"use client"
import { useState, useCallback } from 'react';

const LikeButton = ({ postId, initialLikeCount }) => {
  const [likeCount, setLikeCount] = useState(10);
  const [isLiked, setIsLiked] = useState(false);

  const toggleLike = useCallback(() => {
    const updatedLikeCount = isLiked ? likeCount - 1 : likeCount + 1;
    setLikeCount(updatedLikeCount);
    setIsLiked(!isLiked);
  }, [likeCount, isLiked]);

  return (
    <button onClick={toggleLike}>
      {isLiked ? 'Unlike' : 'Like'} ({likeCount})
    </button>
  );
};

export default LikeButton;