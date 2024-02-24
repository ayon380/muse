import { admin } from "../../../lib/firebase/firebaseServer";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
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
    const following = userData.following;
    console.log("Following:", following);
    for (let i = 0; i < following.length; i++) {
      const element = following[i];
      const em = await db.collection("username").doc(element).get();
      const ema = em.data().email;
      const followingRef = db.collection("users").doc(ema);
      const followingDoc = await followingRef.get();
      const posts = followingDoc.data().posts;
      for (let i = 0; i < posts.length; i++) {
        const element = posts[i];
        const postRef = db.collection("posts").doc(element);
        const postDoc = await postRef.get();
        const postData = postDoc.data();
        postarray.push(postData);
      }
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
