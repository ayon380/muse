import { create } from 'zustand'

type SidebarStore = {
    isOpen: boolean;
    chatopen: boolean;
    setchatopen: () => void;
    toggle: () => void;
}

export const useSidebarStore = create<SidebarStore>((set) => ({
    isOpen: true,
    toggle: () => set((state) => ({ isOpen: !state.isOpen })),
    chatopen: false,
    setchatopen: () => set((state) => ({ chatopen: !state.chatopen })),
}))