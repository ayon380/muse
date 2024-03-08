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

    const page = req.body.page || 1; // Get the page number from the request body, default to page 1

    const limit = 5; // Number of documents to fetch per page
    const offset = (page - 1) * limit; // Calculate the offset based on the page number

    const reelsCollectionRef = db.collection("reels");
    const q = await reelsCollectionRef
      .orderBy("viewcount", "desc")
      .offset(offset)
      .limit(limit)
      .get();

    let postarray = [];
    q.forEach((doc) => {
      postarray.push(doc.data());
    });

    // Assuming you have a total count of reels to calculate the total number of pages
    const totalReelsCount = await reelsCollectionRef
      .get()
      .then((snap) => snap.size);
    const totalPages = Math.ceil(totalReelsCount / limit);

    return NextResponse.json({
      status: "true",
      message: "Hi raa",
      posts: postarray,
      totalPages: totalPages,
    });
  } catch (error) {
    console.error("Error verifying ID token:", error);
    return NextResponse.json({
      status: "false",
      message: "Error Verifying Token",
    });
  }
}
