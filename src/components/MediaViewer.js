import React, { useEffect, useState } from "react";
import Image from "next/image";
import { saveAs } from "file-saver";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import BottomSheet from "./BottomSheet";
const Follower = ({ mediaviewerfiles, setMediaViewerOpen, close }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [currentMedia, setCurrentMedia] = useState(null);
  const storage = getStorage();
  useEffect(() => {
    setIsOpen(true);
    if (mediaviewerfiles && mediaviewerfiles.length > 0) {
      setCurrentMedia(mediaviewerfiles[0]);
    }
  }, [mediaviewerfiles]);

  const isVideo = (file) => {
    return (
      file.includes(".mp4") || file.includes(".mov") || file.includes(".webm")
    );
  };

  const downloadMedia = async () => {
    try {
      const xhr = new XMLHttpRequest();
      xhr.responseType = "blob";
      xhr.onload = (event) => {
        const blob = xhr.response;
        console.log("Blob: ", blob);

        // Get the filename from the currentMedia URL
        const filename = currentMedia.split("/").pop();

        // Remove query parameters if any
        const cleanFilename = filename.split("?")[0];

        // Get the file extension from the filename
        const fileExtension = cleanFilename.split(".").pop();
        console.log("fileExtension: ", fileExtension);
        // Determine the MIME type based on the file extension
        let mimeType = "";
        if (fileExtension === "jpg" || fileExtension === "jpeg") {
          mimeType = "image/jpeg";
        } else if (fileExtension === "png") {
          mimeType = "image/png";
        } else if (fileExtension === "gif") {
          mimeType = "image/gif";
        } else if (fileExtension === "mp4") {
          mimeType = "video/mp4";
        }

        // Save the blob with the specified MIME type
        saveAs(blob, cleanFilename, { type: mimeType });
        // saveAs(blob, currentMedia);
      };
      xhr.open("GET", currentMedia);
      xhr.send();
    } catch (err) {
      console.error("Failed to download: ", err);
    }
  };

  return (
    <BottomSheet show={isOpen} heading="Media Viewer" onClose={close}>
      <div>
        <div className="flex-grow flex items-center justify-center mb-4 relative">
          {currentMedia && (
            <>
              {isVideo(currentMedia) ? (
                <video src={currentMedia} controls className="object-cover" />
              ) : (
                <Image
                  src={currentMedia}
                  alt=""
                  //   layout="fill"
                  height={500}
                  width={500}
                  className="object-cover"
                />
              )}
              <div className="absolute top-4 right-4">
                <button
                  onClick={downloadMedia}
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
                >
                  Download
                </button>
              </div>
            </>
          )}
        </div>
        <div className="flex-shrink-0 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 absolute bottom-0 w-full bg-white dark:bg-black p-4">
          {mediaviewerfiles &&
            mediaviewerfiles.map((file, index) => (
              <div
                key={index}
                className="relative group cursor-pointer overflow-hidden rounded-lg w-24 h-24"
                onClick={() => setCurrentMedia(file)}
              >
                {isVideo(file) ? (
                  <video
                    src={file}
                    className="object-cover transition-transform duration-300 group-hover:scale-110 w-full h-full"
                    onContextMenu={(e) => e.preventDefault()} // Prevent right-click
                  />
                ) : (
                  <Image
                    src={file}
                    alt=""
                    layout="fill"
                    className="object-cover rounded-md transition-transform duration-300 group-hover:scale-110"
                    onContextMenu={(e) => e.preventDefault()} // Prevent right-click
                  />
                )}
                <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <p className="text-white text-sm">View</p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </BottomSheet>
  );
};

export default Follower;
