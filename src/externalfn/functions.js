 const deleteacc = async () => {
    try {
      console.log("delete");
      // Delete user data from Firestore
      const userdocref = doc(db, "users", user.email);
      const emailuserref = doc(db, "username", userdata.userName);
      await deleteDoc(userdocref);
      await deleteDoc(emailuserref);

      // Delete user images from Firebase Storage
      const imagesref = ref(storage, "images/", userdata.userName);
      console.log(imagesref);
      await deleteObject(imagesref);

      // Delete the user account
      await deleteUser(auth.currentUser);
      for (let i = 0; i < userdata.posts.length; i++) {
        const postref = doc(db, "posts", userdata.posts[i]);
        await deleteDoc(postref);
      }
      // Route the user to the home page
      router.push("/");
    } catch (error) {
      toast.error("Delete account error:", error.message);
    }
  };