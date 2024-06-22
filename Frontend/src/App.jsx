import React, { useState, useEffect, useCallback, useRef } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL, fetchFile } from "@ffmpeg/util";
import { Routes, Route, useNavigate } from "react-router-dom";
import { db, storage } from "./firebase/firebase";
import { getDoc, doc, setDoc } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import { useAuth } from "./context/authContext";
import Home from "./pages/Home";
import Download from "./pages/Download";
import Login from "./pages/Login";
import Register from "./pages/Register";

const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";

const App = () => {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [inputs, setInputs] = useState([{ start: "", end: "" }]);
  const [stackedVideo, setStackedVideo] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { currentUser } = useAuth();
  const [credits, setCredits] = useState(0);
  const navigate = useNavigate();
  const [outputFileReady, setOutputFileReady] = useState(false);

  const ffmpegRef = useRef(new FFmpeg());
  const messageRef = useRef(null);

  const loadFFmpeg = useCallback(async () => {
    try {
      const ffmpeg = ffmpegRef.current;
      ffmpeg.on("log", ({ message }) => {
        if (messageRef.current) {
          messageRef.current.innerHTML = message;
        }
        console.log(message);
      });

      console.log("Loading FFmpeg...");
      await ffmpeg.load({
        coreURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.js`,
          "text/javascript"
        ),
        wasmURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.wasm`,
          "application/wasm"
        ),
      });
      console.log("FFmpeg loaded successfully");
      setReady(true);
    } catch (err) {
      setError(`FFmpeg load error: ${err.message}`);
      console.error("FFmpeg load error:", err);
    }
  }, []);

  useEffect(() => {
    loadFFmpeg();
  }, [loadFFmpeg]);

  useEffect(() => {
    const fetchUserCredits = async () => {
      if (currentUser) {
        try {
          const userDocRef = doc(db, "user", currentUser.email);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setCredits(userDoc.data().credits);
          }
        } catch (err) {
          console.error("Error fetching user credits:", err);
        }
      }
    };

    fetchUserCredits();
  }, [currentUser]);

  const stackVideos = useCallback(
    async (video1) => {
      try {
        console.log("Fetching video2 from storage...");
        const video2Ref = ref(storage, "video2.mp4");
        const video2Url = await getDownloadURL(video2Ref);
        const video2Blob = await (await fetch(video2Url)).blob();

        console.log("Writing video1 to FFmpeg FS...");
        const ffmpeg = ffmpegRef.current;
        await ffmpeg.writeFile("video1.mp4", await fetchFile(video1));

        console.log("Writing video2 to FFmpeg FS...");
        await ffmpeg.writeFile("video2.mp4", await fetchFile(video2Blob));

        console.log("Files in FFmpeg FS after write:");
        const files = await ffmpeg.ls("/");
        console.log(files);

        const { start, end } = inputs[0];
        const startSeconds = new Date(`1970-01-01T${start}Z`).getTime() / 1000;
        const endSeconds = new Date(`1970-01-01T${end}Z`).getTime() / 1000;
        const duration = endSeconds - startSeconds;

        console.log("Running FFmpeg command...");
        await ffmpeg.exec([
          "-i",
          "video1.mp4",
          "-ss",
          startSeconds.toString(),
          "-t",
          duration.toString(),
          "-i",
          "video2.mp4",
          "-filter_complex",
          "[0:v]scale=1080:-1[v1];[1:v]scale=-1:1920/2[v2scaled];[v2scaled]crop=1080:1920/2[v2cropped];[v1][v2cropped]vstack=inputs=2,scale=1080:1920[vid]",
          "-map",
          "[vid]",
          "-map",
          "0:a",
          "-c:v",
          "libx264",
          "-crf",
          "23",
          "-preset",
          "veryfast",
          "-shortest",
          "output1.mp4",
        ]);

        console.log("Files in FFmpeg FS after run:");
        const filesAfterRun = await ffmpeg.ls("/");
        console.log(filesAfterRun);

        console.log("Reading output1.mp4 from FFmpeg FS...");
        const data = await ffmpeg.readFile("output1.mp4");
        const url = URL.createObjectURL(
          new Blob([data.buffer], { type: "video/mp4" })
        );
        setStackedVideo(url);
        setOutputFileReady(true);
      } catch (err) {
        console.error("FFmpeg error output:", err);
        setError(`FFmpeg run error: ${err.message}`);
        setIsProcessing(false);
      }
    },
    [inputs]
  );

  useEffect(() => {
    if (outputFileReady) {
      navigate("/download");
    }
  }, [outputFileReady, navigate]);

  const handleSubmission = useCallback(async () => {
    if (file) {
      setIsProcessing(true);
      await stackVideos(file);
      setIsProcessing(false);

      const updatedCredits = credits - 3;
      try {
        const userDocRef = doc(db, "user", currentUser.email);
        await setDoc(userDocRef, { credits: updatedCredits }, { merge: true });
        setCredits(updatedCredits);
        setInputs([{ start: "", end: "" }]);
      } catch (err) {
        console.error("Error updating user credits:", err);
      }
    }
  }, [file, credits, currentUser, stackVideos]);

  if (error) {
    return <p>Error: {error}</p>;
  }

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
            isProcessing={isProcessing}
            credits={credits}
          />
        }
      />
      <Route
        path="/download"
        element={<Download stackedVideo={stackedVideo} />}
      />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  ) : (
    <p>Loading...</p>
  );
};

export default App;
