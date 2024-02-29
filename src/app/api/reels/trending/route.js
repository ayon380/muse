import { admin } from "../../../../lib/firebase/firebaseServer";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function POST(req) {
  try {
    const headersList = headers(req);
    const idToken = headersList.get("authorization").split(" ")[1];
    const email = headersList.get("email");
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const db = admin.firestore();
    const reelsCollectionRef = db.collection("reels"); // Specify the collection here
    const q =await reelsCollectionRef.orderBy("viewcount", "desc").limit(10).get();

    let postarray = [];
    q.forEach((doc) => {
      postarray.push(doc.data());
    });

    if (postarray.length >= 0)
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