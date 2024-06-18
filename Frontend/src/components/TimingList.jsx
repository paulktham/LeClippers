import React from "react";

const TimingList = ({
  inputs,
  setInputs,
  handleSubmission,
  navigate,
  stackedVideo,
  isProcessing, // Add this line
}) => {
  const onSubmit = () => {
    handleSubmission();

    // navigate("/download");

  };

  const addInputs = () => {
    setInputs([...inputs, { start: "", end: "" }]);
  };

  const removeInputs = (index) => {
    const newInputs = inputs.filter((_, i) => i !== index);
    setInputs(newInputs);
  };

  const handleInputChange = (index, event) => {
    const { name, value } = event.target;
    setInputs((prevInputs) => {
      const newInputs = [...prevInputs];
      newInputs[index] = { ...newInputs[index], [name]: value };
      return newInputs;
    });
  };

  return (
    <div className="bg-gray p-2 border border-red-50 flex justify-between bg-red-600 flex-col">
      <div>
        <p>timestamps:</p>
      </div>
      {inputs.map((input, index) => (
        <div key={index}>
          <input
            type="time"
            name="start"
            value={input.start}
            onChange={(e) => handleInputChange(index, e)}
            className="bg-gray-500 border border-gray-100 text-white"
            placeholder="time-start"
          />
          -
          <input
            type="time"
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
        <button onClick={onSubmit} disabled={isProcessing}>
          {" "}
          {/* Disable button while processing */}
          {isProcessing ? "Processing..." : "Submit"}
        </button>
        {stackedVideo && <video controls src={stackedVideo}></video>}
      </div>
    </div>
  );
};

export default TimingList;
