import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'         // 学生端
import TeacherApp from './TeacherApp.jsx'   // 教师端
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/teacher" element={<TeacherApp />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
