import React, { useContext, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Context } from './store/store';
import './i18n';
import './App.css';

import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import Lines from './pages/Lines/Lines';
import Schedule from './pages/Schedule/Schedule';
import Attractions from './pages/Attractions/Attractions';
import RoutePlanner from './pages/RoutePlanner/RoutePlanner';
import Auth from './pages/Auth/Auth';
import Profile from './pages/Profile/Profile';

const App: React.FC = observer(() => {
  const store = useContext(Context);

  useEffect(() => {
    store.checkAuth();
    // Apply dark mode from localStorage
    const dark = localStorage.getItem('darkMode') === 'true';
    if (dark) document.body.classList.add('dark');
  }, []); // eslint-disable-line

  if (store.isLoading) {
    return (
      <div className="app-loader">
        <div className="loader-metro">
          {['#E3000B','#8B2FC9','#4B9E45','#F5D400','#0073BC'].map((c, i) => (
            <div key={i} className="loader-dot" style={{ background: c, animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
        <p>Loading Metro Barcelona...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />
        <main className="app-main">
          <Routes>
            <Route path="/"            element={<Home />} />
            <Route path="/lines"       element={<Lines />} />
            <Route path="/schedule"    element={<Schedule />} />
            <Route path="/attractions" element={<Attractions />} />
            <Route path="/planner"     element={<RoutePlanner />} />
            <Route path="/auth"        element={<Auth />} />
            <Route path="/profile"     element={<Profile />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
});

export default App;
