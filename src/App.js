import './App.css';
import Intro from './components/Intro';
import React, { useState } from 'react';
import MasterController from './components/MasterController';


function App() {
  const [showIntro, setShowIntro] = useState(true);

  const handleIntroHide = () => {
    setShowIntro(false);
  };
  
  return (
    <div className="App">
      {showIntro && <Intro onHide={handleIntroHide} />}
      {!showIntro && <MasterController />}
    </div>
  );
}

export default App;
