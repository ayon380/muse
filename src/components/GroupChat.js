import React, { useState } from "react";
import { collection, addDoc, doc, updateDoc, query, where, orderBy, limit, getDocs, arrayUnion } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import toast, { Toaster } from "react-hot-toast";

const GroupChat = ({ userdata, onClose }) => {
    const db = getFirestore();

    const [chatName, setChatName] = useState("");
    const [chatInfo, setChatInfo] = useState("");
    const [searchtext, setSearchtext] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [participants, setParticipants] = useState([userdata.userName]);
    // const [showModal, setShowModal] = useState(false);

    const searchUsers = async () => {
        try {
            const userNameQuery = query(
                collection(db, "username"),
                where("userName", ">=", searchtext),
                orderBy("userName"),
                limit(5)
            );
            const userNameSnapshot = await getDocs(userNameQuery);

            const fullNameQuery = query(
                collection(db, "username"),
                where("fullname", ">=", searchtext),
                orderBy("fullname"),
                limit(5)
            );
            const fullNameSnapshot = await getDocs(fullNameQuery);

            const results = [];
            userNameSnapshot.forEach((doc) => {
                results.push({ ...doc.data() });
            });
            fullNameSnapshot.forEach((doc) => {
                const data = doc.data();
                if (!results.some((result) => result.userName === data.userName)) {
                    results.push(data);
                }
            });

            setSearchResults(results);
        } catch (error) {
            console.error("Error searching users:", error);
        }
    };

    const handleAddParticipant = (participant) => {
        if (participants.includes(participant)) {
            return;
        }
        setParticipants([...participants, participant]);
    };

    const handleCreateGroupChat = async () => {
        try {
            if (participants.length <= 2 || chatName === "") {
                toast.error("Please add more than 2 participants and a chat name");
                return;
            }
            const chatRoomRef = collection(db, "messagerooms");
            const newChatRoom = {
                title: chatName,
                type: "g",
                participants: participants,
                messages: [],
                timestamp: Date.now(),
                info: chatInfo,
            };

            const docRef = await addDoc(chatRoomRef, newChatRoom);
            const id = docRef.id;
            await updateDoc(doc(db, "messagerooms", docRef.id), { roomid: docRef.id });
            participants.forEach(async (participant) => {
                const useref = doc(db, "chats", participant);
                await updateDoc(useref, { rooms: arrayUnion(id) });
            });

            setChatName("");
            toast.success("Group chat created successfully!");
            setChatInfo("");
            setParticipants([]);
        } catch (error) {
            toast.error("Error creating group chat");
            console.error("Error creating group chat:", error);
        }
    };

    React.useEffect(() => {
        if (searchtext.length > 0) {
            searchUsers();
        } else {
            setSearchResults([]);
        }
    }, [searchtext]);

    return (
        <div className="relative">
            <Toaster />
            <div className="fixed inset-0 text-black z-50 flex items-center justify-center">
                <div className="absolute inset-0 rounded-2xl bg-white bg-clip-padding backdrop-filter backdrop-blur-3xl bg-opacity-20 shadow-2xl border-1 border-black h-full"></div>
                <div className="bg-white w-96 p-8 rounded-xl shadow-2xl relative z-10">
                    <h2 className="text-xl font-bold mb-4">Create Group Chat</h2>
                    <label className="mb-4 block">
                        Chat Name:
                        <input type="text" value={chatName} onChange={(e) => setChatName(e.target.value)} className="border border-gray-300 rounded-lg p-2 w-full mt-2" />
                    </label>
                    <label className="mb-4 block">
                        Chat Info:
                        <input type="text" value={chatInfo} onChange={(e) => setChatInfo(e.target.value)} className="border border-gray-300 rounded-lg p-2 w-full mt-2" />
                    </label>
                    <label className="mb-4 block">
                        Add Participants:
                        {participants.map((participant) => (
                            <li key={participant}>{participant}</li>
                        ))}
                        <input
                            type="text"
                            value={searchtext}
                            onChange={(e) => setSearchtext(e.target.value)}
                            className="border border-gray-300 rounded-lg p-2 w-full mt-2"
                            placeholder="Search"
                        />
                        {searchResults.length > 0 && searchtext.length > 0 && (
                            <div className="search-results mt-2">
                                <ul>
                                    {searchResults.map((user) => (
                                        <div onClick={() => handleAddParticipant(user.userName)} key={user.id} className="cursor-pointer">
                                            <li>{user.userName}</li>
                                        </div>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </label>
                    <div className="flex justify-between">
                        <button onClick={handleCreateGroupChat} className="bg-purple-600 text-white px-4 py-2 rounded-lg">
                            Create Group Chat
                        </button>
                        <button onClick={() => onClose()} className="bg-gray-400 text-white px-4 py-2 rounded-lg">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default GroupChat;
