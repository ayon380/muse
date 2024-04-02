import React from 'react';
import Image from 'next/image';

const MainLoading = () => {
    return (
        <div className="w-screen h-screen fixed top-0 left-0 flex flex-col items-center justify-center mainloading text-white z-50">
            <div className="flex flex-col items-center mb-12">
                <div className="font-lucy text-6xl md:text-8xl mb-4">Muse</div>
                {/* <div className="text-xl md:text-2xl">Loading...</div> */}
            </div>
            <div className="">
                <Image
                    src="/loading.gif"
                    alt="Loading Animation"
                    width={80}
                    height={80}
                    className="text-white"
                />
            </div>
            <div className="fixed bottom-4 text-sm md:text-base">
                NoFilter LLC <span className="opacity-75">v0.65 Beta</span>
            </div>
        </div>
    );
};

export default MainLoading;