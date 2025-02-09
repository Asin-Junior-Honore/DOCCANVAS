import React, { useEffect, useRef } from "react";
const ImgPreview = ({
  uploadedFile,
  canvasRef,
  isDrawing,
  drawType,
  shapes,
  setShapes,
  text,
}) => {
  const imgRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current && imgRef.current) {
      const canvas = canvasRef.current;
      const img = imgRef.current;

      // Set canvas size to match the image's natural size
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
    }
  }, [uploadedFile]);

  const startDrawing = (e) => {
    if (!isDrawing || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;

    const drawShape = (e) => {
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;

      // Redraw all previous shapes first
      context.clearRect(0, 0, canvas.width, canvas.height);
      drawStoredShapes(context, canvas);

      // Now draw the new shape
      context.beginPath();
      switch (drawType) {
        case "line":
          context.moveTo(startX, startY);
          context.lineTo(currentX, currentY);
          context.stroke();
          break;
        case "circle":
          const radius = Math.sqrt(
            Math.pow(currentX - startX, 2) + Math.pow(currentY - startY, 2)
          );
          context.arc(startX, startY, radius, 0, 2 * Math.PI);
          context.stroke();
          break;
        case "square":
          const size = Math.max(
            Math.abs(currentX - startX),
            Math.abs(currentY - startY)
          );
          context.rect(startX, startY, size, size);
          context.stroke();
          break;
        case "highlight":
          context.fillStyle = "rgba(255, 255, 0, 0.3)";
          context.fillRect(
            startX,
            startY,
            currentX - startX,
            currentY - startY
          );
          break;
        case "opaqueHighlight":
          context.fillStyle = "rgba(0, 0, 0, 1)";
          context.fillRect(
            startX,
            startY,
            currentX - startX,
            currentY - startY
          );
          break;
        case "text":
          context.font = "bold 20px Arial";
          context.fillText(text, startX * scaleX, startY * scaleY);
          break;
        default:
          break;
      }
      context.closePath();
    };

    const stopDrawing = (e) => {
      const endX = e.clientX - rect.left;
      const endY = e.clientY - rect.top;

      setShapes((prevShapes) => [
        ...prevShapes,
        {
          type: drawType,
          startX,
          startY,
          endX,
          endY,
          radius:
            drawType === "circle"
              ? Math.sqrt(
                  Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
                )
              : undefined,
          size:
            drawType === "square"
              ? Math.max(Math.abs(endX - startX), Math.abs(endY - startY))
              : undefined,
          width: endX - startX,
          height: endY - startY,
          color:
            drawType === "highlight"
              ? { r: 255, g: 255, b: 0, a: 0.3 }
              : drawType === "opaqueHighlight"
              ? { r: 0, g: 0, b: 0, a: 1 }
              : undefined,
          text: drawType === "text" ? text : undefined,
        },
      ]);

      canvas.removeEventListener("mousemove", drawShape);
      canvas.removeEventListener("mouseup", stopDrawing);
    };

    canvas.addEventListener("mousemove", drawShape);
    canvas.addEventListener("mouseup", stopDrawing);
  };

  // Function to redraw all stored shapes
  const drawStoredShapes = (context, canvas) => {
    const scaleX = canvas.width / canvas.offsetWidth;
    const scaleY = canvas.height / canvas.offsetHeight;

    shapes.forEach((shape) => {
      context.beginPath();
      switch (shape.type) {
        case "line":
          context.moveTo(shape.startX * scaleX, shape.startY * scaleY);
          context.lineTo(shape.endX * scaleX, shape.endY * scaleY);
          context.stroke();
          break;
        case "circle":
          context.arc(
            shape.startX * scaleX,
            shape.startY * scaleY,
            shape.radius * scaleX,
            0,
            2 * Math.PI
          );
          context.stroke();
          break;
        case "square":
          context.rect(
            shape.startX * scaleX,
            shape.startY * scaleY,
            shape.size * scaleX,
            shape.size * scaleY
          );
          context.stroke();
          break;
        case "highlight":
        case "opaqueHighlight":
          context.fillStyle = `rgba(${shape.color.r}, ${shape.color.g}, ${shape.color.b}, ${shape.color.a})`;
          context.fillRect(
            shape.startX * scaleX,
            shape.startY * scaleY,
            shape.width * scaleX,
            shape.height * scaleY
          );
          break;
        case "text":
          context.font = "bold 20px Arial";
          context.fillText(
            shape.text,
            shape.startX * scaleX,
            shape.startY * scaleY
          );
          break;
        default:
          break;
      }
      context.closePath();
    });
  };

  return (
    <div className="relative inline-block w-full">
      <img
        ref={imgRef}
        src={uploadedFile}
        alt="Uploaded"
        className="max-w-full"
        onLoad={() => {
          if (canvasRef.current && imgRef.current) {
            const canvas = canvasRef.current;
            const img = imgRef.current;
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
          }
        }}
      />
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        className="absolute top-0 left-0 pointer-events-auto max-w-full h-[-webkit-fill-available]"
      />
    </div>
  );
};

export default ImgPreview;
