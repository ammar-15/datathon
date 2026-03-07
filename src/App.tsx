import { Routes, Route } from 'react-router-dom';
import { AppNavbar } from './components/AppNavbar';
import { LiverCalcPage } from './pages/LiverCalcPage';
import { LiverDataPage } from './pages/LiverDataPage';

export default function App() {
  return (
    <>
      <AppNavbar />
      <Routes>
        <Route path="/" element={<LiverDataPage />} />
        <Route path="/calc" element={<LiverCalcPage />} />
      </Routes>
    </>
  );
}
