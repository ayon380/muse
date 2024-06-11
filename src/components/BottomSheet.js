import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useSpring, animated } from "react-spring";
import { useDrag } from "@use-gesture/react";
import { memo } from "react";

const Overlay = styled(animated.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${({ show }) => (show ? "rgba(0, 0, 0, 0.5)" : "transparent")};
  display: ${({ show }) => (show ? "block" : "none")};
  z-index: 1000;
  transition: backdrop-filter 0.3s ease;
`;

const Sheet = styled(animated.div)`
  position: fixed;
  left: 0;
  right: 0;
  border-top: 1px solid ${({ isDark }) => (isDark ? "#374151" : "#e0e0e0")};
  bottom: 0;
  min-height: 50vh;
  background: ${({ show, isDark }) =>
    show ? (isDark ? "#000000" : "rgba(255, 255, 255, 0.9)") : "transparent"};
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  height: 75%;
  display: flex;
  z-index: 1001;
  flex-direction: column;
  cursor: grab;
`;

const Pill = styled.div`
  width: 40px;
  height: 6px;
  background: ${({ isDark }) => (isDark ? "#9CA3AF" : "#ccc")};
  border-radius: 3px;
  margin: 8px auto;
  cursor: pointer;
  touch-action: none;
`;

const SheetHeader = styled.div`
  padding-top: 16px;
  padding-left: 16px;
  padding-right: 16px;
  
  border-bottom: 1px solid ${({ isDark }) => (isDark ? "#374151" : "#e0e0e0")};
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: grab;
  touch-action: none;
`;

const SheetContent = styled.div`
  overflow-y: auto;
  flex-grow: 1;
`;

const BottomSheet = ({ show, onClose, heading, children }) => {
  const [{ y }, api] = useSpring(() => ({ y: 1000 }));
  const [blur, setBlur] = useState(0);
  const [isDark, setIsDark] = useState(false); // State for dark mode

  const screenHeight = window.innerHeight;

  const openSheet = () => {
    api.start({ y: 0 });
    setBlur(5);
  };

  const closeSheet = (velocity = 0) => {
    api.start({
      y: 1000,
      config: { tension: 200, friction: 30, velocity },
    });
    setBlur(0);
    onClose();
  };

  useEffect(() => {
    if (show) {
      openSheet();
    } else {
      closeSheet();
    }
  }, [show]);

  useEffect(() => {
    // Listen to dark mode changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDark(mediaQuery.matches); // Set initial state based on OS preference
    const handleChange = (e) => setIsDark(e.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const bind = useDrag(
    ({ last, movement: [, my], cancel, canceled }) => {
      if (my > screenHeight * 0.4 || (canceled && my > 0)) {
        cancel();
        closeSheet();
      } else {
        api.start({ y: last ? 0 : my, immediate: !last });
      }
    },
    { from: () => [0, y.get()], bounds: { top: 0 }, rubberband: true }
  );

  return (
    <>
      <Overlay show={show} blur={blur} onClick={closeSheet} />
      <Sheet
        show={show}
        isDark={isDark}
        style={{ transform: y.to((py) => `translateY(${py}px)`) }}
      >
        <Pill
          {...bind()}
          isDark={isDark}
          onTouchStart={(e) => e.stopPropagation()}
        />
        <SheetHeader
          isDark={isDark}
          {...bind()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <div className="flex w-full justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {heading}
            </h2>
            <button
              onClick={closeSheet}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none transition duration-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </SheetHeader>
        <SheetContent>{children}</SheetContent>
      </Sheet>
    </>
  );
};

export default memo(BottomSheet);
