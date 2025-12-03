import { useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import HamburgerMenu from './components/HamburgerMenu';
import Sidebar from './components/Sidebar';
import ThemeToggle from './components/ThemeToggle';
import AuthButton from './components/AuthButton';
import Landing from './pages/Landing';
import Home from './pages/Home';
import MindMap from './pages/MindMap';
import BMICalculator from './pages/BMICalculator';
import AfterLogin from './pages/AfterLogin';
import AfterLogout from './pages/AfterLogout';
import './App.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <HashRouter>
      <div className="App">
        <HamburgerMenu isOpen={sidebarOpen} onToggle={toggleSidebar} />
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        <AuthButton />
        <ThemeToggle />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/flights" element={<Home />} />
          <Route path="/mindmap" element={<MindMap />} />
          <Route path="/bmi" element={<BMICalculator />} />
          <Route path="/afterlogin" element={<AfterLogin />} />
          <Route path="/afterlogout" element={<AfterLogout />} />
        </Routes>
      </div>
    </HashRouter>
  );
}

export default App;
