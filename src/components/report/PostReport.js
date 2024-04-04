import React, { useState } from 'react';
import { motion } from 'framer-motion';

const PostReport = ({ username, postId }) => {
  const [reason, setReason] = useState('');
  const [evidence, setEvidence] = useState([]);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log('Reason:', reason);
    console.log('Evidence:', evidence);
    console.log('Description:', description);
    console.log('Category:', category);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex justify-center items-center"
    >
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-center text-purple-600">
          Post Report for {username}&apos;s post {postId}
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="reason" className="block font-medium mb-2 text-gray-700">
              Reason for Report
            </label>
            <textarea
              id="reason"
              rows="4"
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter reason for reporting this post"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="evidence" className="block font-medium mb-2 text-gray-700">
              Evidence
            </label>
            <input
              type="file"
              id="evidence"
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              multiple
              onChange={(e) => setEvidence(Array.from(e.target.files))}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block font-medium mb-2 text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              rows="4"
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter a detailed description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label htmlFor="category" className="block font-medium mb-2 text-gray-700">
              Category
            </label>
            <select
              id="category"
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select a category</option>
              <option value="spam">Spam</option>
              <option value="harassment">Harassment</option>
              <option value="hate-speech">Hate Speech</option>
              <option value="violence">Violence</option>
              <option value="other">Other</option>
            </select>
          </div>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-3 px-6 rounded-md bg-purple-600 text-white font-bold transition-colors duration-300 hover:bg-purple-700"
          >
            Submit Report
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
};

export default PostReport;