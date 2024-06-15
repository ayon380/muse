import React, { use, useState, useEffect } from "react";
import { getFirestore, collection, query, where } from "firebase/firestore";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import BottomSheet from "./BottomSheet";
import Image from "next/image";
const SearchChat = ({
  setsearchopen,
  userdata,
  usermetadata,
  chats,
  enqueueUserMetadata,
}) => {
  const db = getFirestore();
  const [searchtext, setSearchtext] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const router = useRouter();
  const [chatmapd, setChatmap] = useState({});

  // Function to search users or titles in chats
  const PreProcess = () => {
    console.log("Preprocessing");
    let chatmap = {};
    chats.forEach((chat) => {
      if (chat.type == "p") {
        chatmap[
          chat.participants[0] == userdata.uid
            ? chat.participants[1]
            : chat.participants[0]
        ] = chat;
        enqueueUserMetadata(
          chat.participants[0] == userdata.uid
            ? chat.participants[1]
            : chat.participants[0]
        );
      } else {
        chatmap[chat.title] = chat;
      }
    });
    setChatmap(chatmap);
    console.log(chatmap);
  };
  const searchUsers = async () => {
    let results = [];
    console.log(chatmapd);
    for (let key in chatmapd) {
      const chat = chatmapd[key];
      console.log(chat);
      const isUserMatch =
        chat.type === "p" &&
        (usermetadata[key].userName
          .toLowerCase()
          .includes(searchtext.toLowerCase()) ||
          usermetadata[key].fullname
            .toLowerCase()
            .includes(searchtext.toLowerCase()));
      const isTitleMatch = chat.title
        .toLowerCase()
        .includes(searchtext.toLowerCase());

      if (isUserMatch || isTitleMatch) {
        results.push(chat);
      }
    }
    console.log(results);
    setSearchResults(results);
  };

  useEffect(() => {
    if (searchtext.length > 0) {
      searchUsers();
    } else {
      setSearchResults([]);
    }
  }, [searchtext]);

  useEffect(() => {
    PreProcess();
  }, []);

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

  const close = () => {
    setTimeout(() => {
      setsearchopen(false);
    }, 100);
  };

  return (
    <BottomSheet show={true} onClose={close} heading="Search Chats">
      <div className="ser p-5">
        <input
          className="h-12 w-full text-lg p-4 rounded-full dark:bg-feedheader dark:text-white placeholder-gray-400 bg-gray-200 text-gray-800 transition-all duration-300 outline-none shadow-md hover:shadow-lg focus:shadow-lg"
          type="text"
          value={searchtext}
          onChange={(e) => setSearchtext(e.target.value)}
          placeholder="Search Chats by Title, Username or Fullname"
        />
        {searchResults.length == 0 && searchtext.length > 0 && (
          <div className="search-results mt-4 bg-white dark:bg-feedheader text-center w-full rounded-lg shadow-md">
            <ul>
              <li className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer">
                <div>
                  <h3 className="text-lg font-semibold">No Chats Found</h3>
                </div>
              </li>
            </ul>
          </div>
        )}
        {searchResults.length > 0 && searchtext.length > 0 && (
          <div className="search-results mt-4 bg-white dark:bg-feedheader rounded-lg shadow-md">
            <ul>
              {searchResults.map((chat) => (
                <li
                  key={chat.roomid}
                  onClick={() => handleClick(chat)}
                  className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  <div className="mr-4 ">
                    <Image
                      alt=""
                      height={40}
                      width={40}
                      src={
                        chat.type === "p"
                          ? usermetadata[
                              chat.participants[0] === userdata.uid
                                ? chat.participants[1]
                                : chat.participants[0]
                            ].pfp
                          : chat.pfp
                      }
                      className="rounded-full w-10 h-10"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {chat.type === "p"
                        ? chat.participants[0] === userdata.uid
                          ? usermetadata[chat.participants[1]].userName
                          : usermetadata[chat.participants[0]].userName
                        : chat.title}
                    </h3>
                    {chat.type === "p" && (
                      <p className="text-gray-500">
                        {chat.participants[0] === userdata.uid
                          ? usermetadata[chat.participants[1]].fullName
                          : usermetadata[chat.participants[0]].fullName}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </BottomSheet>
  );
};

export default SearchChat;
