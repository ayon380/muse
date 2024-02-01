import { useState } from 'react';
// import { set } from 'react-hook-form';
import { doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

import {ref, uploadBytes, getDownloadURL,getStorage} from 'firebase/storage';
import { getFirestore,collection, updateDoc, arrayUnion } from 'firebase/firestore';
import app from '@/lib/firebase/firebaseConfig';
function extractHashtags(caption) {
  const hashtags = caption.match(/#\w+/g) || [];
  const cleanedHashtags = hashtags.map((tag) => tag.substring(1));
  return cleanedHashtags;
}
const CreatePost = ({ onClose,userdata }) => {
  const [caption, setCaption] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const db=getFirestore(app);
  const storage = getStorage(app);
  const auth = getAuth();
  const user = auth.currentUser;
  const handleFileChange = (e) => {
    const files = e.target.files;
    const filesArray = Array.from(files).slice(0, 10); // Limit to 10 files
    setMediaFiles([...mediaFiles, ...filesArray]);
  };

  const handleCaptionChange = (e) => {
    setCaption(e.target.value);
  };

  const handleAddAnother = () => {
    document.getElementById('fileInput').click();
    const fileInput = document.getElementById('fileInput');
    setMediaFiles([...mediaFiles, ...fileInput.files]);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    console.log(userdata.userName);
    if (user &&  userdata) {
      console.log(user);
      const post = {
        caption: caption,
        hashtags: extractHashtags(caption),
        mediaFiles: [], // Will store URLs
        timestamp: new Date(),
      };

      // Upload media files to Firebase Storage
      const storageRef = ref(storage, `images/${userdata.userName}/posts`);
      const mediaURLs = [];

      for (const file of mediaFiles) {
        const fileRef = ref(storageRef, file.name);
        await uploadBytes(fileRef, file);
        const downloadURL = await getDownloadURL(fileRef);
        mediaURLs.push(downloadURL);
      }

      // Store media URLs in Firestore
      post.mediaFiles = mediaURLs;

      // Update the user's document with the new post
      console.log(post);
      const userDocRef = doc(collection(db, 'users'), user.email);
      await updateDoc(userDocRef, {
        posts: arrayUnion(post),
      });
      setCaption('');
      setMediaFiles([]);
      setSubmitting(false);
  }else{
    console.log("no user");
  }
};

    return (
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="bg-white shadow-md rounded p-8">
            <h1 className="text-2xl font-bold mb-4">Create a Post</h1>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Caption
              </label>
              <textarea
                className="resize-none border rounded w-full py-2 px-3"
                rows="3"
                value={caption}
                onChange={handleCaptionChange}
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Upload Photos or Videos (up to 10)
              </label>
              <input
                type="file"
                accept="image/*, video/*"
                onChange={handleFileChange}
              />
            </div>

            <div className="mb-4">
              {mediaFiles.length > 0 && (
                <div className="mb-2">
                  <h2 className="text-lg font-semibold mb-2">Media Preview</h2>
                  <div className="flex flex-wrap">
                    {mediaFiles.map((file, index) => (
                      <div key={index} className="w-1/4 p-2">
                        {file.type.startsWith('image/') ? (
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Media ${index + 1}`}
                            className="max-w-full h-auto rounded"
                          />
                        ) : (
                          <video
                            src={URL.createObjectURL(file)}
                            alt={`Media ${index + 1}`}
                            className="max-w-full h-auto rounded"
                            controls
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-4">
              <button
                className="text-blue-500 hover:underline focus:outline-none"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>

            <div className="mt-4">
              <button
                className="text-gray-500 hover:underline focus:outline-none"
                onClick={handleAddAnother}
              >
                Add Another
              </button>
              <input
                type="file"
                id="fileInput"
                accept="image/*, video/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };
export default CreatePost;
