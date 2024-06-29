import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import { useLocation } from "react-router-dom";
import { ref, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "../firebase/firebase";
import { useAuth } from "../context/authContext";

const Download = () => {
  const location = useLocation();
  const { videoUrl } = location.state || {};
  const [videoDownloadURL, setVideoDownloadURL] = useState("");
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchVideoURL = async () => {
      if (videoUrl) {
        try {
          const storageRef = ref(storage, videoUrl);
          const downloadURL = await getDownloadURL(storageRef);
          setVideoDownloadURL(downloadURL);
        } catch (error) {
          console.error(
            "Error fetching video URL from Firebase Storage:",
            error
          );
        }
      }
    };

    fetchVideoURL();
  }, [videoUrl]);

  const downloadFile = async () => {
    if (!videoDownloadURL) {
      alert("No video to download!");
      return;
    }

    const link = document.createElement("a");
    link.href = videoDownloadURL;
    link.download = "processed_video.mp4";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Delete the video from Firebase Storage after download
    const videoRef = ref(storage, videoUrl);
    try {
      await deleteObject(videoRef);
      console.log("Video deleted successfully from Firebase Storage");
    } catch (error) {
      console.error("Error deleting video from Firebase Storage:", error);
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
      {videoDownloadURL && (
        <div>
          <video controls>
            <source src={videoDownloadURL} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}
    </>
  );
};

export default Download;
