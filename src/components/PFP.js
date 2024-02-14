import React from 'react';

function ProfilePicture({ profilePicUrl }) {
  return (
    <img
      src={profilePicUrl}
      alt="Profile Pic"
      height={50}
      width={50}
    />
  );
}

export default ProfilePicture;
