import React from 'react'
import { Toaster } from 'react-hot-toast'
import { useTheme } from 'next-themes'
import { useState } from 'react'

const ChatDetail = ({ onClose }) => {
  const { systemTheme, theme, setTheme } = useTheme();
  const currentTheme = theme === "system" ? systemTheme : theme;
  const [showModal, setShowModal] = useState(false);
  React.useEffect(() => {
    setShowModal(true);
  }, []);
  return (
    <div className="relative">
      <Toaster />
      <div
        className={`fixed inset-0 text-black z-50 flex items-center justify-center transition-all duration-500 ${showModal ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
      >
        <div
          className={`absolute inset-0 rounded-2xl ${currentTheme === "dark"
            ? "bg-gray-800 bg-clip-padding backdrop-filter backdrop-blur-3xl bg-opacity-20 shadow-2xl border-1 border-gray-600"
            : "bg-white bg-clip-padding backdrop-filter backdrop-blur-3xl bg-opacity-20 shadow-2xl border-1 border-black"
            } h-full transition-all duration-500 ${showModal ? "opacity-100" : "opacity-0"
            }`}
        />
        <div
          className={`${currentTheme === "dark"
            ? "bg-gray-800 text-white"
            : "bg-white text-black"
            } w-96 p-8 rounded-xl shadow-2xl relative z-10 transition-all duration-500 ${showModal ? "translate-y-0" : "translate-y-full"
            }`}
        >
Chat Info
          <button
            onClick={() => onClose()}
            className={`${currentTheme === "dark"
              ? "bg-gray-600 hover:bg-gray-500"
              : "bg-gray-400 hover:bg-gray-500"
              } text-white px-4 py-2 rounded-lg transition-colors duration-300`}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>

  )
}

export default ChatDetail