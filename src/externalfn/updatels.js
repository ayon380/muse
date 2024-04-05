import app from '@/lib/firebase/firebaseConfig';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const updatels = async () => {
    const auth = getAuth(app);
    const db = getFirestore(app);

    // Listen for changes in the user's authentication state
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // User is signed in, update last seen
            const userRef = doc(db, 'username', user.uid);
            console.log('Updating last seen');
            await updateDoc(userRef, {
                lastseen: new Date().getTime(),
            });
        } else {
            // User is signed out
            console.log('User not logged in');
        }
    });
};

// Call updatels initially
updatels();

// Set interval to call updatels every 2 minutes
const intervalId = setInterval(() => {
    updatels();
}, 60 * 1000); // 2 minutes in milliseconds

// To stop the interval (for example, when the user logs out or leaves the page)
// clearInterval(intervalId);
