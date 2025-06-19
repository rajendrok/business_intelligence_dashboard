import { Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import Visualise from "./components/Visualise/visualise";

import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
   
    </Routes>
  );
}

export default App;
