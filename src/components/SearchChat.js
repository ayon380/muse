import React, { useState } from "react";

import { getFirestore } from "firebase/firestore";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
const SearchChat = ({
  setsearchopen,
  userdata,
  setChatwindow,
  chats,
  usernames,
}) => {
  const db = getFirestore();
  const [searchtext, setSearchtext] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const router = useRouter();
  // Function to search users or titles in chats
  const searchUsers = () => {
    const searchTextLower = searchtext.toLowerCase(); // Convert search text to lowercase for case-insensitive search
    const filteredChats = chats.filter((chat) => {
      // Check if the chat title matches the search text
      if (chat.title && chat.title.toLowerCase().includes(searchTextLower)) {
        return true;
      }

      // Check if any participant's username matches the search text
      if (chat.participants && chat.participants.length > 0) {
        for (const participant of chat.participants) {
          const participantUsername = usernames[participant];
          if (
            participantUsername &&
            participantUsername.toLowerCase().includes(searchTextLower)
          ) {
            return true;
          }
        }
      }

      return false;
    });

    setSearchResults(filteredChats);
  };
  React.useEffect(() => {
    if (searchtext.length > 0) {
      searchUsers();
    } else {
      setSearchResults([]);
    }
  }, [searchtext]);
  const handleClick = (chat) => {
    if (chat.type == "p")
      router.push(
        `/feed/messages?roomid=${chat.roomid}&chattype=p&chatwindow=${
          chat.participants[0] == userdata.uid
            ? chat.participants[1]
            : chat.participants[0]
        }`
      );
    else
      router.push(
        `/feed/messages?roomid=${chat.roomid}&chattype=g&chatwindow=${chat.title}`
      );
    setsearchopen(false);
  };

  return (
    <div className="relative">
      <Toaster />
      <div className="fixed inset-0 text-black z-50 flex items-center justify-center">
        <div className="absolute inset-0 rounded-2xl bg-white bg-clip-padding backdrop-filter backdrop-blur-3xl bg-opacity-20 shadow-2xl border-1 border-black h-full"></div>
        <div className="bg-white w-96 p-8 rounded-xl shadow-2xl relative z-10">
          <div className="ser">
            <input
              className=" h-12 text-2xl p-2 rounded-2xl focus:rounded-t-2xl focus:rounded-b-none placeholder-italic placeholder:text-white   bg-gray-300 text-white border-black transition-all duration-300 outline-none shadow-2xl hover:shadow-3xl focus:shadow-3xl  hover:bg-gray-400 focus:bg-gray-400"
              type="text"
              value={searchtext}
              onChange={(e) => setSearchtext(e.target.value)}
              placeholder="Search"
            />

            {/* Render search results only if there are results and search text is not empty */}
            {searchResults.length > 0 && searchtext.length > 0 && (
              <div className="search-results cursor-pointer absolute text-black w-full bg-white rounded-b-2xl z-10 ">
                <ul>
                  {searchResults.map((chat) => (
                    <div onClick={() => handleClick(chat)} key={chat.roomid}>
                      <li>
                        {chat.type == "p"
                          ? chat.participants[0] == userdata.uid
                            ? usernames[chat.participants[1]].userName
                            : usernames[chat.participants[0]].userName
                          : chat.title}
                      </li>
                    </div>
                  ))}
                </ul>
              </div>
            )}
            <button onClick={() => setsearchopen(false)}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchChat;
