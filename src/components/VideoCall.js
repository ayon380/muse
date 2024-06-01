import { useEffect, useRef, useState } from "react";
import Peer from "peerjs";
import { getAuth } from "firebase/auth";
import {
  doc,
  getFirestore,
  setDoc,
  onSnapshot,
  deleteDoc,
} from "firebase/firestore";
import app from "@/lib/firebase/firebaseConfig";
import {
  FaPhone,
  FaVideo,
  FaMicrophone,
  FaPhoneSlash,
  FaMicrophoneSlash,
  FaVideoSlash,
} from "react-icons/fa";

const CallComponent = ({ curuserid, userId }) => {
  const [peer, setPeer] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callState, setCallState] = useState("idle");
  const [callerId, setCallerId] = useState("");
  const [notification, setNotification] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const currentCallRef = useRef(null);
  const db = getFirestore(app);

  useEffect(() => {
    const peer = new Peer(userId);

    peer.on("open", (id) => {
      console.log("Peer connected with ID:", id);
      listenForCalls(id);
    });

    peer.on("call", (call) => {
      console.log("Incoming call from", call.peer);
      setCallState("incoming");
      setCallerId(call.peer);
      currentCallRef.current = call;
    });

    peer.on("close", () => {
      handleUserLeft();
    });

    setPeer(peer);

    return () => {
      peer.destroy();
    };
  }, [userId]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const listenForCalls = (peerId) => {
    const callsRef = doc(db, "calls", peerId);
    const unsubscribe = onSnapshot(callsRef, (snapshot) => {
      const data = snapshot.data();
      if (data && data.callerPeerId && data.callerPeerId !== peerId) {
        console.log("Call incoming from:", data.callerPeerId);
        setCallState("incoming");
        setCallerId(data.callerPeerId);
      }
    });

    return unsubscribe;
  };

  const initiateCall = (remoteUserId) => {
    navigator.mediaDevices
      .getUserMedia({ video: { width: 1280, height: 720 }, audio: true })
      .then((stream) => {
        localStreamRef.current = stream;
        const call = peer.call(remoteUserId, stream);
        if (!call) {
          console.error("Failed to establish call");
          return;
        }
        currentCallRef.current = call;
        setCallState("ringing");

        call.on("stream", (remoteStream) => {
          console.log("Received remote stream");
          setRemoteStream(remoteStream);
          setCallState("active");
        });

        call.on("close", () => {
          console.log("Call closed");
          handleUserLeft();
        });

        setDoc(doc(db, "calls", remoteUserId), {
          callerPeerId: peer.id,
        });
      })
      .catch((err) => {
        console.error("Failed to get local stream", err);
        setNotification("Failed to access your camera and microphone.");
        setTimeout(() => setNotification(""), 3000);
      });
  };

  const acceptCall = () => {
    if (!callerId) {
      console.error("No callerId available to accept the call");
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ video: { width: 1280, height: 720 }, audio: true })
      .then((stream) => {
        localStreamRef.current = stream;
        const call = currentCallRef.current;
        if (!call) {
          console.error("No call found to accept");
          return;
        }
        call.answer(stream);
        call.on("stream", (remoteStream) => {
          console.log("Received remote stream");
          setRemoteStream(remoteStream);
          setCallState("active");
        });

        call.on("close", () => {
          console.log("Call closed");
          handleUserLeft();
        });
      })
      .catch((err) => {
        console.error("Failed to get local stream", err);
        setNotification("Failed to access your camera and microphone.");
        setTimeout(() => setNotification(""), 3000);
      });
  };

  const rejectCall = async () => {
    setCallState("idle");
    await clearCallRecord(callerId);
    setCallerId("");
  };

  const endCall = async () => {
    const call = currentCallRef.current;
    if (call) {
      call.close();
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    cleanupCall();
    await clearCallRecord(callerId);
    setCallerId("");
  };

  const handleUserLeft = () => {
    setNotification("The user has left the call.");
    setTimeout(() => setNotification(""), 3000);
    cleanupCall();
  };

  const cleanupCall = () => {
    setRemoteStream(null);
    setCallState("idle");
    currentCallRef.current = null;
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  const clearCallRecord = async (callerId) => {
    if (callerId) {
      await deleteDoc(doc(db, "calls", curuserid));
      await deleteDoc(doc(db, "calls", callerId));
      console.log("Call record deleted for callerId:", curuserid);
    }
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks()[0].enabled = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks()[0].enabled = !isVideoOn;
      setIsVideoOn(!isVideoOn);
    }
  };

  return (
    <div className="p-20 text-center">
      <h2 className="text-center">Video Call</h2>
      {notification && <p className="text-red-500">{notification}</p>}
      <video
        className="w-full h-full object-cover mb-20"
        ref={remoteVideoRef}
        autoPlay
        playsInline
      />

      {callState === "idle" && (
        <div>
          <input
            type="text"
            placeholder="Enter user ID to call"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                initiateCall(e.target.value);
              }
            }}
            className="p-2 w-80"
          />
          <button
            onClick={() => initiateCall(e.target.value)}
            className="p-2 m-2"
          >
            <FaPhone /> Call
          </button>
        </div>
      )}
      {callState === "incoming" && (
        <div>
          <p>Incoming call from {callerId}</p>
          <button
            onClick={acceptCall}
            className="p-2 m-2"
          >
            <FaPhone /> Accept
          </button>
          <button
            onClick={rejectCall}
            className="p-2 m-2"
          >
            <FaPhoneSlash /> Reject
          </button>
        </div>
      )}
      {callState === "ringing" && <p>Ringing...</p>}
      {callState === "active" && (
        <div>
          <button
            onClick={endCall}
            className="p-2 m-2"
          >
            <FaPhoneSlash /> End Call
          </button>
          <button
            onClick={toggleMute}
            className="p-2 m-2"
          >
            {isMuted ? <FaMicrophone /> : <FaMicrophoneSlash />}{" "}
            {isMuted ? "Unmute" : "Mute"}
          </button>
          <button
            onClick={toggleVideo}
            className="p-2 m-2"
          >
            {isVideoOn ? <FaVideo /> : <FaVideoSlash />}{" "}
            {isVideoOn ? "Turn Video Off" : "Turn Video On"}
          </button>
        </div>
      )}
    </div>
  );
};

export default CallComponent;
