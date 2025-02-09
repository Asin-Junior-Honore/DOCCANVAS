import mammoth from "mammoth";
import * as XLSX from "xlsx";

export const handleFileChange = async (
  e,
  setUploadedFile,
  setFileType,
  setDocContent,
  setXlsContent
) => {
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
      // "msg",
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
      alert("Unsupported file format. Please upload a valid file. Supported formats are: pdf, doc, docx, xls, xlsx, jpg, png.");
    }
  }
};

export const handleToolClick = (type, setDrawType, setIsDrawing) => {
  setDrawType(type);
  setIsDrawing(true);

  // Change cursor styles based on tool type
  if (type === "text") {
    document.body.style.cursor = "text";
  } else if (type === "highlight" || type === "opaqueHighlight") {
    document.body.style.cursor = "pointer";
  } else if (type === "normal") {
    document.body.style.cursor = "default";
  } else if (type) {
    document.body.style.cursor = "crosshair";
  }

  // Disable text selection when drawing
  document.body.style.userSelect = "none";
};
