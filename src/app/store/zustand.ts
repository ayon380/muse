import { create, UseBoundStore, StoreApi } from "zustand";
import { doc, getDoc } from "firebase/firestore";
import app from "@/lib/firebase/firebaseConfig";
import { getFirestore } from "firebase/firestore";

type SidebarStore = {
  isOpen: boolean;
  chatopen: boolean;
  initialLoad: boolean;
  postdataupdate: string;
  unread: number;
  routechanging: boolean;
  usermetadata: Record<string, any>;
  setroutechanging: () => void;
  setpostdataupdate: (data: string) => void;
  setUserMetadata: (data: Record<string, any>) => void;
  toggleload: () => void;
  setchatopen: () => void;
  setunread: (data: number) => void;
  toggle: () => void;
  enqueueUserMetadata: (uid: string) => Promise<void>;
};

const db = getFirestore(app);

export const useSidebarStore = create<SidebarStore>(
  (set, get): SidebarStore => {
    const usermetadata: Record<string, any> = {};

    const enqueueUserMetadata = async (uid: string) => {
      try {
        return new Promise<void>((resolve) => {
          if (!usermetadata[uid]) {
            console.log("Fetching user metadata");
            if (typeof uid !== "string") return;
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
      }
      catch (e) {
        console.error(e);
      }
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
      isOpen: false,
      chatopen: false,
      unread: 0,
      initialLoad: true,
      postdataupdate: "",
      routechanging: false,
      usermetadata: {},
      setroutechanging: () => set((state) => ({ routechanging: !state.routechanging })),
      setunread: (data) => set((state) => ({ unread: data })),
      setpostdataupdate: (data) => set((state) => ({ postdataupdate: data })),
      setUserMetadata: (data) =>
        set((state) => ({ usermetadata: { ...state.usermetadata, ...data } })),
      toggleload: () => set((state) => ({ initialLoad: false })),
      setchatopen: () => set((state) => ({ chatopen: !state.chatopen })),
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
      enqueueUserMetadata,
    };
  }
  // { name: "sidebar-store", devtools: true }
);
