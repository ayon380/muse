import { useState, useRef, useEffect } from 'react';

const BottomSheet = ({ children, initiallyOpen = false }) => {
  const [isOpen, setIsOpen] = useState(initiallyOpen);
  const [isDragging, setIsDragging] = useState(false);
  const sheetRef = useRef(null);
  const startYRef = useRef(0);
  const currentYRef = useRef(0);

  const openSheet = () => setIsOpen(true);
  const closeSheet = () => setIsOpen(false);

  const handleTouchStart = (e) => {
    startYRef.current = e.touches[0].clientY;
    currentYRef.current = e.touches[0].clientY;
    setIsDragging(true);
    if (sheetRef.current) {
      sheetRef.current.style.transition = 'none';
    }
    // Prevent pull-to-refresh
    e.preventDefault();
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    currentYRef.current = e.touches[0].clientY;
    const diff = currentYRef.current - startYRef.current;
    if (sheetRef.current && diff > 0) {
      sheetRef.current.style.transform = `translateY(${diff}px)`;
    }
    // Prevent pull-to-refresh
    e.preventDefault();
  };

  const handleTouchEnd = () => {
    if (!isDragging || !sheetRef.current) return;
    setIsDragging(false);
    const diff = currentYRef.current - startYRef.current;
    const threshold = sheetRef.current.clientHeight * 0.25;
    sheetRef.current.style.transition = 'transform 0.3s ease-out';
    if (diff > threshold) {
      closeSheet();
      sheetRef.current.style.transform = 'translateY(100%)';
    } else {
      sheetRef.current.style.transform = 'translateY(0)';
    }
  };

  const handleOutsideClick = (e) => {
    if (isOpen && sheetRef.current && !sheetRef.current.contains(e.target)) {
      closeSheet();
    }
  };

  useEffect(() => {
    const handleTouchCancel = () => {
      if (sheetRef.current) {
        sheetRef.current.style.transition = 'transform 0.3s ease-out';
        sheetRef.current.style.transform = isOpen ? 'translateY(0)' : 'translateY(100%)';
      }
      setIsDragging(false);
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick, { passive: true });
    document.addEventListener('touchcancel', handleTouchCancel);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      document.removeEventListener('touchcancel', handleTouchCancel);
    };
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'auto';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  useEffect(() => {
    if (sheetRef.current) {
      sheetRef.current.style.transform = isOpen ? 'translateY(0)' : 'translateY(100%)';
    }
  }, [isOpen]);

  return (
    <>
      {!initiallyOpen && (
        <button
          type="button"
          onClick={openSheet}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Open Bottom Sheet
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40" />
      )}

      <div
        ref={sheetRef}
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-lg z-50 transition-transform duration-300 ease-out"
        style={{
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="flex justify-center pt-4 pb-2 touch-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>
        <div className="px-4 pb-6 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </>
  );
};

export default BottomSheet;