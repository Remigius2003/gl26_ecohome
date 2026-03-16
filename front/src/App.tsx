import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      {/* Add your routes here */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
