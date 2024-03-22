"use client";
import React from "react";
import Image from "next/image";
import { useEffect } from "react";
import app from "@/lib/firebase/firebaseConfig";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Hello from "../components/Hello";
import toast, { Toaster } from "react-hot-toast";

const SparklesPreview = () => {
  const auth = getAuth(app);
  const [loggedin, setLoggedin] = React.useState(false);
  const [name, setname] = React.useState("");
  const [email, setemail] = React.useState("");
  const [loading, setloading] = React.useState(false);
  const user = auth.currentUser;
  const db = getFirestore(app);
  const checkIfUserExists = async (email) => {
    try {
      const userRef = doc(db, "users", email);
      const userSnapshot = await getDoc(userRef);
      console.log("User exists:", userSnapshot.exists());
      return userSnapshot.exists();
    } catch (error) {
      console.error("Error checking user existence:", error.message);
      return false;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        checkIfUserExists(user.email).then((exists) => {
          if (exists) {
            setLoggedin(true);
          } else {
            setLoggedin(false);
          }
        });
      } else {
        setLoggedin(false);
      }
    });

    return () => unsubscribe();
  }, [auth]);
  const handleClick = () => {
    if (loggedin) {
      window.location.href = "/feed";
    } else {
      window.location.href = "/login";
    }
  };
  const handlesignup = () => {
    window.location.href = "/signup";
  };
  const boxVariant = {
    visible: { opacity: 1, scale: 2 },
    hidden: { opacity: 0, scale: 0 },
  };
  const handleWaitlist = () => {
    const waitlistSection = document.getElementsByTagName("section")[0];
    if (waitlistSection) {
      waitlistSection.scrollIntoView({ behavior: "smooth" });
    }
  };
  const handleWaitlistSubmit = async (e) => {
    e.preventDefault();
    try {
      setloading(true);
      if (name === "" || email === "") {
        toast.error("Please fill all the fields");
        setloading(false);
        return;
      }
      const wref = doc(db, "waitlist", email);
      const docSnapshot = await getDoc(wref);
      if (docSnapshot.exists()) {
        toast("Already registered");
        setloading(false);
        setname("");
        setemail("");
        return;
      }
      await setDoc(wref, {
        name: name,
        email: email,
      });
      toast.success("Registered successfully");
      const response = await fetch("/api/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          subject: "Muse Waitlist",
          message: "Thanks a lot for registering",
        }),
      });
      setname("");
      setemail("");
      setloading(false);
    } catch (error) {
      console.error("Error registering user:", error.message);
      toast.error("Error registering user");
      setloading(false);
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="maindiv h-dvh w-screen overflow-y-auto">
      <Toaster />
      <div className="fixed w-screen top-0 z-20">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={itemVariants}
          className="flex mx-4 lg:mx-96 justify-between shadow-2xl border-2 border-gray-400 backdrop-filter backdrop-blur-3xl bg-white bg-opacity-50 py-2 my-2 rounded-full px-5 transition-all duration-500"
        >
          <motion.button
            variants={itemVariants}
            className="font-lucy transition-colors duration-300 hover:text-blue-500"
          >
            Muse
          </motion.button>
          <motion.div variants={itemVariants} className="dede flex">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleWaitlist}
              className="transition-colors duration-300 hover:text-blue-500"
            >
              Join Waitlist
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
      <Hello />
      <HJBlock
        imagePath="/main/p1.png"
        title="Muse: A Symphony of Design and Functionality"
        description="Immerse yourself in the harmonious blend of artistry and utility, as Muse orchestrates a new era of social interaction."
      />
      <HJBlock
        imagePath="/main/p2.png"
        title="Muse: Spark Instant Connections with Effortless Messaging"
        description="Experience the thrill of instant communication, where every message ignites new conversations and strengthens bonds."
      />
      <HJBlock
        imagePath="/main/p3.png"
        title="Muse: Unveiling Reels, Your Stage for Captivating Stories"
        description="Step into the spotlight and unleash your creativity with Muse Reels, where every moment shines bright."
      />
      <HJBlock
        imagePath="/main/p4.png"
        title="Muse: Explore the Uncharted Depths of Social Discovery"
        description="Embark on a journey of endless exploration, where each click uncovers new stories, ideas, and connections waiting to be discovered."
      />
      <section className="waitlist h-dvh pt-60 bg-transparent">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={itemVariants}
          className="name text-center mt-20"
        >
          <motion.div
            variants={itemVariants}
            className=" text-5xl md:text-8xl font-lucy transition-colors duration-300 hover:text-blue-500"
          >
            Join the Waitlist
          </motion.div>
          <motion.div
            variants={itemVariants}
            className="text-lg mt-2 mb-8 text-opacity-60 mx-10"
          >
            Be the first to experience Muse. Join Waitlist now!
          </motion.div>
        </motion.div>
        <motion.form
          initial="hidden"
          animate="visible"
          variants={itemVariants}
          onSubmit={handleWaitlistSubmit}
          className="flex flex-col items-center"
        >
          <motion.div
            variants={itemVariants}
            className="flex text-xl flex-col items-center"
          >
            <motion.input
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="text"
              value={name}
              onChange={(e) => setname(e.target.value)}
              className="mb-2 p-2 rounded-lg transition-all duration-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Name"
            />
            <motion.input
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="email"
              value={email}
              onChange={(e) => setemail(e.target.value)}
              className="mb-8 p-2 rounded-lg transition-all duration-300
              hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Email"
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              type="submit"
              disabled={loading}
              className="bg-white bg-opacity-45 hover:bg-opacity-80 shadow-md hover:shadow-2xl font-lucy mt- text-xl mb-8 text-black px-4 py-2 rounded-md transition-all duration-300"
            >
              {loading ? "Joining...😬" : "Join Museee  🚀🚀"}
            </motion.button>
          </motion.div>
        </motion.form>
      </section>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={itemVariants}
        className="footer mt-10 pb-2 pt-10 backdrop-filter backdrop-blur-3xl bg-white bg-opacity-50 rounded-t-xl"
      >
        <motion.div
          variants={itemVariants}
          className="font-lucy text-center text-5xl pb-5 transition-colors duration-300 hover:text-blue-500"
        >
          Muse
        </motion.div>
        <motion.div variants={itemVariants} className="text-center font-medium">
          Made with ❤️
        </motion.div>
        <motion.div variants={itemVariants} className="text-center">
          by
        </motion.div>
        <motion.div
          variants={itemVariants}
          className="font-bold text-center transition-colors duration-300 hover:text-blue-500"
        >
          No Filter LLC
        </motion.div>
        <motion.div
          variants={itemVariants}
          className="container mx-auto text-center mt-10"
        >
          <p className="text-sm ">© 2024 NoFilter LLC. All rights reserved.</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

const HJBlock = ({ imagePath, title, description }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    rootMargin: "-200px 0px",
  });

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeInOut" },
    },
  };

  return (
    <motion.div
      ref={ref}
      variants={itemVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className="hj  mt-16"
    >
      <motion.div className="rounded-l-xl px-2 md:px-16 transition-all duration-300">
        <Image
          className="w-screen rounded-md   "
          src={imagePath}
          height={1000}
          width={2000}
          alt=""
        />
      </motion.div>
      <motion.div
        className="w-full md:w-1/2 px-20 mt-36"
        variants={itemVariants}
      >
        <motion.div className="qw text-4xl md:text-8xl font-lucy">
          {title}
        </motion.div>
        <motion.div className="w text-xl md:text-3xl mt-8 opacity-60">
          {description}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default SparklesPreview;
