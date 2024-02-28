import { admin } from "../../../lib/firebase/firebaseServer";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import {
  getDocs,
  query,
  where,
  collection,
  orderBy,
  limit,
  get,
} from "firebase/firestore";
export async function POST(req) {
  try {
    const headersList = headers();
    const idToken = headersList.get("authorization").split(" ")[1];
    const email = headersList.get("email");
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const db = admin.firestore();
    const user = await admin.auth().getUser(uid);
    const userRef = db.collection("users").doc(email);
    const userDoc = await userRef.get();
    const userData = userDoc.data();
    let postarray = [];
    const metadataref = db.collection("metadata").doc(userData.uid);
    const metadata = await metadataref.get();
    let i = 0;
    const hashtagmap = metadata.data().hashtagmap;
    for (const [key, value] of Object.entries(hashtagmap)) {
      console.log(`${key}: ${value}`);
      i = i + 1;
      if (i > 10) break;
      const q = await db
        .collection("reels")
        .where("hashtags", "array-contains", key)
        .orderBy("timestamp", "desc")
        .limit(10)
        .get();
      q.forEach((doc) => {
        postarray.push(doc.data());
      });
    }
    if (user)
      return NextResponse.json({
        status: "true",
        message: "Hi raa",
        posts: postarray,
      });
    else
      return NextResponse.json({ status: "false", message: "User not found" });
  } catch (error) {
    console.error("Error verifying ID token:", error);
    return NextResponse.json({
      status: "false",
      message: "Error Verifying Token",
    });
  }
}
