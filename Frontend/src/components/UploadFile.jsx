import React, { useRef } from "react";

const UploadFile = ({ file, setFile }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile.name);
    }
  };

  const handleClearFile = () => {
    setFile(null);
  };

  const handleClear = () => {
    handleClearFile();
    fileInputRef.current.value = null; // Reset file input
  };

  return (
    <div className="w-full min-h-screen bg-white items-center justify-center flex">
      <div className="w-auto h-auto rounded-md bg-white shadow-md border border-slate-400 p-5 flex items-center justify-center flex-col">
        <label
          htmlFor="fileInput"
          className="block text-slate-800 text-base font-medium mb-1.5"
        >
          Upload File
        </label>
        {file && (
          <video controls width="80%" src={URL.createObjectURL(file)}></video>
        )}
        <div className="flex flex-col w-full justify-center items-center">
          {file == null && (
            <input
              id="fileInput"
              type="file"
              onChange={(e) => setFile(e.target.files?.item(0))}
              ref={fileInputRef}
            />
          )}

          {file && (
            <>
              <div>{file.name}</div>
              <div>
                <button
                  onClick={handleClear}
                  className="ml-2 border-2 border-black p-2 m-2 rounded-md bg-slate-400"
                >
                  Clear Video
                </button>
              </div>
            </>
          )}
        </div>
        {/* {file && <div className="mt-2">Selected File: {file}</div>} */}
      </div>
    </div>
  );
};

export default UploadFile;
