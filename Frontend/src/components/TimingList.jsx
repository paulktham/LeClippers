import React, { useCallback } from "react";

const TimingList = ({
  inputs,
  setInputs,
  handleSubmission,
  stackedVideo,
  isProcessing,
  videoDuration,
}) => {
  const onSubmit = useCallback(() => {
    if (
      inputs.every(
        (input) => validateTime(input.start) && validateTime(input.end)
      )
    ) {
      handleSubmission();
    } else {
      alert("Please enter valid times within the video duration.");
    }
  }, [inputs, handleSubmission]);

  const addInputs = useCallback(() => {
    setInputs((prevInputs) => [...prevInputs, { start: "", end: "" }]);
  }, [setInputs]);

  const removeInputs = useCallback(
    (index) => {
      setInputs((prevInputs) => prevInputs.filter((_, i) => i !== index));
    },
    [setInputs]
  );

  const handleInputChange = useCallback(
    (index, event) => {
      const { name, value } = event.target;
      setInputs((prevInputs) => {
        const newInputs = [...prevInputs];
        newInputs[index] = { ...newInputs[index], [name]: value };
        return newInputs;
      });
    },
    [setInputs]
  );

  const validateTime = useCallback(
    (time) => {
      const [minutes, seconds] = time.split(":").map(Number);
      const totalSeconds = minutes * 60 + seconds;
      return totalSeconds <= videoDuration;
    },
    [videoDuration]
  );

  return (
    <div className="bg-gray p-2 border border-red-50 flex justify-between bg-red-600 flex-col items-center">
      <div>
        <p>timestamps:</p>
      </div>
      {inputs.map((input, index) => (
        <div key={index} className="flex items-center space-x-2">
          <input
            type="text"
            name="start"
            value={input.start}
            onChange={(e) => handleInputChange(index, e)}
            className="bg-gray-500 border border-gray-100 text-white"
            placeholder="time-start"
          />
          -
          <input
            type="text"
            name="end"
            value={input.end}
            onChange={(e) => handleInputChange(index, e)}
            className="bg-gray-500 border border-gray-100 text-white"
            placeholder="time-end"
          />
          <button onClick={addInputs}>Add</button>
          {inputs.length > 1 && (
            <button onClick={() => removeInputs(index)}>Delete</button>
          )}
        </div>
      ))}
      <div className="flex justify-evenly">
        <button onClick={onSubmit} disabled={isProcessing || !videoDuration}>
          {isProcessing ? "Processing..." : "Submit"}
        </button>
        {stackedVideo && <video controls src={stackedVideo}></video>}
      </div>
    </div>
  );
};

export default TimingList;
