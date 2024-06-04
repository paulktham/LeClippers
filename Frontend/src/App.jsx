import "./App.css";
import React, { useState, useEffect } from "react";
import Download from "./pages/Download";
import Home from "./pages/Home";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
// import backgroundVideo from "./assets/randomvid.mp4";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
const ffmpeg = createFFmpeg({ log: true });

const App = () => {
  const [file, setFile] = useState(null);
  const [inputs, setInputs] = useState([{ start: "", end: "" }]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);
  const [stackedVideo, setStackedVideo] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false); // Add state for processing status

  const navigate = useNavigate();

  const handleSubmission = async () => {
    setInputs([{ start: "", end: "" }]);
    // if (file) {
    //   setIsProcessing(true);
    //   console.log("Starting video processing...");
    //   await stackVideos(file, backgroundVideo);
    //   console.log("Video processing completed.");
    //   setIsProcessing(false);
    // }
  };

  const load = async () => {
    try {
      await ffmpeg.load();
      setReady(true);
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (error) {
    return <p>Error: {error}</p>;
  }

  const stackVideos = async (video1, video2) => {
    try {
      console.log("Writing files to memory...");
      // Write the files to memory
      ffmpeg.FS("writeFile", "video1.mp4", await fetchFile(video1));
      ffmpeg.FS("writeFile", "video2.mp4", await fetchFile(video2));
      console.log("Files written to memory.");

      // Run the FFmpeg command to stack videos using vstack filter
      console.log("Running FFmpeg command...");
      await ffmpeg.run(
        "-i",
        "video1.mp4",
        "-i",
        "video2.mp4",
        "-filter_complex",
        "[0:v][1:v]vstack=inputs=2[v]",
        "-map",
        "[v]",
        "output.mp4"
      );
      console.log("FFmpeg command completed.");

      // Read the result
      console.log("Reading result...");
      const data = ffmpeg.FS("readFile", "output.mp4");
      console.log("Result read.");

      // Create a URL
      const url = URL.createObjectURL(
        new Blob([data.buffer], { type: "video/mp4" })
      );
      setStackedVideo(url);
    } catch (error) {
      console.error("Error during video processing:", error);
      setError(error.message);
      setIsProcessing(false); // Ensure to reset processing state in case of error
    }
  };

  return ready ? (
    <Routes>
      <Route
        path="/"
        element={
          <Home
            file={file}
            setFile={setFile}
            inputs={inputs}
            setInputs={setInputs}
            handleSubmission={handleSubmission}
            navigate={navigate}
            stackedVideo={stackedVideo}
            isProcessing={isProcessing} // Pass the processing status
          />
        }
      />
      <Route path="/download" element={<Download />} />
    </Routes>
  ) : (
    <p>Loading...</p>
  );
};

export default App;
