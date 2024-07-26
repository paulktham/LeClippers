import React from "react";
import Header from "../components/Header";
import { useLocation } from "react-router-dom";

const Download = () => {
  const location = useLocation();
  const videoUrl = location.state?.videoUrl;

  const downloadFile = () => {
    if (!videoUrl) {
      alert("No video to download!");
      return;
    }

    const link = document.createElement("a"); // Create a link element
    link.href = `http://localhost:5001/${videoUrl}`;
    link.download = "processed_video.mp4"; // Set the file name
    document.body.appendChild(link); // Append the link to the document body
    link.click(); // Programmatically click the link to trigger the download
    document.body.removeChild(link); // Remove the link from the document
  };

  return (
    <>
      <Header />
      <div className="container">
        <button type="button" onClick={downloadFile}>
          Download
        </button>
      </div>
      {videoUrl && (
        <div>
          <video controls>
            <source
              src={`http://localhost:5001/${videoUrl}`}
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
        </div>
      )}
    </>
  );
};

export default Download;
