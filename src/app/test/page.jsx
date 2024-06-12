// pages/index.js or another page/component
"use client";
import { useState } from "react";
import Notification from "@/components/Notification";

const HomePage = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = () => {
    setNotifications([
      ...notifications,
      { id: Date.now(), message: "New notification!" },
    ]);
  };

  const removeNotification = (id) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  return (
    <div className="p-4">
      <button
        onClick={addNotification}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Add Notification
      </button>
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          unread={false}
          data={{
            message: {
              messagetype: "text",
              text: "hjgj",
              type: "message",
              chattype: "p",
              receiver: "U2liodNU7QfvpgauKoxhuockwZS2",
              sender: "yJgMUDH2IigJVMY2hum9Wb2hZew1",
              timestamp: 1718200674009,
              roomid: "0HjgktKETwOajZz6Au4H",
              id: "nDu4J9GtjrQLQ3f8fulW",
            },
          }}
          onDismiss={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

export default HomePage;
