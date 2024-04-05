import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import { getAuth } from 'firebase/auth';
import app from '@/lib/firebase/firebaseConfig';
import { collection, addDoc, updateDoc, query, getDocs } from 'firebase/firestore';
import { where, getDoc, doc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
const Modal = dynamic(() => import('@/components/Modal'));
import { getFirestore } from 'firebase/firestore';
const ReelReport = ({ username, reelId }) => {
    const [reason, setReason] = useState('');
    const [evidence, setEvidence] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [reportid, setReportid] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const router = useRouter();
    const auth = getAuth();
    // const user = auth.currentUser;
    const db = getFirestore(app);
    const storage = getStorage(app);
    const verifyusername = async () => {
        const userRef = query(collection(db, 'users'), where('userName', '==', username));
        const d = await getDoc(doc(db, 'reels', reelId));
        const querySnapshot = await getDocs(userRef);
        if (!querySnapshot.empty && d.exists) {
            // At least one document matches the query
            return true;
        } else {
            alert('User not found');
            setTimeout(() => {
                router.push('/feed');
            }, 2000);
        }
    };

    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();
        // Handle form submission logic here
        if (reason === '' || evidence.length === 0 || description === '' || category === '') {
            toast.error('Please fill in all fields');
            setLoading(false);
            return;
        }
        const reportsRef = ref(storage, 'reports');

        // Create an array to store the uploaded file URLs
        const evidenceUrls = [];

        // Loop through each file in the evidence array
        for (const file of evidence) {
            // Create a unique file name for the evidence file
            const fileName = `${Date.now()}_${file.name}`;

            // Create a reference to the file path in the "reports" folder
            const fileRef = ref(reportsRef, fileName);

            try {
                // Upload the file to Firebase Storage
                await uploadBytes(fileRef, file);

                // Get the download URL for the uploaded file
                const fileUrl = await getDownloadURL(fileRef);

                // Add the file URL to the evidenceUrls array
                evidenceUrls.push(fileUrl);
            } catch (error) {
                console.error('Error uploading file:', error);
                toast.error('An error occurred while uploading the evidence files.');
                return;
            }
        }
        const repref = collection(db, 'reports');
        const q = await addDoc(repref, {
            username: username,
            type: 'reel',
            reelId: reelId,
            reason: reason,
            evidence: evidenceUrls,
            description: description,
            category: category
        });
        setReportid(q.id);
        await updateDoc(q, {
            reportid: q.id
        })
        try {
            const email = await fetch('/api/email', {

                method: 'POST',
                body: JSON.stringify({
                    email: auth.currentUser.email,
                    subject: 'Report Submitted',
                    message: `Your report has been submitted successfully. Your report ID is ${q.id}. Please keep this ID for future reference.`
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }
        catch (error) {
            console.error('Error sending email:', error);
            toast.error('An error occurred while sending the email.');
            setLoading(false);
            return;
        }

        toast.success('Report submitted successfully');

        setShowModal(true);
        console.log('Reason:', reason);
        console.log('Evidence:', evidence);
        console.log('Description:', description);
        console.log('Category:', category);
    };
    const handleinfofunc = () => {
        router.push('/feed');
    }
    useEffect(() => {
        verifyusername();
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center items-center "
        >
            <Toaster />
            {showModal && (
                <Modal
                    title="Report Submitted"
                    content={`Your report has been submitted successfully. Your report ID is ${reportid}. Please keep this ID for future reference.`}
                    type="info"
                    onClose={() => setShowModal(false)}
                    reportId={reportid}
                    handleinfofunc={handleinfofunc}
                    setShowModal={setShowModal}
                />
            )}
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
                <h1 className="text-3xl font-bold mb-6 text-center text-purple-600">
                    Reel Report for {username}&apos;s reel
                </h1>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="reason" className="block font-medium mb-2 text-gray-700">
                            Reason for Report
                        </label>
                        <textarea
                            id="reason"
                            rows="4"
                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Enter reason for reporting this reel"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="evidence" className="block font-medium mb-2 text-gray-700">
                            Evidence
                        </label>
                        <input
                            type="file"
                            id="evidence"
                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            multiple
                            accept='image/*'
                            onChange={(e) => setEvidence(Array.from(e.target.files))}
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="description" className="block font-medium mb-2 text-gray-700">
                            Description
                        </label>
                        <textarea
                            id="description"
                            rows="4"
                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Enter a detailed description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="category" className="block font-medium mb-2 text-gray-700">
                            Category
                        </label>
                        <select
                            id="category"
                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="">Select a category</option>
                            <option value="spam">Spam</option>
                            <option value="harassment">Harassment</option>
                            <option value="hate-speech">Hate Speech</option>
                            <option value="violence">Violence</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <motion.button
                        type="submit"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full py-3 px-6 rounded-md bg-purple-600 text-white font-bold transition-colors duration-300 hover:bg-purple-700"
                        disabled={loading}
                    >
                        {loading ? 'Submitting...' : 'Submit Report'}
                    </motion.button>
                </form>
            </div>
        </motion.div>
    );
};

export default ReelReport;