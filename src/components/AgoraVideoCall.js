// CallComponent.js
"use client"
import React, { useState, useEffect, useRef } from 'react';
import { doc, getFirestore, onSnapshot, addDoc, collection, deleteDoc, updateDoc } from 'firebase/firestore';
import { app } from '../lib/firebase/firebaseConfig';
import AgoraRTC from 'agora-rtc-sdk-ng';

const CallComponent = ({ currentUserId }) => {
  const [localTracks, setLocalTracks] = useState([]);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [remoteUserId, setRemoteUserId] = useState('');
  const [channelName, setChannelName] = useState('');
  const [callState, setCallState] = useState('idle'); // idle, ringing, incoming, active
  const db = getFirestore(app);
  const client = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      client.current = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

      const handleUserPublished = async (user, mediaType) => {
        try {
          await client.current.subscribe(user, mediaType);
          setRemoteUsers((prevUsers) => [...prevUsers, user]);
          if (mediaType === 'video') {
            user.videoTrack.play(`remote-video-${user.uid}`);
          }
          if (mediaType === 'audio') {
            user.audioTrack.play();
          }
        } catch (error) {
          console.error('Error subscribing to user:', error);
        }
      };

      const handleUserUnpublished = (user) => {
        setRemoteUsers((prevUsers) => prevUsers.filter((u) => u.uid !== user.uid));
      };

      client.current.on('user-published', handleUserPublished);
      client.current.on('user-unpublished', handleUserUnpublished);

      const callsRef = collection(db, 'calls');
      const unsubscribe = onSnapshot(callsRef, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const { users, status } = change.doc.data();
            if (users.includes(currentUserId) && users.length === 2) {
              const remoteUid = users.find((uid) => uid !== currentUserId);
              setRemoteUserId(remoteUid);
              setChannelName(change.doc.id);
              if (status === 'ringing') {
                setCallState('incoming');
              } else if (status === 'active') {
                setCallState('active');
              }
            }
          }
        });
      });

      return () => {
        localTracks.forEach((track) => track.close());
        client.current.leave().catch((error) => console.error('Error leaving the channel:', error));
        unsubscribe();
      };
    }
  }, [currentUserId, db, localTracks]);

  const initiateCall = async (remoteUserId) => {
    if (remoteUserId) {
      try {
        const channelDoc = await addDoc(collection(db, 'calls'), {
          users: [currentUserId, remoteUserId],
          status: 'ringing'
        });
        setChannelName(channelDoc.id);
        setRemoteUserId(remoteUserId);
        setCallState('ringing');
      } catch (error) {
        console.error('Error initiating call:', error);
      }
    }
  };

  const startCall = async (channel) => {
    if (client.current.connectionState !== 'CONNECTED') {
      console.error('Client is not connected. Cannot start call.');
      return;
    }

    try {
      await client.current.join('YOUR_AGORA_APP_ID', channel, null, currentUserId);
      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      setLocalTracks([audioTrack, videoTrack]);
      await client.current.publish([audioTrack, videoTrack]);
      videoTrack.play('local-player');
    } catch (error) {
      console.error('Error starting call:', error);
    }
  };

  const acceptCall = async () => {
    if (remoteUserId) {
      try {
        const callDoc = doc(db, 'calls', channelName);
        await updateDoc(callDoc, { status: 'active' });
        setCallState('active');
        await startCall(channelName);
      } catch (error) {
        console.error('Error accepting call:', error);
      }
    }
  };

  const rejectCall = async () => {
    try {
      const callDoc = doc(db, 'calls', channelName);
      await deleteDoc(callDoc);
      setCallState('idle');
      setRemoteUserId('');
      setChannelName('');
    } catch (error) {
      console.error('Error rejecting call:', error);
    }
  };

  const endCall = async () => {
    try {
      const callDoc = doc(db, 'calls', channelName);
      await deleteDoc(callDoc);
      await client.current.leave();
      localTracks.forEach((track) => track.close());
      setLocalTracks([]);
      setRemoteUsers([]);
      setCallState('idle');
      setRemoteUserId('');
      setChannelName('');
    } catch (error) {
      console.error('Error ending call:', error);
    }
  };

  return (
    <div>
      {callState === 'idle' && (
        <>
          <input
            type="text"
            placeholder="Enter user ID to call"
            value={remoteUserId}
            onChange={(e) => setRemoteUserId(e.target.value)}
          />
          <button onClick={() => initiateCall(remoteUserId)}>Call</button>
        </>
      )}
      {callState === 'ringing' && (
        <p>Calling {remoteUserId}...</p>
      )}
      {callState === 'incoming' && (
        <>
          <p>Incoming call from {remoteUserId}</p>
          <button onClick={acceptCall}>Accept</button>
          <button onClick={rejectCall}>Reject</button>
        </>
      )}
      {callState === 'active' && (
        <>
          <div id="local-player" style={{ width: '320px', height: '240px' }}></div>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {remoteUsers.map((user) => (
              <div key={user.uid} id={`remote-video-${user.uid}`} style={{ width: '320px', height: '240px' }}></div>
            ))}
          </div>
          <button onClick={endCall}>End Call</button>
        </>
      )}
    </div>
  );
};

export default CallComponent;
