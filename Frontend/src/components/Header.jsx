import React from "react";

const Header = ({ credits }) => {
  return (
    <div className="bg-gray-800 p-5 rounded-xl justify-between">
      <h1 className="text-3xl font-bold text-white font-mono">LeClippers</h1>
      {credits !== undefined && (
        <span className="text-xl font-bold text-white">Credits: {credits}</span>
      )}
    </div>
  );
};

export default Header;
