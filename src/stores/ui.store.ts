import { create } from "zustand";

interface UiState {
  isCartPanelOpen: boolean;
  isMobileSidebarOpen: boolean;
  openCartPanel: () => void;
  closeCartPanel: () => void;
  toggleCartPanel: () => void;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  isCartPanelOpen: false,
  isMobileSidebarOpen: false,
  openCartPanel: () => set({ isCartPanelOpen: true }),
  closeCartPanel: () => set({ isCartPanelOpen: false }),
  toggleCartPanel: () => set((state) => ({ isCartPanelOpen: !state.isCartPanelOpen })),
  toggleMobileSidebar: () => set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen })),
  closeMobileSidebar: () => set({ isMobileSidebarOpen: false }),
}));
