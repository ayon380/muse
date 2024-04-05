import React from 'react';
import { FiHome, FiMail, FiUser, FiSettings, FiVideo } from 'react-icons/fi';

const WebsiteLayout = () => {
  return (
    <div className="grid grid-cols-5 gap-8 p-8">
      <div className="col-span-1 bg-gray-100 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6">Pages</h2>
        <div className="space-y-4">
          <div className="flex items-center">
            <FiHome className="text-blue-500 mr-4 text-3xl" />
            <span className="text-gray-700 font-medium">Explore</span>
          </div>
          <div className="flex items-center">
            <FiMail className="text-blue-500 mr-4 text-3xl" />
            <span className="text-gray-700 font-medium">Messages</span>
          </div>
          <div className="flex items-center">
            <FiUser className="text-blue-500 mr-4 text-3xl" />
            <span className="text-gray-700 font-medium">Profile</span>
            <div className="ml-8 space-y-2">
              <div className="flex items-center">
                <span className="text-gray-600 font-medium">User Profile</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-600 font-medium">Edit Profile</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-600 font-medium">Settings</span>
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <FiVideo className="text-blue-500 mr-4 text-3xl" />
            <span className="text-gray-700 font-medium">Reels</span>
          </div>
          <div className="flex items-center">
            <FiSettings className="text-blue-500 mr-4 text-3xl" />
            <span className="text-gray-700 font-medium">Settings</span>
          </div>
        </div>
      </div>
      <div className="col-span-4">
        <div className="grid grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4">Explore</h3>
            <p className="text-gray-600">Discover new content and connect with others.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4">Messages</h3>
            <p className="text-gray-600">Chat with friends and family.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4">Profile</h3>
            <p className="text-gray-600">Manage your personal information and settings.</p>
            <div className="mt-4 space-y-2">
              <div className="bg-gray-100 p-4 rounded-lg">
                <h4 className="text-lg font-medium mb-2">User Profile</h4>
                <p className="text-gray-600">View and edit your profile details.</p>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg">
                <h4 className="text-lg font-medium mb-2">Edit Profile</h4>
                <p className="text-gray-600">Update your profile information.</p>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg">
                <h4 className="text-lg font-medium mb-2">Settings</h4>
                <p className="text-gray-600">Customize your account preferences.</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4">Reels</h3>
            <p className="text-gray-600">Create and share short-form videos.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4">Settings</h3>
            <p className="text-gray-600">Customize your account and preferences.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebsiteLayout;