import React, { useState, useCallback, useEffect, useRef, memo } from 'react';

const MessageInput = memo(({ messagetext, setMessagetext, sendMesage }) => {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Type a message..."
        className="w-full py-3 px-4 pr-12 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-3xl outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition duration-200"
        value={messagetext}
        onChange={(e) => setMessagetext(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            sendMesage();
          }
        }}
      />
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
        <button
          onClick={sendMesage}
          disabled={messagetext.trim().length === 0}
          className="p-2 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
          aria-label="Send message"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </div>
    </div>
  );
});
MessageInput.displayName = 'MessageInput';
export default MessageInput;
