import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import Home from './Pages/Home';
import Profile from './Pages/Profile';
import Settings from './Pages/Settings';
import AboutUs from './Pages/AboutUs';
import NotFound from './Pages/404page';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route index element={<Home />} />
                <Route path={'/Home'} element={<Home />} />
                <Route path={'/Profile'} element={<Profile />} />
                <Route path={'/Settings'} element={<Settings />} />
                <Route path={'/AboutUs'} element={<AboutUs />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
);
