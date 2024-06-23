import React from 'react';

const StyledCaption = ({ caption }) => {
  const renderStyledText = (text) => {
    // Use a regular expression to match hashtags
    const regex = /(#\w+)/g;
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (part.startsWith('#')) {
        return (
          <span key={index} className="text-fuchsia-500">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="caption mt-1 mb-2 w-full text-opacity-80 text-sm">
      {renderStyledText(caption)}
    </div>
  );
};

export default StyledCaption;