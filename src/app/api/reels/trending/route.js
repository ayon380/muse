import { admin } from "../../../../lib/firebase/firebaseServer";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import {
  getDocs,
  query,
  collection,
  where,
  orderBy,
  limit,
} from "firebase/firestore";

export async function POST(req) {
  try {
    const headersList = headers(req);
    const idToken = headersList.get("authorization").split(" ")[1];
    const email = headersList.get("email");
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const db = admin.firestore();
    const reelsCollectionRef = db.collection('reels') // Specify the collection here
    const q = query(
      reelsCollectionRef,
      where("views", "not-in", uid),
      orderBy("viewcount", "desc"),
      limit(10)
    );
    const querySnapshot = await getDocs(q);
    let postarray = [];
    querySnapshot.forEach((doc) => {
      postarray.push(doc.data());
    });

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
