import React from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

const SliderRange = ({ value, onChange }) => {
  return (
    <Slider.Range
      value={value}
      onChange={onChange}
      styles={{
        handle: { borderColor: "red" },
        track: { backgroundColor: "green" },
      }}
    />
  );
};

export default SliderRange;
