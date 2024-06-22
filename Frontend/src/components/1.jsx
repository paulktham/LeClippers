import React, { useState } from "react";

const Timing = ({ addInputs }) => {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  return (
    <div className="flex items-center">
      <input
        type="time"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
        className="bg-gray-500 border border-gray-100 text-white mx-2"
        placeholder="time-start"
      />
      -
      <input
        type="time"
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
        className="bg-gray-500 border border-gray-100 text-white mx-2"
        placeholder="time-end"
      />
      <button onClick={() => addInputs(startTime, endTime)} className="mx-2">
        Add
      </button>
    </div>
  );
};

export default Timing;
