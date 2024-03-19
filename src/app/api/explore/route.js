import { admin } from "../../../lib/firebase/firebaseServer";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { log } from "console";

async function getpostdata(postid) {
  const db = admin.firestore();
  const postRef = db.collection("posts").doc(postid);
  const postDoc = await postRef.get();
  const postData = postDoc.data();
  return postData;
}

async function getreeldata(reelid) {
  const db = admin.firestore();
  const reelRef = db.collection("reels").doc(reelid);
  const reelDoc = await reelRef.get();
  const reelData = reelDoc.data();
  return reelData;
}

export async function GET(req) {
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
    const tags = await db.collection("metadata").doc(uid).get();
    const tagData = tags.data();
    const tagsArray = Object.entries(tagData);
    const sortedTags = tagsArray.sort((a, b) => b[1] - a[1]);
    const mostFrequentTags = sortedTags.slice(0, 5);
    const leastFrequentTags = sortedTags.slice(-5);
    console.log("Most frequent tags:", mostFrequentTags);
    console.log("Least frequent tags:", leastFrequentTags);
    const mostFrequentTagsPromises = mostFrequentTags.map(
      async ([tagId, tagFrequency]) => {
        const tagRef = await db.collection("postshashtags").doc(tagId).get();
        const tagData = tagRef.data();
        const tag2ref = await db.collection("reelshashtags").doc(tagId).get();
        const tag2Data = tag2ref.data();
        const result = {
          posts: tagData?.posts || [],
          reels: tag2Data?.posts || [],
        };
        return result;
      }
    );

    const leastFrequentTagsPromises = leastFrequentTags.map(
      async ([tagId, tagFrequency]) => {
        const tagRef = await db.collection("postshashtags").doc(tagId).get();
        const tagData = tagRef.data();
        const tag2ref = await db.collection("reelshashtags").doc(tagId).get();
        const tag2Data = tag2ref.data();
        const result = {
          posts: tagData?.posts || [],
          reels: tag2Data?.posts || [],
        };
        return result;
      }
    );

    const mostFrequentTagsData = await Promise.all(mostFrequentTagsPromises);
    const leastFrequentTagsData = await Promise.all(leastFrequentTagsPromises);
    const postsSet = new Set(
      mostFrequentTagsData
        .flatMap(({ posts }) => posts)
        .concat(leastFrequentTagsData.flatMap(({ posts }) => posts))
    );
    const reelsSet = new Set(
      mostFrequentTagsData
        .flatMap(({ reels }) => reels)
        .concat(leastFrequentTagsData.flatMap(({ reels }) => reels))
    );

    const posts = await Promise.all(
      Array.from(postsSet).map(async (postId) => await getpostdata(postId))
    );
    const reels = await Promise.all(
      Array.from(reelsSet).map(async (reelId) => await getreeldata(reelId))
    );

    const finalData = {
      posts,
      reels,
    };

    if (finalData.posts.length < 10) {
      const additionalPostsQuery = await db
        .collection("posts")
        .orderBy("likecount", "desc")
        .limit(10 - finalData.posts.length)
        .get();

      const additionalPosts = await Promise.all(
        additionalPostsQuery.docs.map(async (doc) => await getpostdata(doc.id))
      );

      finalData.posts = finalData.posts.concat(additionalPosts);
    }
    if (finalData.reels.length < 10) {
      const additionalReelsQuery = await db
        .collection("reels")
        .orderBy("likecount", "desc")
        .limit(10 - finalData.reels.length)
        .get();

      const additionalReels = await Promise.all(
        additionalReelsQuery.docs.map(async (doc) => await getreeldata(doc.id))
      );

      finalData.reels = finalData.reels.concat(additionalReels);
    }
    return NextResponse.json({
      status: "true",
      message: "Hi raa",
      fdata: finalData,
    });
  } catch (error) {
    console.error("Error verifying ID token:", error);
    return NextResponse.json({
      status: "false",
      message: "Error Verifying Token",
    });
  }
}