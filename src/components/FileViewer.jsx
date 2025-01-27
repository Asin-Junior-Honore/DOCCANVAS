import React, { useState, useRef } from "react";
import mammoth from "mammoth";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import { getDocument } from "pdfjs-dist";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url";
import ExcelJS from "exceljs";
import { Document, Packer, Paragraph, TextRun, ImageRun } from "docx";
import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
const FileUploader = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileType, setFileType] = useState("");
  const [docContent, setDocContent] = useState("");
  const [xlsContent, setXlsContent] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawType, setDrawType] = useState(null);
  const [text, setText] = useState("");
  const [shapes, setShapes] = useState([]);

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

      // Redraw all previously saved shapes
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
            setUploadedFile(file);
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

  const saveFile = async () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (fileType === "jpg" || fileType === "png") {
      const img = new Image();
      img.src = uploadedFile; // Use the uploaded image's URL
      img.onload = () => {
        // Set canvas size to match the image
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw the base image onto the canvas
        context.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Redraw all saved shapes
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

        // Save the canvas as an image
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = "modified.png";
        link.click();
      };
    } else if (fileType === "xls" || fileType === "xlsx") {
      const workbook = new ExcelJS.Workbook();

      // Create a worksheet and populate it with `xlsContent`
      const worksheet = workbook.addWorksheet("Canvas Drawing");

      // Add the headers
      const headers = Object.keys(xlsContent[0]);
      worksheet.addRow(headers);

      // Add the rows
      xlsContent.forEach((row) => {
        worksheet.addRow(Object.values(row));
      });

      // Convert canvas to base64 image
      const imgData = canvas.toDataURL("image/png");

      // Add the image to the workbook
      const imageId = workbook.addImage({
        base64: imgData,
        extension: "png",
      });

      // Position the image in the worksheet
      worksheet.addImage(imageId, {
        tl: { col: 0, row: 0 }, // Top-left corner (column 1, row 1)
        ext: { width: canvas.width, height: canvas.height }, // Set the image dimensions
      });

      // Save the modified workbook
      workbook.xlsx
        .writeBuffer()
        .then((buffer) => {
          const blob = new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = "modified.xlsx";
          link.click();
        })
        .catch((error) => {
          console.error("Error saving Excel file:", error);
        });
    } else if (fileType === "pdf") {
      const pdf = new jsPDF("landscape");
      const pdfDoc = await getDocument(uploadedFile).promise;
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      // Iterate through each page of the PDF
      for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2 }); // Adjust scale as needed

        // Set canvas dimensions to match the PDF page
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // Render the PDF page onto the canvas
        await page.render({ canvasContext: context, viewport }).promise;

        // Draw annotations on top of the rendered PDF page
        shapes.forEach((shape) => {
          context.beginPath();
          switch (shape.type) {
            case "line":
              context.moveTo(shape.startX, shape.startY);
              context.lineTo(shape.endX, shape.endY);
              context.strokeStyle = shape.color || "black";
              context.lineWidth = shape.lineWidth || 2;
              context.stroke();
              break;
            case "circle":
              context.arc(
                shape.startX,
                shape.startY,
                shape.radius,
                0,
                2 * Math.PI
              );
              context.strokeStyle = shape.color || "black";
              context.lineWidth = shape.lineWidth || 2;
              context.stroke();
              break;
            case "square":
              context.rect(shape.startX, shape.startY, shape.size, shape.size);
              context.strokeStyle = shape.color || "black";
              context.lineWidth = shape.lineWidth || 2;
              context.stroke();
              break;
            case "highlight":
              context.fillStyle = `rgba(${shape.color.r}, ${shape.color.g}, ${shape.color.b}, ${shape.color.a})`;
              context.fillRect(
                shape.startX,
                shape.startY,
                shape.width,
                shape.height
              );
              break;
            case "text":
              context.fillStyle = shape.color || "black";
              context.font = `${shape.fontSize || 16}px Arial`;
              context.fillText(shape.text, shape.startX, shape.startY);
              break;
            default:
              break;
          }
          context.closePath();
        });

        // Add the canvas as an image to the PDF
        const imgData = canvas.toDataURL("image/png");
        pdf.addImage(
          imgData,
          "PNG",
          0,
          0,
          pdf.internal.pageSize.getWidth(),
          pdf.internal.pageSize.getHeight()
        );

        // Add a new page if not the last
        if (pageNum < pdfDoc.numPages) {
          pdf.addPage();
        }
      }

      // Save the modified PDF
      pdf.save("modified.pdf");
    } else if (fileType === "docx") {
      // Load the original DOCX file
      const arrayBuffer = await uploadedFile.arrayBuffer();
      const zip = new PizZip(arrayBuffer);
      const doc = new Docxtemplater().loadZip(zip);

      // Extract the full content (paragraphs) of the DOCX file using PizZip
      const docxXml = zip.file("word/document.xml").asText();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(docxXml, "application/xml");

      // Extract paragraphs and their runs (text with formatting)
      const paragraphs = Array.from(xmlDoc.getElementsByTagName("w:p"));

      // Convert the paragraphs into a format that Docx will understand
      const docParagraphs = paragraphs.map((p) => {
        const runs = Array.from(p.getElementsByTagName("w:r"));
        return new Paragraph({
          children: runs.map((r) => {
            const textNode = r.getElementsByTagName("w:t")[0];
            const text = textNode ? textNode.textContent : "";

            // Extract formatting (e.g., bold, italic, etc.)
            const bold = r.getElementsByTagName("w:b").length > 0;
            const italic = r.getElementsByTagName("w:i").length > 0;
            const underline = r.getElementsByTagName("w:u").length > 0;
            const color = r.getElementsByTagName("w:color")[0]
              ? r.getElementsByTagName("w:color")[0].getAttribute("w:val")
              : undefined;
            const highlight = r.getElementsByTagName("w:highlight")[0]
              ? r.getElementsByTagName("w:highlight")[0].getAttribute("w:val")
              : undefined;

            return new TextRun({
              text: text,
              bold: bold,
              italic: italic,
              underline: underline,
              color: color,
              highlight: highlight,
            });
          }),
        });
      });

      // Convert canvas to an image (this includes drawings and highlights)
      const imgData = canvas.toDataURL("image/png");
      const imageBuffer = Uint8Array.from(atob(imgData.split(",")[1]), (c) =>
        c.charCodeAt(0)
      );

      // Create the DOCX document with the original content, canvas image, and annotations
      const newDoc = new Document({
        sections: [
          {
            properties: {}, // Document properties
            children: [
              // Add the original content (with formatting)
              ...docParagraphs,

              // Add the canvas image (drawing/highlight)
              new Paragraph({
                children: [
                  new ImageRun({
                    data: imageBuffer,
                    transformation: {
                      width: 600, // Adjust the width of the image
                      height: 400, // Adjust the height of the image
                    },
                  }),
                ],
              }),

              // Add annotations (e.g., text, highlights, etc.)
              ...shapes.map((shape) => {
                switch (shape.type) {
                  case "text":
                    return new Paragraph({
                      children: [
                        new TextRun({
                          text: shape.text,
                          color: shape.color || "black",
                        }),
                      ],
                    });
                  case "highlight":
                    return new Paragraph({
                      children: [
                        new TextRun({
                          text: shape.text || "Highlighted Text",
                          highlight: shape.color || "yellow",
                        }),
                      ],
                    });
                  case "line":
                  case "circle":
                  case "square":
                    // For drawings, add a placeholder or description
                    return new Paragraph({
                      children: [
                        new TextRun({
                          text: `[Drawing: ${shape.type}]`,
                        }),
                      ],
                    });
                  default:
                    return new Paragraph({});
                }
              }),
            ],
          },
        ],
      });

      // Save the modified DOCX file
      const blob = await Packer.toBlob(newDoc);
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "modified.docx";
      link.click();
    }
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

      <div className="mt-4">
        {fileType && (
          <button
            onClick={saveFile}
            className="p-2 bg-green-500 text-white rounded"
          >
            Save File
          </button>
        )}
      </div>

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
