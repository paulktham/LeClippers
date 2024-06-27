import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import Download from "./pages/Download";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { db } from "./firebase/firebase";
import { getDoc, doc, setDoc } from "firebase/firestore";
import { useAuth } from "./context/authContext";
import "./App.css";

const App = () => {
  const [file, setFile] = useState(null);
  const [inputs, setInputs] = useState([{ start: "", end: "" }]);
  const navigate = useNavigate();
  const { userLoggedIn, currentUser } = useAuth();
  const [credits, setCredits] = useState(0);

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

  const handleSubmission = async () => {
    if (file) {
      const { start, end } = inputs[0];
      const formData = new FormData();
      formData.append("video", file); // Append the video file
      formData.append("start", start);
      formData.append("end", end);

      try {
        const response = await fetch("http://localhost:5000/process-video", {
          method: "POST",
          body: formData, // Send formData
        });
        const data = await response.json();
        if (response.ok) {
          const updatedCredits = credits - 3;
          const userDocRef = doc(db, "user", currentUser.email);
          await setDoc(
            userDocRef,
            { credits: updatedCredits },
            { merge: true }
          );
          setCredits(updatedCredits);
          setInputs([{ start: "", end: "" }]);
          navigate("/download", { state: { videoUrl: data.outputPath } });
        } else {
          console.error("Video processing failed:", data.error);
        }
      } catch (error) {
        console.error("Error processing video:", error);
      }
    }
  };

  return (
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
            credits={credits}
          />
        }
      />
      <Route path="/download" element={<Download />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
};

export default App;
