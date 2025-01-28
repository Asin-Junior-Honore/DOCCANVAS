import React, { useState, useRef } from "react";
import FilePreview from "./FilePreview";
import DrawingTools from "./DrawingTools";
import { handleFileChange, handleToolClick } from "../utils/fileHandlers";
import { saveFile } from "../utils/fileSaveUtils";

const FileUploader = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileType, setFileType] = useState("");
  const [docContent, setDocContent] = useState("");
  const [xlsContent, setXlsContent] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawType, setDrawType] = useState(null);
  const [shapes, setShapes] = useState([]);
  const [text, setText] = useState("");
  const [highlights, setHighlights] = useState([]);
  const [opaqueHighlights, setOpaqueHighlights] = useState([]);
  const canvasRef = useRef(null);

  const handleSave = () => {
    saveFile({
      canvasRef,
      uploadedFile,
      fileType,
      shapes,
      xlsContent,
      docContent,
    });
  };
  return (
    <div className="p-4">
      <input
        type="file"
        onChange={(e) =>
          handleFileChange(
            e,
            setUploadedFile,
            setFileType,
            setDocContent,
            setXlsContent
          )
        }
        className="mb-4 cursor-pointer block w-full text-xl text-red-600
                file:mr-4 file:py-3 file:px-3
                file:rounded-lg file:border file:border-gray-300
                file:text-lg file:font-medium
                file:bg-gradient-to-r file:from-blue-100 file:to-blue-200
                file:text-blue-700 hover:file:bg-blue-800 file:cursor-pointer"
      />

      <div className="my-10">
        <FilePreview
          uploadedFile={uploadedFile}
          shapes={shapes}
          setShapes={setShapes}
          fileType={fileType}
          docContent={docContent}
          xlsContent={xlsContent}
          canvasRef={canvasRef}
          isDrawing={isDrawing}
          drawType={drawType}
          highlights={highlights}
          opaqueHighlights={opaqueHighlights}
          setHighlights={setHighlights}
          setOpaqueHighlights={setOpaqueHighlights}
          text={text}
          setText={setText}
        />
      </div>

      <DrawingTools
        fileType={fileType}
        handleToolClick={(type) =>
          handleToolClick(type, setDrawType, setIsDrawing)
        }
        drawType={drawType}
        text={text}
        setText={setText}
      />

      {fileType && (
        <button
          onClick={handleSave}
          className="px-6 py-2 mt-4 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition"
        >
          Save File
        </button>
      )}
    </div>
  );
};

export default FileUploader;
