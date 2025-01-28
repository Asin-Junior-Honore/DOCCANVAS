import React, { useEffect } from "react";

const FilePreview = ({
  uploadedFile,
  fileType,
  docContent,
  xlsContent,
  canvasRef,
  isDrawing,
  drawType,
  shapes,
  setShapes,
  text,
}) => {
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

      // Scale for canvas size
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      // Clear and redraw previous shapes
      context.clearRect(0, 0, canvas.width, canvas.height);
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
            context.fillStyle = `rgba(${shape.color.r}, ${shape.color.g}, ${shape.color.b}, ${shape.color.a})`;
            context.fillRect(
              shape.startX * scaleX,
              shape.startY * scaleY,
              shape.width * scaleX,
              shape.height * scaleY
            );
            break;
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

      // Draw the current shape
      context.beginPath();
      switch (drawType) {
        case "line":
          context.moveTo(startX * scaleX, startY * scaleY);
          context.lineTo(currentX * scaleX, currentY * scaleY);
          context.stroke();
          break;
        case "circle":
          const radius = Math.sqrt(
            Math.pow(currentX - startX, 2) + Math.pow(currentY - startY, 2)
          );
          context.arc(
            startX * scaleX,
            startY * scaleY,
            radius * scaleX,
            0,
            2 * Math.PI
          );
          context.stroke();
          break;
        case "square":
          const size = Math.max(
            Math.abs(currentX - startX),
            Math.abs(currentY - startY)
          );
          context.rect(
            startX * scaleX,
            startY * scaleY,
            size * scaleX,
            size * scaleY
          );
          context.stroke();
          break;
        case "highlight":
          context.fillStyle = "rgba(255, 255, 0, 0.3)";
          context.fillRect(
            startX * scaleX,
            startY * scaleY,
            (currentX - startX) * scaleX,
            (currentY - startY) * scaleY
          );
          break;
        case "opaqueHighlight":
          context.fillStyle = "rgba(0, 0, 0, 1)";
          context.fillRect(
            startX * scaleX,
            startY * scaleY,
            (currentX - startX) * scaleX,
            (currentY - startY) * scaleY
          );
          break;
        case "text":
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

      // Save the completed shape
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

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
  }, [fileType]);

  return (
    <div className="relative h-full">
      <main
        className={`overflow-y-scroll relative z-0 transition-opacity duration-300 ${
          fileType ? "opacity-100" : "opacity-0 hidden pointer-events-none"
        }`}
        style={{ height: "550px" }}
      >
        {fileType === "pdf" && (
          <iframe
            src={uploadedFile}
            width="100%"
            className="border h-screen rounded overflow-y-scroll"
          ></iframe>
        )}
        {fileType === "docx" && (
          <div
            className="text-gray-800 leading-relaxed p-4 bg-white border rounded shadow"
            style={{
              fontFamily: "Times New Roman, serif",
              whiteSpace: "pre-wrap",
            }}
          >
            {docContent}
          </div>
        )}
        {fileType === "xls" || fileType === "xlsx" ? (
          xlsContent && xlsContent.length > 0 ? (
            <table className="table-auto border-collapse w-full">
              <thead>
                <tr>
                  {Object.keys(xlsContent[0]).map((header, idx) => (
                    <th key={idx} className="border p-2">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {xlsContent.map((row, index) => (
                  <tr key={index}>
                    {Object.values(row).map((value, idx) => (
                      <td key={idx} className="border p-2">
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500">
              No data available in the spreadsheet.
            </p>
          )
        ) : null}
        {fileType === "jpg" || fileType === "png" ? (
          <div className="bg-white border rounded shadow lg:w-[700px]">
            <img
              src={uploadedFile}
              alt="Uploaded"
              className="size-full rounded shadow object-contain"
            />
          </div>
        ) : null}
      </main>
      <div>{text}</div>

      {/* Canvas for drawing */}
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        className="absolute top-0 left-0 z-10 w-[98%] h-full pointer-events-auto"
        style={{ pointerEvents: isDrawing ? "auto" : "none" }}
      />
    </div>
  );
};

export default FilePreview;
