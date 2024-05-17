import React, { useState } from 'react';
import ConnectDevice from './ConnectDevice';

const Intro = ({ onHide }) => {
  const [slideOut, setSlideOut] = useState(false);

  const handleConnect = () => {
    setSlideOut(true);
    setTimeout(() => {
      onHide();
    }, 500); // Wait for the animation to complete before hiding the component
  };

  return (
    <div className={`hero min-h-screen bg-base-200 ${slideOut ? 'slide-out' : ''}`}>
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl dark:text-[#DCEBFA] font-bold">Welcome to Restobotics</h1>
          <p className="py-6 dark:text-[#DCEBFA]">Please enter IP & Port to start.</p>
          <ConnectDevice
            inputDesign={"input input-bordered w-full max-w-xs border-animation dark:text-[#DCEBFA]"}
            onConnect={handleConnect}
          />
        </div>
      </div>
    </div>
  );
};

export default Intro;