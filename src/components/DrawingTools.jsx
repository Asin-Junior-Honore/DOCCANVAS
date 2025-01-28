import React from "react";

const DrawingTools = ({
    fileType,
    handleToolClick,
    drawType,
    text,
    setText,
}) => {
    return (
        <div className="mt-4">
            {fileType && (
                <>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => handleToolClick("line")}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
                        >
                            Draw Line
                        </button>
                        <button
                            onClick={() => handleToolClick("circle")}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
                        >
                            Draw Circle
                        </button>
                        <button
                            onClick={() => handleToolClick("square")}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
                        >
                            Draw Square
                        </button>
                        <button
                            onClick={() => handleToolClick("highlight")}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition"
                        >
                            Transparent Highlight
                        </button>
                        <button
                            onClick={() => handleToolClick("opaqueHighlight")}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition"
                        >
                            Opaque Highlight
                        </button>
                        <button
                            onClick={() => handleToolClick("text")}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
                        >
                            Add Text
                        </button>
                    </div>
                    {drawType === "text" && (
                        <div className="mt-4">
                            <input
                                type="text"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter text"
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default DrawingTools;
