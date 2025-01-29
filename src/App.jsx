import FileUploader from "./components/FileUploader";
function App() {
  return (
    <section>
      <div className="hero-intro">
        <h2 className="text-4xl font-semibold text-white text-center mb-4">
          Welcome to <span className="text-blue-600">Doccanvas</span>
        </h2>
        <p className="text-center text-white mb-6">
          Doccanvas is your all-in-one file management and annotation tool.
          Upload and preview documents, spreadsheets, images, or PDFs, <br />{" "}
          and enhance them with drawing, highlighting, and text tools. Simplify
          your workflow and bring your ideas to life with DocCanvas✨.
        </p>
      </div>
      <FileUploader />
      <ul class="circles">
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
      </ul>
    </section>
  );
}

export default App;
