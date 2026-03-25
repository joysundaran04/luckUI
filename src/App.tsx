import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './App.css';
import Login from './components/Login/Login';
import AdminLayout from './components/Admin/AdminLayout';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/admin/*" element={<AdminLayout />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
