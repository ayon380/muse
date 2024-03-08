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
    const body = await req.json();
    const cursor = body.cursor;
    // Get the page number from the request body, default to page 1

    const limit = 5; // Number of documents to fetch per page
    if (cursor > 0) {
      console.log("fetching next page");
      console.log("cursor", cursor);
      const query = await db
        .collection("reels")
        .orderBy("viewcount", "desc")
        .startAfter(cursor)
        .limit(limit)
        .get();
      let postarray = [];
      let lastcount = 0;
      query.forEach((doc) => {
        console.log("next page --- " + doc.data().caption);
        postarray.push(doc.data());
        lastcount = doc.data().viewcount;
      });

      // console.log("last visible", lastVisible);
      return NextResponse.json({
        status: "true",
        message: "Hi raa",
        posts: postarray,
        cursor: lastcount, // Pass the last document as cursor for next page
      });
    }
    const q = await db
      .collection("reels")
      .orderBy("viewcount", "desc")
      .limit(limit)
      .get();
    let postarray = [];
    let lastcount = 0;
    q.forEach((doc) => {
      console.log("next page --- " + doc.data().caption);
      postarray.push(doc.data());
      lastcount = doc.data().viewcount;
    });
    return NextResponse.json({
      status: "true",
      message: "Hi raa",
      posts: postarray,
      cursor: lastcount, // Pass the last document as cursor for next page
    });
  } catch (error) {
    console.error("Error verifying ID token:", error);
    return NextResponse.json({
      status: "false",
      message: "Error Verifying Token",
    });
  }
}
