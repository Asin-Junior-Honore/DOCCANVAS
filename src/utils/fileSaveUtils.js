import ExcelJS from "exceljs";
import { jsPDF } from "jspdf";
import { getDocument } from "pdfjs-dist";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url";
import PizZip from "pizzip";
import { Document, Packer, Paragraph, TextRun, ImageRun } from "docx";
import Docxtemplater from "docxtemplater";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
export const saveFile = async ({
  canvasRef,
  uploadedFile,
  fileType,
  shapes,
  xlsContent,
}) => {
  const canvas = canvasRef.current;
  const context = canvas.getContext("2d");

  if (fileType === "jpg" || fileType === "png") {
    const img = new Image();
    img.src = uploadedFile;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      // Match canvas size to the actual image size
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      // Draw the base image onto the canvas
      context.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Scale factors from displayed size to actual image size
      const scaleX = img.naturalWidth / canvasRef.current.width;
      const scaleY = img.naturalHeight / canvasRef.current.height;

      // Redraw all saved shapes
      shapes.forEach((shape) => {
        context.beginPath();
        context.lineWidth = 2;
        context.strokeStyle = "black";

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
              shape.radius * scaleX, // Apply scale
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
            if (shape.color && shape.color.r !== undefined) {
              context.fillStyle = `rgba(${shape.color.r}, ${shape.color.g}, ${shape.color.b}, ${shape.color.a})`;
            } else {
              context.fillStyle = "rgba(255, 255, 0, 0.3)"; // Default transparent highlight
            }
            context.fillRect(
              shape.startX * scaleX,
              shape.startY * scaleY,
              shape.width * scaleX,
              shape.height * scaleY
            );
            break;

          case "text":
            context.font = "20px Arial"; // Adjust text properties as needed
            context.fillStyle = "black";
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
      link.download = "modified_image.png";
      link.click();
    };
  }
  else if (fileType === "xls" || fileType === "xlsx") {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Canvas Drawing");

    const headers = Object.keys(xlsContent[0]);
    worksheet.addRow(headers);

    xlsContent.forEach((row) => {
      worksheet.addRow(Object.values(row));
    });

    const imgData = canvas.toDataURL("image/png");
    const imageId = workbook.addImage({
      base64: imgData,
      extension: "png",
    });

    worksheet.addImage(imageId, {
      tl: { col: 0, row: 0 },
      ext: { width: canvas.width, height: canvas.height },
    });

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "modified.xlsx";
      link.click();
    });
  }
  else if (fileType === "pdf") {
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
  }
  else if (fileType === "docx") {
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

    //original content, canvas image, and annotations
    const newDoc = new Document({
      sections: [
        {
          properties: {},
          children: [
            ...docParagraphs,

            new Paragraph({
              children: [
                new ImageRun({
                  data: imageBuffer,
                  transformation: {
                    width: 600,
                    height: 400,
                  },
                }),
              ],
            }),

            ...shapes.map((shape) => {
              switch (shape.type) {
                case "text":
                  return new Paragraph({
                    children: [
                      new TextRun({
                        text: shape.text,
                        color: shape.color || "",
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
                  // For drawings
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

    const blob = await Packer.toBlob(newDoc);
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "modified.docx";
    link.click();
  }
};
