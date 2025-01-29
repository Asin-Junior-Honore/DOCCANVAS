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
            <label
                htmlFor="fileInput"
                className="flex mx-auto relative items-center justify-center w-48 h-48 cursor-pointer border-2 border-dashed border-blue-600 rounded-lg overflow-hidden hover:border-blue-700 hover:bg-blue-50 transition-all duration-300 group"
            >
                <input
                    type="file"
                    id="fileInput"
                    onChange={(e) =>
                        handleFileChange(
                            e,
                            setUploadedFile,
                            setFileType,
                            setDocContent,
                            setXlsContent
                        )
                    }
                    className="absolute opacity-0 w-full h-full cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center text-center p-4">
                    <img
                        src="/uploadfile.png"
                        alt="Upload"
                        className="size-12 mb-2 transform transition-transform duration-300 group-hover:scale-110 rounded"
                    />
                    <p className="text-sm text-gray-600 font-medium">
                        Drag & drop or <span className="text-blue-600">browse</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        Supports: PDF, DOCX, XLSX, JPG , PNG
                    </p>
                </div>
            </label>

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
                canvasRef={canvasRef}
            />

            {fileType && (
                <button
                    onClick={handleSave}
                    className="px-6 py-2 mt-4 bg-purple-600 text-white rounded-lg  hover:bg-purple-700 transition"
                >
                    Save File
                </button>
            )}
        </div>
    );
};

export default FileUploader;
