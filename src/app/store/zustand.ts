import { create, UseBoundStore, StoreApi } from "zustand";
import { doc, getDoc } from "firebase/firestore";
import app from "@/lib/firebase/firebaseConfig";
import { getFirestore } from "firebase/firestore";

type SidebarStore = {
  isOpen: boolean;
  chatopen: boolean;
  initialLoad: boolean;
  usermetadata: Record<string, any>;
  setUserMetadata: (data: Record<string, any>) => void;
  toggleload: () => void;
  setchatopen: () => void;
  toggle: () => void;
  enqueueUserMetadata: (uid: string) => Promise<void>;
};

const db = getFirestore(app);

export const useSidebarStore = create<SidebarStore>(
  (set, get): SidebarStore => {
    const usermetadata: Record<string, any> = {};

    const enqueueUserMetadata = async (uid: string) => {
      return new Promise<void>((resolve) => {
        if (!usermetadata[uid]) {
          console.log("Fetching user metadata");
          const userRef = doc(db, "username", uid);
          getDoc(userRef).then((docSnap) => {
            if (docSnap.exists()) {
              set((state) => ({
                usermetadata: { ...state.usermetadata, [uid]: docSnap.data() },
              }));
              resolve();
            }
          });
        } else {
          resolve();
        }
      });
    };

    const updateMetadata = async () => {
      console.log("Updating metadata");
      
      const userIds = Object.keys(usermetadata);
      for (const uid of userIds) {
        await enqueueUserMetadata(uid);
      }
    };

    updateMetadata();
    const updateInterval = setInterval(updateMetadata, 60000); // 1 minute

    return {
      isOpen: true,
      chatopen: false,
      initialLoad: true,
      usermetadata,
      setUserMetadata: (data) =>
        set((state) => ({ usermetadata: { ...state.usermetadata, ...data } })),
      toggleload: ()=>set((state) => ({ initialLoad: (state.initialLoad = false) })),
      setchatopen: () => set((state) => ({ chatopen: !state.chatopen })),
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
      enqueueUserMetadata,
    };
  }
  // { name: "sidebar-store", devtools: true }
);
