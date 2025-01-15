import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';


const App = () => {
  return <h1>Hello world</h1>;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<RegisterPage />} />
        {/* Add other routes for additional pages */}

      </Routes>
    </Router>
  );
};

export default App;
