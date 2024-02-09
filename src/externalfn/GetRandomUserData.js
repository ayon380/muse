import { doc, getDoc } from "firebase/firestore";

const GetUserData = async (userName) => {
    try {
        const userRef = doc(db, "username", userName);
        const userSnapshot = await getDoc(userRef);
        return userSnapshot.data();
    } catch (error) {
        console.error("Error checking user existence:", error.message);
        return null;
    }
};
export default GetUserData;