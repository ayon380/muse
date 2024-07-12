// pages/signup.js
"use client";
import imageCompression from "browser-image-compression";
import "../styles/gradients.css";
import "../styles/grad.css";
import React, { useEffect } from "react";
import Link from "next/link";
import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css";
import { FaQuestion } from "react-icons/fa6";
import { FileUploader } from "react-drag-drop-files";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import app from "@/lib/firebase/firebaseConfig";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";
import DatePicker from "react-date-picker";
const options = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1000,
  useWebWorker: true,
};
const Signup = () => {
  var state_arr = new Array(
    "Andaman & Nicobar",
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chandigarh",
    "Chhattisgarh",
    "Dadra & Nagar Haveli",
    "Daman & Diu",
    "Delhi",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jammu & Kashmir",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Lakshadweep",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Orissa",
    "Pondicherry",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttaranchal",
    "West Bengal"
  );

  const router = useRouter();
  const [userName, setUserName] = React.useState("");
  const [signupstate, setsignupstate] = React.useState(1);
  const [checkStatus, setCheckStatus] = React.useState(1); //1 for not checked , 2 for checking , 3 for checked
  const [name, setName] = React.useState("");
  const [state, setState] = React.useState("Andaman & Nicobar");
  const [city, setCity] = React.useState("");
  const [signupprocess, setsignuppocess] = React.useState(false);
  const auth = getAuth();
  const db = getFirestore(app);
  const storage = getStorage(app);
  const provider = new GoogleAuthProvider();
  const user = auth.currentUser;
  console.log(user);
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const q = await checkIfUserExists(user.email);
      console.log(q);
      if (user && q) {
        const userData = {
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          uid: user.uid,
          // Add other user data as needed
        };
        router.push("/feed");
      }
    } else {
      user = await signInWithPopup(auth, provider);
    }
  });
  const checkIfUserExists = async (email) => {
    try {
      const userRef = doc(db, "users", email);
      const userSnapshot = await getDoc(userRef);
      return userSnapshot.exists();
    } catch (error) {
      console.error("Error checking user existence:", error.message);
      return false;
    }
  };
  function isOnlyLowercase(str) {
    // Define the regular expression pattern for lowercase characters
    const lowercasePattern = /^[a-z0-9]+$/;

    // Test the string against the pattern
    return lowercasePattern.test(str);
  }
  const checkUserName = async () => {
    try {
      setCheckStatus(2);
      console.log("checking username");
      if (userName.includes(" ")) {
        toast.error("Username cannot contain spaces");
        setUserName("");
        setCheckStatus(1);
        return;
      }
      if (userName.length < 3) {
        toast.error("Username should be atleast 3 characters long");
        setUserName("");
        setCheckStatus(1);
        return;
      }
      if (!isOnlyLowercase(userName)) {
        toast.error("Username should be in lowercase");
        setUserName("");
        setCheckStatus(1);
        return;
      }
      const useRef = doc(db, "username", userName);
      const userSnapshot = await getDoc(useRef);
      if (userSnapshot.exists()) {
        toast.error("Username already exists");
        setUserName("");
        setCheckStatus(1);
      } else {
        toast.success("Username available");
        setCheckStatus(3);
      }
    } catch (error) {
      toast.error(`Error checking user existence: ${error.message}`);
      setCheckStatus(1);
      return false;
    }
  };

  const nextstate = () => {
    if (signupstate === 1) {
      if (checkStatus === 3) {
        return () => {
          setsignupstate(2);
        };
      } else {
        return () => {
          toast.error("Please check username");
        };
      }
    } else if (signupstate === 2) {
      return () => {
        if (name.length > 2) {
          if (state) {
            if (city) {
              if (gender) {
                if (dob) {
                  const currentDate = new Date();
                  const birthdate = new Date(dob);
                  const age =
                    currentDate.getFullYear() - birthdate.getFullYear();
                  if (age >= 18) setsignupstate(3);
                  else
                    toast.error(
                      "You Should be atleast 18 to create an Account😔"
                    );
                }
              } else {
                toast.error("Please Select your Gender");
              }
            } else {
              toast.error("Please Select your City");
            }
          } else {
            toast.error("Please Select your State");
          }
        } else {
          toast.error("Please enter your full name");
        }
      };
    } else if (signupstate === 3) {
      return () => {
        if (file) {
          if (bio.length > 0) {
            setsignupstate(4);
          } else {
            toast.error("Please enter your bio");
          }
        } else {
          toast.error("Please upload a profile picture");
        }
      };
    } else if (signupstate === 4) {
      return () => {
        handleSignup();
      };
    }
  };
  const handleChange = (e) => {
    setUserName(e.target.value);
    setCheckStatus(1);
  };
  const handleNameChange = (e) => {
    setName(e.target.value);
  };
  const handleStateChange = (e) => {
    setState(e.target.value);
    // handleCityChange(e);
  };

  const cities = React.useRef([]);
  const [gender, setGender] = React.useState("");
  const [dob, setDob] = React.useState(new Date());

  const prevstate = () => {
    if (signupstate > 1 && signupstate < 5) {
      return () => {
        setsignupstate(signupstate - 1);
      };
    }
  };
  const fileTypes = ["JPG", "PNG"];
  const [bio, setBio] = React.useState("");
  const [file, setFile] = React.useState(null);
  const [profession, setProfession] = React.useState("");
  const [org, setOrg] = React.useState("");
  const [pubpriv, setPubPriv] = React.useState("Private");
  const [fileDataURL, setFileDataURL] = React.useState(null);
  const handlePPChange = (file) => {
    setFile(file);
    const reader = new FileReader();

    reader.onload = (e) => {
      const dataURL = e.target.result;
      setFileDataURL(dataURL);
    };

    reader.readAsDataURL(file);
  };

  const handleSignup = async () => {
    try {
      setsignuppocess(true);

      // Save additional user data to Firestore
      const userRef = doc(db, "users", user.email);
      const usernameref = doc(db, "username", user.uid);
      const chatref = doc(db, "chats", user.uid);
      const chatData = {
        rooms: [],
        uid: user.uid,
      };
      await setDoc(chatref, chatData);
      try {
        const storagePFPRef = ref(
          storage,
          `images/${user.uid}/PFP/${file.name}`
        );
        const compressedFile = await imageCompression(file, options);
        const snapshot = await uploadBytes(storagePFPRef, compressedFile);
        console.log("Image uploaded successfully:", snapshot.ref.fullPath);
        const downloadURL = await getDownloadURL(snapshot.ref);
        console.log("File available at", downloadURL);
        const metadataref = doc(db, "metadata", user.uid);
        const metadata = {
          userName: userName,
        };
        const msgref = doc(db, "chats", user.uid);
        await setDoc(msgref, { rooms: [], uid: user.uid });
        await setDoc(metadataref, metadata);
        const usernameData = {
          email: user.email,
          uid: user.uid,
          pfp: downloadURL,
          userName: userName,
          followerscount: 0,
          fullname: name,
          active: true,
          lastseen: new Date(),
          score: 0,
        };
        await setDoc(usernameref, usernameData);
        const userData = {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          uid: user.uid,
          userName: userName,
          fullname: name,
          state: state,
          city: city,
          gender: gender,
          dob: dob,
          bio: bio,
          pubpriv: pubpriv,
          posts: [],
          savedposts: [],
          postcount: 0,
          taggedPosts: [],
          pfp: downloadURL,
          following: [],
          postcount: 0,
          blocked: [],
          followingcount: 0,
          followerscount: 0,
          uid: user.uid,
          followers: [],
          viewedposts: [],
          viewedreels: [],
          profession: profession,
          org: org,
          closefriends: [],
          reels: [],
          // Add other user data as needed
        };
        await setDoc(userRef, userData);
        const w = await fetch("/api/email", {
          method: "POST",
          body: JSON.stringify({
            email: user.email,
            subject: "Hi, We are very happy to have you on board😊😊",
            username: userName,
            type: "onboard",
          }),
        });
        const q = await w.json();
        console.log(q.status);
      } catch (err) {
        toast.error(`Error Signing Upc: ${err.message}`);
        return;
      }
      setsignuppocess(false);
      toast.success("Signed Up Successfully, Redirecting to Feed Page Shortly");

      // Redirect to the home page after successful signup
      router.push("/feed");
    } catch (error) {
      // Handle signup errors
      console.error("Error signing up:", error);
    }
  };
  return (
    <div className="h-dvh maindiv pt-20 md:pt-40">
      <div className="root hl font-rethink mb-20   text-black">
        <Toaster />
        <div className="  mx-2 md:mx-96 bg-gray-700 rounded-xl md:bg-clip-padding md:backdrop-filter md:backdrop-blur-3xl bg-opacity-10 shadow-2xl border-1 border-black">
          <div className="f1 font-lucy text-8xl lg:text-9xl pt-10   text-center">
            <Link href="/">Muse</Link>
          </div>
          <div className="main ">
            <div className="flex my-5 justify-evenly">
              <div className="h11 text-xl">Signup</div>
              <div className="status border-2 px-2 rounded-xl border-black ">
                {signupstate} of 4
              </div>
            </div>
            {signupstate === 1 ? (
              <div>
                <div className="flex justify-center">
                  <input
                    className="input bg-transparent  border-2 text-black  border-black p-2 rounded-xl shadow-2xl focus:border-2 focus:border-black focus:outline-none placeholder-black"
                    onChange={handleChange}
                    value={userName}
                    placeholder="UserName"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") checkUserName();
                    }}
                  />
                </div>
                <div className="flex justify-center mt-4">
                  <div className="flex">
                    <Image
                      src="/icons/info.png"
                      alt="info"
                      width={20}
                      height={20}
                      className="mr-2  mt-1 h-5 w-5"
                    />
                    <div className="df text-xs max-w-80 opacity-75 ">
                      Username is the virtual identity that you will be known by
                      on Muse. It should be unique and should not contain any
                      spaces. It should be atleast 3 characters long and should
                      be in lowercase.
                    </div>
                  </div>
                </div>
                <div className=" mt-10 flex justify-center">
                  <button
                    className="fd font-rethink  flex mb-5 pl-6 pr-5 "
                    onClick={checkUserName}
                  >
                    Check
                    <div className="lp mt-3 ml-2">
                      {checkStatus === 1 ? (
                        <FaQuestion />
                      ) : checkStatus === 2 ? (
                        <Image
                          src="/gif.gif"
                          height={20}
                          width={20}
                          alt="gif"
                        />
                      ) : checkStatus === 3 ? (
                        <Image
                          src="/suc.png"
                          height={20}
                          width={20}
                          alt="png"
                        />
                      ) : null}
                    </div>
                  </button>
                </div>
              </div>
            ) : signupstate === 2 ? (
              <div>
                {/* Name, City , DOB, Gender  */}
                <div className="flex justify-center">
                  <input
                    className="input bg-transparentborder-2 text-black  border-black p-2 rounded-xl shadow-2xl focus:border-2 focus:border-black focus:outline-none placeholder-current  placeholder-black"
                    onChange={handleNameChange}
                    value={name}
                    placeholder="Full Name"
                  />
                </div>
                <div className="flex justify-center mt-4">
                  <input
                    className="input bg-transparent  border-2 text-black  border-black p-2 rounded-xl shadow-2xl focus:border-2 focus:border-black focus:outline-none placeholder-current  placeholder-black"
                    onChange={(e) => setProfession(e.target.value)}
                    value={profession}
                    placeholder="Profession Student/Employee"
                  />
                </div>
                <div className="flex justify-center mt-4">
                  <input
                    className="input bg-transparent border-2 text-black  border-black p-2 rounded-xl shadow-2xl focus:border-2 focus:border-black focus:outline-none placeholder-current  placeholder-black"
                    onChange={(e) => setOrg(e.target.value)}
                    value={org}
                    placeholder="Organization University/Employer Organization"
                  />
                </div>
                <div className="flex justify-center">
                  <select
                    className="input w-64 bg-transparent border-2 text-black  border-black p-2 rounded-xl my-5 shadow-2xl focus:border-2 focus:border-black focus:outline-none placeholder-current  placeholder-black"
                    onChange={handleStateChange}
                    value={state}
                  >
                    {state_arr.map((key) => (
                      <option className="text-black" key={key} value={key}>
                        {key}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-center">
                  <input
                    className="input bg-transparent border-2 text-black  border-black p-2 rounded-xl shadow-2xl focus:border-2 focus:border-black focus:outline-none placeholder-current"
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    value={city}
                  />
                </div>

                <div className="flex justify-evenly mx-20 my-5">
                  <button
                    className={`fd button px-5 ${
                      gender == "Male" ? "!bg-green-500 text-black" : ""
                    }`}
                    onClick={() => {
                      setGender("Male");
                      console.log(gender);
                    }}
                  >
                    Male
                  </button>
                  <button
                    className={`fd px-5 ${
                      gender == "Female" ? "!bg-green-500 text-white" : ""
                    }`}
                    onClick={() => setGender("Female")}
                  >
                    Female
                  </button>
                  <button
                    className={`fd px-5 ${
                      gender == "Other" ? "!bg-green-500 text-white" : ""
                    }`}
                    onClick={() => setGender("Other")}
                  >
                    Other
                  </button>
                </div>

                <div className="flex text-black justify-center">
                  <div className="kp mt-1 mr-2">DOB</div>
                  <DatePicker
                    value={dob}
                    onChange={(dob) => {
                      setDob(dob);
                    }}
                  />
                </div>
                <div className="flex justify-center mt-4">
                  <div className="flex">
                    <Image
                      src="/icons/info.png"
                      alt="info"
                      width={20}
                      height={20}
                      className="mr-2  mt-1 h-5 w-5"
                    />
                    <div className="df text-xs max-w-80 opacity-75 ">
                      We will use this information to provide you with a
                      personalized experience on Muse. Your information will be
                      kept private and secure.
                    </div>
                  </div>
                </div>
              </div>
            ) : signupstate === 3 ? (
              // Profile Picture , Bio, Interests
              <div>
                {" "}
                <div className="txt mx-20 ">
                  <div className="kl my-5 text-center">
                    Upload your Profile Picture
                    <div className="fg text-xs opacity-70">
                      Smile, it is contagious! 😊
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <FileUploader
                      // styles={{
                      //   color: "white",
                      //   display: "flex",
                      //   justifyContent: "center",
                      // }}
                      handleChange={handlePPChange}
                      name="Profile Picture"
                      types={fileTypes}
                    />
                  </div>
                </div>
                <div className="flex justify-center h-24 my-5">
                  {fileDataURL ? (
                    <Image
                      alt="PFP "
                      height={100}
                      width={100}
                      layout="fixed"
                      className="object-cover rounded-full"
                      src={fileDataURL}
                    ></Image>
                  ) : (
                    <div className="border pt-9 opacity-70 text-xs w-24 text-center rounded-full">
                      Profile Image
                    </div>
                  )}
                </div>
                <div className="flex justify-center">
                  <div className="kp text-xs text-center opacity-70 max-w-64 mx-20">
                    Spice up your profile – Introduce yourself in a groove,
                    sprinkle some interests, and jazz it up with a funky flair!
                    🚀✨ #BeYouBeFunky
                  </div>
                </div>
                <div className="flex justify-center">
                  <textarea
                    className="input bg-transparent  border-2 text-black  border-black p-2 w-96 mt-2 rounded-xl shadow-2xl focus:border-2 focus:border-black focus:outline-none placeholder-current  placeholder-black"
                    placeholder="Bio "
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>
              </div>
            ) : signupstate === 4 ? (
              // Security Measures
              <div>
                <div className="px-5 md:mx-20 max-h-80 overflow-y-auto">
                  <p>
                    <strong>Vibe Check First:</strong> Keep the vibes positive!
                    Roll with friends who radiate good energy. 🌟 Dodge the
                    sketchy stuff and keep the vibe zone strong. #GoodVibesOnly
                  </p>
                  <p>
                    <strong>Go Google Sign-In or Go Home:</strong> Passwords? So
                    last season. Embrace the Google Sign-In wave for a
                    hassle-free and secure ride. 🏄‍♂️ Let Google be your vibe
                    bouncer. #GoogleSignInSwag
                  </p>
                  <p>
                    <strong>Report the Funk:</strong> Spotted something off? Hit
                    us up! Report funky accounts or weird vibes. 🚨 We&apos;re
                    all about keeping the vibe real and safe for everyone.
                    #ReportTheFunk
                  </p>
                  <p>
                    <strong>Phishing Alert - Keep It 💯:</strong> Watch for
                    phishing vibes! We won&apos;t slide into your DMs asking for
                    secrets. 🎣 If it smells fishy, it probably is. Stay woke,
                    keep it 💯, and vibe strong! #StayWokeVibes
                  </p>
                  <p>
                    <strong>Account Privacy Matters:</strong> Choose wisely!
                    Decide if you want to keep your account private or roll with
                    the public. 🔒🌐 Your vibe, your choice. #PrivacyMatters
                  </p>
                </div>
                <div className="flex my-10 justify-center">
                  <button
                    onClick={() => {
                      setPubPriv("Private");
                    }}
                    className={`fd  mr-24 px-10 ${
                      pubpriv == "Private" ? "!bg-green-600" : null
                    }`}
                  >
                    Private
                  </button>
                  <button
                    className={`fd  px-10 ${
                      pubpriv == "Public" ? "!bg-red-600" : null
                    }`}
                    onClick={() => {
                      setPubPriv("Public");
                    }}
                  >
                    Public
                  </button>
                </div>
              </div>
            ) : null}
            <div className="flex justify-center">
              {signupstate > 1 && signupstate < 5 ? (
                <div className="po flex justify-center my-5 ">
                  <button className=" fd  mr-6 px-10" onClick={prevstate()}>
                    Prev
                  </button>
                </div>
              ) : null}
              {signupstate != 4 ? (
                <div className="po  flex justify-center my-5">
                  <button className=" fd  px-10" onClick={nextstate()}>
                    Next
                  </button>
                </div>
              ) : null}
            </div>
            {signupstate === 4 ? (
              <div className="po flex justify-center my-5">
                <button className=" fd  px-10" onClick={handleSignup}>
                  {signupprocess ? "Creating Account..." : "Let's goooo🎉🎉"}
                </button>
              </div>
            ) : null}
            <div className="flex justify-center">
              <div className="q1 text-sm ">
                <Link href="/tcs">Terms and Conditions</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
