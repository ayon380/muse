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

    const posts = await db
      .collection("posts")
      .orderBy("likecount", "desc")
      .limit(15)
      .get();
    const reels = await db
      .collection("reels")
      .orderBy("viewcount", "desc")
      .limit(5)
      .get();
    let postarray = [];
    posts.forEach((doc) => {
      postarray.push(doc.data());
    });
    let reelsarray = [];
    reels.forEach((doc) => {
      reelsarray.push(doc.data());
    });

    return NextResponse.json({
      status: "true",
      message: "Hi raa",
      posts: postarray,
      reels: reelsarray,
    });
  } catch (error) {
    console.error("Error verifying ID token:", error);
    return NextResponse.json({
      status: "false",
      message: "Error Verifying Token",
    });
  }
}
