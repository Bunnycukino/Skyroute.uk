import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import C209System from './C209System';

export default function Pages() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<C209System />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}