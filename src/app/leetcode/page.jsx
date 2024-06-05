import React from "react";
import Image from "next/image";
const Page = () => {
  return (
    <div className=" h-screen">
      <div className="nav bg-gray-700  flex justify-between py-10 px-10  font-rethink text-xl text-white">
        <div className="sd flex ">
          <Image
            className=""
            src="/icons/lcl2.png"
            alt=""
            height={100}
            width={200}
          />
        </div>
        <div className="sdfd flex">
          <div className="df mr-10  hover:text-orange-400  ">Premium</div>
          <div className="sd mr-10 hover:text-orange-400">Explore</div>
          <div className="df mr-10 hover:text-orange-400">Product</div>
          <div className="dsfs mr-10 hover:text-orange-400">Developer</div>
          <div className="dsf mr-10 hover:text-orange-400">Sign in</div>
        </div>
      </div>
      <div className="s bg-black h-full rounded-3xl -mt-5 ">
        <div className="fdf flex justify-center  ">
          <div className="sd">
            <div className="j mt-32 font-rethink text-8xl text-white">
              A New Way to Learn
            </div>
            <div className="sad mt-20 text-white opacity-50 text-center">
              LeetCode is the best platform to help you enhance your skills,
              <br></br>
              expand your knowledge and prepare for technical interviews.
            </div>
            <div className="mt-10 flex justify-center">
              <button className="bg-orange-400 text-white px-10 py-3 rounded-2xl">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
