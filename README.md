# DOCCANVAS - Front-End Developer Challenge

## Overview

DOCCANVAS is a React-based web application designed to meet the requirements of the Pibicy Front-End Developer Challenge. The application allows users to upload and view various file types (PDF, DOCX, XLSX, JPG, PNG), add annotations (text boxes, shapes, highlights), and save the modified files back to their original format. The application is hosted on Netlify and built using React and Vite.

## Features

- **File Upload and Viewing**: Supports PDF, DOCX, XLSX, JPG, and PNG files.
- **Annotations**: Users can add text boxes, shapes (line, circle, square), and highlights (transparent and opaque) to the uploaded files.
- **Save Functionality**: Modified files can be saved back to their original format, including any annotations.
- **Responsive Design**: The application is optimized for desktop use, with a warning message displayed for mobile and tablet users.

## File Structure

The project is structured as follows:

```
src/
├── components/
│   ├── DrawingTools.jsx
│   ├── FilePreview.jsx
│   ├── FileUploader.jsx
│   └── ImgPreview.jsx
├── utils/
│   ├── fileHandlers.js
│   └── fileSaveUtils.js
├── App.jsx
└── main.jsx
```

## Components

### `FileUploader.jsx`

The main component that handles file uploads, rendering the appropriate preview component, and managing the drawing tools.

- **State Management**:
  - `uploadedFile`: Stores the uploaded file.
  - `fileType`: Stores the type of the uploaded file.
  - `docContent`: Stores the content of DOCX files.
  - `xlsContent`: Stores the content of XLSX files.
  - `isDrawing`: Tracks whether the user is currently drawing.
  - `drawType`: Tracks the type of drawing tool selected.
  - `shapes`: Stores the shapes drawn on the canvas.
  - `text`: Stores the text input for text annotations.
  - `highlights`: Stores transparent highlights.
  - `opaqueHighlights`: Stores opaque highlights.

- **Methods**:
  - `handleFileChange`: Handles file upload and sets the appropriate state.
  - `handleSave`: Saves the modified file with annotations.

### `FilePreview.jsx`

Renders the preview of the uploaded file based on its type (PDF, DOCX, XLSX).

- **Props**:
  - `uploadedFile`: The uploaded file.
  - `fileType`: The type of the uploaded file.
  - `docContent`: The content of DOCX files.
  - `xlsContent`: The content of XLSX files.
  - `canvasRef`: Reference to the canvas element.
  - `isDrawing`: Whether the user is currently drawing.
  - `drawType`: The type of drawing tool selected.
  - `shapes`: The shapes drawn on the canvas.
  - `text`: The text input for text annotations.
  - `highlights`: Transparent highlights.
  - `opaqueHighlights`: Opaque highlights.

- **Methods**:
  - `startDrawing`: Handles the start of drawing on the canvas.
  - `drawShape`: Draws the selected shape on the canvas.
  - `stopDrawing`: Stops drawing and saves the shape.

### `ImgPreview.jsx`

Renders the preview of image files (JPG, PNG) and handles drawing on the image.

- **Props**:
  - `uploadedFile`: The uploaded image file.
  - `canvasRef`: Reference to the canvas element.
  - `isDrawing`: Whether the user is currently drawing.
  - `drawType`: The type of drawing tool selected.
  - `shapes`: The shapes drawn on the canvas.
  - `text`: The text input for text annotations.

- **Methods**:
  - `startDrawing`: Handles the start of drawing on the canvas.
  - `drawShape`: Draws the selected shape on the canvas.
  - `stopDrawing`: Stops drawing and saves the shape.
  - `drawStoredShapes`: Redraws all stored shapes on the canvas.

### `DrawingTools.jsx`

Renders the drawing tools and handles tool selection.

- **Props**:
  - `fileType`: The type of the uploaded file.
  - `handleToolClick`: Handles tool selection.
  - `drawType`: The type of drawing tool selected.
  - `text`: The text input for text annotations.
  - `setText`: Sets the text input for text annotations.

## Utility Functions

### `fileHandlers.js`

Contains utility functions for handling file uploads and tool selection.

- **Functions**:
  - `handleFileChange`: Handles file upload and sets the appropriate state.
  - `handleToolClick`: Handles tool selection and cursor style changes.

### `fileSaveUtils.js`

Contains utility functions for saving modified files.

- **Functions**:
  - `saveFile`: Saves the modified file with annotations based on the file type.

## Dependencies

- **React**: JavaScript library for building user interfaces.
- **Vite**: Build tool for modern web development.
- **ExcelJS**: Library for working with Excel files.
- **jsPDF**: Library for generating PDF files.
- **pdfjs-dist**: Library for rendering PDF files.
- **docx**: Library for working with DOCX files.
- **mammoth**: Library for extracting text from DOCX files.
- **xlsx**: Library for working with Excel files.

## Hosting

The application is hosted on Netlify. You can access it at [DOCCANVAS Netlify Link](https://asinhonore-doccanvas.netlify.app/).

## Conclusion

DOCCANVAS is a comprehensive solution that meets the requirements of the Pibicy Front-End Developer Challenge. It provides a user-friendly interface for uploading, annotating, and saving various file types, making it a versatile tool for document manipulation.
