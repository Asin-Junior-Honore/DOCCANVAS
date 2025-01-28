import FileUploader from "./components/FileUploader";
function App() {
  return (
    <section>
      <div>
        <h2 className="text-4xl font-semibold text-center mb-4">
          Welcome to <span className="text-blue-600">DocCanvas</span>
        </h2>
        <p className="text-center mb-6">
          DocCanvas is your all-in-one file management and annotation tool.
          Upload and preview documents, spreadsheets, images, or PDFs, <br />{" "}
          and enhance them with drawing, highlighting, and text tools. Simplify
          your workflow and bring your ideas to life with DocCanvas✨.
        </p>
      </div>
      <FileUploader />
    </section>
  );
}

export default App;
