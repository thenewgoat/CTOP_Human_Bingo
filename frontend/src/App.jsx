import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';


const App = () => {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<h1>Home Page</h1>} />
        <Route path="/register" element={<h1>Register Page</h1>} />
        
      </Routes>
    </Router>
  );
};

export default App;


<Route path="/" element={<RegisterPage />} />
