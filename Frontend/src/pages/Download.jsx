import React from "react";
import Header from "../components/Header";

const Download = ({ stackedVideo }) => {
  const downloadFile = () => {
    if (stackedVideo) {
      const link = document.createElement("a");
      link.href = stackedVideo;
      link.download = "output.mp4";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert("No video to download.");
    }
  };

  return (
    <>
      <Header />
      <div className="container">
        <button type="button" onClick={downloadFile}>
          Download
        </button>
      </div>
    </>
  );
};

export default Download;
