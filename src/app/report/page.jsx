"use client";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import React, { useState } from "react";
import dynamic from "next/dynamic";
const UserReport = dynamic(() => import("@/components/report/UserReport"));
const PostReport = dynamic(() => import("@/components/report/PostReport"));
const ReelReport = dynamic(() => import("@/components/report/ReelReport"));
const ReportPage = () => {
  const searchParams = useSearchParams();

  const username = searchParams.get("username");
  const postId = searchParams.get("postid");
  const reelId = searchParams.get("reelid");

  const renderReport = () => {
    if (username && postId) {
      return <PostReport username={username} postId={postId} />;
    } else if (username && reelId) {
      return <ReelReport username={username} reelId={reelId} />;
    } else if (username) {
      return <UserReport username={username} />;
    } else {
      return <div>Please provide valid parameters.</div>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className=" mx-auto maindiv p-4 h-dvh overflow-y-auto"
    >
      <div className="muse font-lucy text-center text-5xl md:text-8xl my-4 md:my-10 font-bold text-opacity-60">Muse</div>
      <div className="dds text-center text-sm mb-10">Muse: Where creativity thrives, and your safety is our utmost priority.</div>
      {renderReport()}
    </motion.div>
  );
};

export default ReportPage;
