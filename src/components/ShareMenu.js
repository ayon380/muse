import React from 'react';

const ShareMenu = ({ userdata, postdata, setSharemenu }) => {
    return (
        <div className="absolute sm  inset-0 flex items-center justify-center">
            <div className="bg-opacity-50 bg-black  h-screen w-screen flex items-center justify-center">
                <div className="bg-white text-black dark:bg-black dark:text-white rounded-xl p-4 mx-4 "></div>
                <button onClick={() => setSharemenu(false)}>Close</button>
                <div className="flex-grow">
                    {/* Your Share Content Goes Here */}
                    Share
                </div>
            </div>
        </div>
    );
};

export default ShareMenu;