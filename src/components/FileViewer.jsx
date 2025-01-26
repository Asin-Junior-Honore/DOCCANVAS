import React, { useState, useRef } from "react";
import mammoth from "mammoth";
import * as XLSX from "xlsx";

const FileUploader = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileType, setFileType] = useState("");
  const [docContent, setDocContent] = useState("");
  const [xlsContent, setXlsContent] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawType, setDrawType] = useState(null); // 'line', 'circle', 'square', 'text', 'highlight', 'opaqueHighlight'
  const [text, setText] = useState("");
  const [highlights, setHighlights] = useState([]); // Array to store highlights
  const [opaqueHighlights, setOpaqueHighlights] = useState([]); // Array for opaque highlights
  const canvasRef = useRef(null);

  // Change cursor styles
  const handleToolClick = (type) => {
    setDrawType(type);
    setIsDrawing(true);

    // Change cursor based on the tool selected
    if (type === "text") {
      document.body.style.cursor = "text";
    } else if (type === "highlight") {
      document.body.style.cursor = "pointer"; // Highlight tool cursor
    } else if (type === "opaqueHighlight") {
      document.body.style.cursor = "pointer"; // Opaque highlight cursor
    } else if (type) {
      document.body.style.cursor = "crosshair"; // Crosshair for shapes
    }

    // Disable text selection when drawing
    document.body.style.userSelect = "none";
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];

    if (file) {
      const fileExtension = file.name.split(".").pop().toLowerCase();
      const allowedExtensions = [
        "pdf",
        "doc",
        "docx",
        "xls",
        "xlsx",
        "jpg",
        "png",
        "msg",
      ];

      if (allowedExtensions.includes(fileExtension)) {
        setFileType(fileExtension);

        if (fileExtension === "docx") {
          const reader = new FileReader();
          reader.onload = async (event) => {
            const arrayBuffer = event.target.result;
            const result = await mammoth.extractRawText({ arrayBuffer });
            setDocContent(result.value);
          };
          reader.readAsArrayBuffer(file);
        } else if (fileExtension === "xls" || fileExtension === "xlsx") {
          const reader = new FileReader();
          reader.onload = async (event) => {
            const arrayBuffer = event.target.result;
            const workbook = XLSX.read(arrayBuffer, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(sheet);
            setXlsContent(json);
          };
          reader.readAsArrayBuffer(file);
        } else {
          setUploadedFile(URL.createObjectURL(file));
        }
      } else {
        alert("Unsupported file format. Please upload a valid file.");
      }
    }
  };

  const startDrawing = (e) => {
    if (!isDrawing || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;

    let drawShape = (e) => {
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;

      // Scale the drawing based on the canvas size
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      // Redraw all highlights and opaque highlights before drawing new shapes
      context.clearRect(0, 0, canvas.width, canvas.height);
      highlights.forEach((highlight) => {
        context.fillStyle = `rgba(${highlight.color.r}, ${highlight.color.g}, ${highlight.color.b}, ${highlight.color.a})`;
        context.fillRect(
          highlight.startX * scaleX,
          highlight.startY * scaleY,
          highlight.width * scaleX,
          highlight.height * scaleY
        );
      });
      opaqueHighlights.forEach((highlight) => {
        context.fillStyle = `rgba(${highlight.color.r}, ${highlight.color.g}, ${highlight.color.b}, ${highlight.color.a})`;
        context.fillRect(
          highlight.startX * scaleX,
          highlight.startY * scaleY,
          highlight.width * scaleX,
          highlight.height * scaleY
        );
      });

      switch (drawType) {
        case "line":
          context.beginPath();
          context.moveTo(startX * scaleX, startY * scaleY);
          context.lineTo(currentX * scaleX, currentY * scaleY);
          context.stroke();
          break;
        case "circle":
          const radius = Math.sqrt(
            Math.pow(currentX - startX, 2) + Math.pow(currentY - startY, 2)
          );
          context.beginPath();
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
          context.beginPath();
          context.rect(
            startX * scaleX,
            startY * scaleY,
            size * scaleX,
            size * scaleY
          );
          context.stroke();
          break;
        case "highlight":
          const highlightWidth = currentX - startX;
          const highlightHeight = currentY - startY;
          context.fillStyle = "rgba(255, 255, 0, 0.3)"; // Semi-transparent yellow highlight
          context.fillRect(
            startX * scaleX,
            startY * scaleY,
            highlightWidth * scaleX,
            highlightHeight * scaleY
          );

          // Save the highlight position for future redraws
          setHighlights((prevHighlights) => [
            ...prevHighlights,
            {
              startX,
              startY,
              width: highlightWidth,
              height: highlightHeight,
              color: { r: 255, g: 255, b: 0, a: 0.3 }, // RGBA for transparent yellow
            },
          ]);
          break;
        case "opaqueHighlight":
          const opaqueWidth = currentX - startX;
          const opaqueHeight = currentY - startY;
          context.fillStyle = "rgba(0, 0, 0, 1)"; // Solid black opaque highlight
          context.fillRect(
            startX * scaleX,
            startY * scaleY,
            opaqueWidth * scaleX,
            opaqueHeight * scaleY
          );

          // Save the opaque highlight position for future redraws
          setOpaqueHighlights((prevHighlights) => [
            ...prevHighlights,
            {
              startX,
              startY,
              width: opaqueWidth,
              height: opaqueHeight,
              color: { r: 0, g: 0, b: 0, a: 1 }, // Opaque black
            },
          ]);
          break;
        case "text":
          context.fillText(text, startX * scaleX, startY * scaleY);
          break;
        default:
          break;
      }
    };

    const stopDrawing = () => {
      canvas.removeEventListener("mousemove", drawShape);
      canvas.removeEventListener("mouseup", stopDrawing);
    };

    canvas.addEventListener("mousemove", drawShape);
    canvas.addEventListener("mouseup", stopDrawing);
  };

  const renderFilePreview = () => {
    if (!uploadedFile && !docContent && !xlsContent.length) return null;

    const handleScroll = () => {
      if (canvasRef.current) {
        canvasRef.current.style.pointerEvents = "none"; // Allow scrolling
      }
    };

    const handleScrollEnd = () => {
      if (canvasRef.current) {
        canvasRef.current.style.pointerEvents = "auto"; // Re-enable drawing
      }
    };

    return (
      <div
        className="relative h-[550px] overflow-y-scroll"
        onScroll={handleScroll}
        onMouseLeave={handleScrollEnd}
        onMouseEnter={handleScrollEnd}
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

        {fileType === "jpg" || fileType === "png" ? (
          <div className=" bg-white border rounded shadow w-[100%]">
            <img
              src={uploadedFile}
              alt="Uploaded"
              className="size-full rounded shadow object-contain"
            />
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              className="absolute top-0 left-0 "
              style={{
                pointerEvents: "auto",
                width: "100%",
                height: "100%",
              }}
            ></canvas>
          </div>
        ) : null}

        {fileType === "xls" || fileType === "xlsx" ? (
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
        ) : null}
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          className="absolute top-0 left-0"
          style={{
            pointerEvents: "auto", // Enable drawing events on the canvas
            width: "100%",
            height: "100%",
          }}
        ></canvas>
      </div>
    );
  };

  return (
    <div className="p-4">
      <input
        type="file"
        onChange={handleFileChange}
        className="mb-4 block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
      />
      <div className="mt-6">{renderFilePreview()}</div>

      {/* Drawing Tools */}
      <div className="mt-4">
        {fileType && (
          <>
            <button
              onClick={() => handleToolClick("line")}
              className="p-2 mr-2 bg-blue-500 text-white"
            >
              Draw Line
            </button>
            <button
              onClick={() => handleToolClick("circle")}
              className="p-2 mr-2 bg-blue-500 text-white"
            >
              Draw Circle
            </button>
            <button
              onClick={() => handleToolClick("square")}
              className="p-2 mr-2 bg-blue-500 text-white"
            >
              Draw Square
            </button>
            <button
              onClick={() => handleToolClick("highlight")}
              className="p-2 mr-2 bg-blue-500 text-white"
            >
              Transparent Highlight
            </button>
            <button
              onClick={() => handleToolClick("opaqueHighlight")}
              className="p-2 mr-2 bg-red-500 text-white"
            >
              Opaque Highlight
            </button>
            <button
              onClick={() => handleToolClick("text")}
              className="p-2 mr-2 bg-blue-500 text-white"
            >
              Add Text
            </button>
            {drawType === "text" && (
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="p-2 border rounded"
                placeholder="Enter text"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FileUploader;
