import { create } from "zustand";

type SidebarStore = {
  isOpen: boolean;
  chatopen: boolean;
  initialLoad: boolean;
  toggleload: () => void;
  setchatopen: () => void;
  toggle: () => void;
};

export const useSidebarStore = create<SidebarStore>((set) => ({
  isOpen: true,
  initialLoad: true,
  toggleload: () =>
    set((state) => ({ initialLoad: (state.initialLoad = false) })),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  chatopen: false,
  setchatopen: () => set((state) => ({ chatopen: !state.chatopen })),
}));
