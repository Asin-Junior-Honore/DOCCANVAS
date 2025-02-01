import React, { useState, useRef, useEffect } from "react";

const DraggableText = ({ drawType, text }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 150, y: 150 });
  const textRef = useRef(null);
  const offset = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (!textRef.current) return;

    setIsDragging(true);

    // Get the text element's position relative to the mouse
    const rect = textRef.current.getBoundingClientRect();
    offset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    e.preventDefault(); // Prevent text selection while dragging
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;

      // Calculate new position based on mouse movement
      setPosition({
        x: e.clientX - offset.current.x,
        y: e.clientY - offset.current.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <section>
      {drawType === "text" && text && (
        <p
          ref={textRef}
          className="absolute text-blue-700 font-semibold cursor-grab active:cursor-grabbing"
          style={{
            fontSize: "24px",
            left: `${position.x}px`,
            top: `${position.y}px`,
            transform: "translate(-50%, -50%)",
            zIndex: 20,
            userSelect: "none",
          }}
          onMouseDown={handleMouseDown}
        >
          {text}
        </p>
      )}
    </section>
  );
};

export default DraggableText;
