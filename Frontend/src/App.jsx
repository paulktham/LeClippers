import "./App.css";
import React, { useState } from "react";
import Download from "./pages/Download";
import Home from "./pages/Home";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";

const App = () => {
  const [file, setFile] = useState(null);
  const [inputs, setInputs] = useState([{ start: "", end: "" }]);
  const navigate = useNavigate();

  const handleSubmission = () => {
    setInputs([{ start: "", end: "" }]);
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
          />
        }
      />
      <Route path="/download" element={<Download />} />
    </Routes>
  );
};

export default App;
