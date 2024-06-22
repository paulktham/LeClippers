import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import UploadFile from "../components/UploadFile";
import TimingList from "../components/TimingList";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

const Home = ({
  file,
  setFile,
  inputs,
  setInputs,
  handleSubmission,
  navigate,
  stackedVideo,
  isProcessing,
  credits,
}) => {
  const { userLoggedIn } = useAuth();
  const [videoDuration, setVideoDuration] = useState(null);

  useEffect(() => {
    if (file) {
      const video = document.createElement("video");
      video.src = URL.createObjectURL(file);
      video.onloadedmetadata = () => {
        setVideoDuration(video.duration);
      };
      video.onerror = (error) => {
        console.error("Error loading video: ", error);
        setVideoDuration(null);
      };
    }
  }, [file]);

  if (!userLoggedIn) {
    return <Navigate to="/login" replace={true} />;
  }

  return (
    <div>
      <Header credits={credits} />
      <UploadFile file={file} setFile={setFile} />
      <TimingList
        inputs={inputs}
        setInputs={setInputs}
        handleSubmission={handleSubmission}
        navigate={navigate}
        stackedVideo={stackedVideo}
        isProcessing={isProcessing}
        videoDuration={videoDuration}
      />
    </div>
  );
};

export default Home;
