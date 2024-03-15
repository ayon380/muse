import React from "react";
import Image from "next/image";
const Modal = ({ content, title, setShowModal, type, handleDelete }) => {
  const [open, setOpen] = React.useState(true);

  return (
    <>
      {" "}
      {open && (
        <>
          {type == "deletepost" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="modal bg-opacity-50 bg-black  h-screen w-screen flex items-center justify-center">
                <div className="bg-white text-black dark:bg-black dark:text-white rounded-xl p-4 mx-4 ">
                  <div className="qw text-center text-2xl">{title}</div>
                  <div className="sd flex justify-center">
                    <Image
                      className="text-center h-16 w-16"
                      src="/icons/war.png"
                      alt="post"
                      width={300}
                      height={300}
                    />
                  </div>
                  <h1 className="text-xl text-center">{content}</h1>
                  <div className="flex justify-between">
                    <button
                      className="bg-red-500 text-white p-2 rounded-xl"
                      onClick={handleDelete}
                    >
                      Delete
                    </button>
                    <button
                      className="bg-blue-500 text-white p-2 rounded-xl"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default Modal;
