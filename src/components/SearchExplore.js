import React, { useEffect, useCallback, use } from "react";
import {
  query,
  where,
  getDocs,
  orderBy,
  limit,
  or,
  collection,
} from "firebase/firestore";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { debounce, set } from "lodash";
import dynamic from "next/dynamic";
const FeedPost = dynamic(() => import("./FeedPost"), { ssr: false });
const SearchExplore = ({
  db,
  userdata,
  usermetadata,
  enqueueUserMetadata,
  setexpllorepagestate,
  close,
}) => {
  const [search, setSearch] = React.useState("");
  const [searchResults, setSearchResults] = React.useState([]);
  const [loadinghashtag, setLoadinghashtag] = React.useState(false);
  const [selectedhashtags, setSelectedhashtags] = React.useState();
  const [users, setUsers] = React.useState([]);
  const [searchtype, setSearchtype] = React.useState("users"); // or "hashtags"
  const [searching, setSearching] = React.useState(false);
  const [loadinguser, setLoadinguser] = React.useState(false);
  const [hashtags, setHashtags] = React.useState([]);
  const router = useRouter();
  const getpopulartags = async () => {
    setLoadinghashtag(true);
    const hashtagsCollectionRef = collection(db, "hashtags");
    const hashtagsQuery = query(
      hashtagsCollectionRef,
      orderBy("count", "desc"),
      limit(6) // Optional: limit the number of results
    );

    getDocs(hashtagsQuery)
      .then((querySnapshot) => {
        const hashtag = [];
        querySnapshot.forEach((doc) => {
          hashtag.push({ id: doc.id, ...doc.data() });
        });
        console.log("Hashtags ordered by count descending:", hashtag);
        setHashtags(hashtag);
      })
      .catch((error) => {
        console.error("Error getting hashtags:", error);
      });
    setLoadinghashtag(false);
  };
  const getpopularusers = async () => {
    setLoadinguser(true);
    const usersCollectionRef = collection(db, "username");
    const usersQuery = query(
      usersCollectionRef,
      orderBy("followerscount", "desc"),
      limit(6) // Optional: limit the number of results
    );
    getDocs(usersQuery)
      .then((querySnapshot) => {
        const users = [];
        querySnapshot.forEach((doc) => {
          //   enqueueUserMetadata(doc.data(), doc.id);
          users.push({ id: doc.id, ...doc.data() });
        });
        console.log("Users ordered by followers count descending:", users);
        setUsers(users);
      })
      .catch((error) => {
        console.error("Error getting users:", error);
      });
    setLoadinguser(false);
  };
  const searchUsers = async () => {
    try {
      setSearching(true);
      console.log("Searching for users with username:", search);
      const usersCollectionRef = collection(db, "username");
      const text = search.toLowerCase();

      // Query for usernames
      const usersQuery = query(
        usersCollectionRef,
        where("userName", ">=", text),
        where("userName", "<=", text + "\uf8ff"),
        limit(10)
      );

      const usernameQuerySnapshot = await getDocs(usersQuery);
      const usernameUsers = usernameQuerySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("Users with username:", usernameUsers);

      // Query for fullnames
      const fullnameQuery = query(
        usersCollectionRef,
        where("fullname", ">=", text),
        where("fullname", "<=", text + "\uf8ff"),
        limit(10)
      );

      const fullnameQuerySnapshot = await getDocs(fullnameQuery);
      const fullnameUsers = fullnameQuerySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("Users with fullname:", fullnameUsers);

      // Combine the results from both queries and filter out duplicates
      const combinedResults = [...usernameUsers, ...fullnameUsers];
      const uniqueResults = [];
      const uniqueIds = new Set();

      combinedResults.forEach((user) => {
        if (!uniqueIds.has(user.id)) {
          uniqueIds.add(user.id);
          uniqueResults.push(user);
        }
      });

      setSearchResults(uniqueResults);
      setSearching(false);
    } catch (e) {
      console.log(e);
      setSearching(false);
    }
  };

  const debounceSearch = useCallback(
    debounce((value) => {
      if (value.length > 0) {
        searchUsers();
      } else {
        setSearchResults([]);
      }
    }, 300),
    []
  );
  const searchHashtags = async () => {
    try {
      setSearching(true);
      console.log("Searching for hashtags with name:", search);
      const hashtagsCollectionRef = collection(db, "hashtags");
      const text = search.toLowerCase().substring(1);
      console.log("Searching for hashtags with name:", text);
      const hashtagsQuery = query(
        hashtagsCollectionRef,
        where("tag", ">=", text),
        where("tag", "<=", text + "\uf8ff"),
        limit(10)
      );
      const hashtagsQuerySnapshot = await getDocs(hashtagsQuery);
      const hashtags = hashtagsQuerySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("Hashtags with name:", hashtags);
      setSearchResults(hashtags);
      setSearching(false);
    } catch (e) {
      console.log(e);
      setSearching(false);
    }
  };
  useEffect(() => {
    if (search.startsWith("#")) {
      setSearchtype("hashtags");
      console.log(search);
      setTimeout(() => {
        searchHashtags();
        clearInterval();
      }, 300);
    } else debounceSearch(search);
  }, [search, debounceSearch]);
  const fetchposts = async (hashtag) => {
    const postsCollectionRef = collection(db, "posts");
    const postsQuery = query(
      postsCollectionRef,
      where("hashtags", "array-contains", hashtag),
      orderBy("timestamp", "desc"),
      limit(10)
    );
    const postsQuerySnapshot = await getDocs(postsQuery);
    const posts = postsQuerySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log("Posts with hashtag:", posts);
    // setPosts(posts);
    // setPostsLoading(false);
  };
  const fetchreels = async (hashtag) => {
    const reelsCollectionRef = collection(db, "reels");
    const reelsQuery = query(
      reelsCollectionRef,
      where("hashtags", "array-contains", hashtag),
      orderBy("timestamp", "desc"),
      limit(10)
    );
    const reelsQuerySnapshot = await getDocs(reelsQuery);
    const reels = reelsQuerySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log("Reels with hashtag:", reels);
    // setReels(reels);
    // setReelsLoading(false);
  };
  useEffect(() => {
    if (selectedhashtags) {
      fetchposts(selectedhashtags);
      fetchreels(selectedhashtags);
    }
  }, [selectedhashtags]);
  React.useEffect(() => {
    getpopulartags();
    getpopularusers();
  }, []);
  return (
    <div className="h-screen w-screen fixed top-0 left-0 z-10  overflow-y-auto px-5 justify-center bg-white dark:bg-black py-20">
      {/* Search input */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        type="text"
        className="h-10 w-full px-4 my-5 rounded-full border-2 border-gray-300 focus:outline-none focus:border-blue-500 "
        placeholder="Search for users or hashtags..."
      />

      {/* Container for results */}
      {selectedhashtags && <>{}</>}
      <div className="mb-20">
        {searchResults.length > 0 ? (
          <>
            {searching ? (
              <div className="text-xl p-4">Searching...</div>
            ) : (
              <div>
                {" "}
                {searchtype === "hashtags" ? (
                  <div className="sd">
                    {searchResults.map((result) => (
                      <div
                        key={result.id}
                        className="flex justify-between items-center p-4 border-b"
                        onClick={() => {
                          setexpllorepagestate(result.id);
                        }}
                      >
                        <div>{result.id}</div>
                        <button
                          onClick={() => {
                            close();
                            enqueueUserMetadata(usermetadata, result);
                          }}
                          className="bg-blue-500 text-white px-4 py-2 rounded-full"
                        >
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {searchResults.map((result) => (
                      <div
                        key={result.id}
                        className="flex justify-between items-center p-4 border-b"
                        onClick={() => {
                          router.push(`/feed/profile/${result.userName}`);
                        }}
                      >
                        <div>{result.userName}</div>
                        <button
                          onClick={() => {
                            close();
                            enqueueUserMetadata(usermetadata, result);
                          }}
                          className="bg-blue-500 text-white px-4 py-2 rounded-full"
                        >
                          Go
                        </button>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="max-w-md w-full p-5 bg-white rounded-3xl shadow-lg">
              {loadinghashtag ? (
                <div className="text-xl p-4">Loading hashtags...</div>
              ) : (
                <div>
                  <div className="flex">
                    <div className="sd h-1/2">Trending </div>
                    <Image
                      src="/icons/trending.png"
                      height={50}
                      width={50}
                      alt="trending"
                    />
                  </div>
                  {hashtags.map((result) => (
                    <div
                      key={result.id}
                      className="flex  justify-between items-center p-4 border-b"
                      onClick={() => {
                        setexpllorepagestate(result.id);
                      }}
                    >
                      <div>{result.id}</div>
                      <button
                        onClick={() => {
                          close();
                          enqueueUserMetadata(usermetadata, result);
                        }}
                        className="bg-blue-500 text-white px-4 py-2 rounded-full"
                      >
                        Go
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {loadinguser ? (
                <div className="text-xl p-4">Loading users...</div>
              ) : (
                <div>
                  <div className="ss">Top Creators</div>
                  {users.map((result) => (
                    <div
                      key={result.id}
                      className="flex justify-between items-center p-4 border-b"
                      onClick={() => {
                        router.push(`/feed/profile/${result.userName}`);
                      }}
                    >
                      <div>{result.userName}</div>
                      <button
                        onClick={() => {
                          close();
                          enqueueUserMetadata(usermetadata, result);
                        }}
                        className="bg-blue-500 text-white px-4 py-2 rounded-full"
                      >
                        Profile
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SearchExplore;
