import React from 'react'
import ReactDOM from 'react-dom/client'
import {
    BrowserRouter,
    Routes,
    Route,
} from "react-router-dom";
import './index.css'
import Home from "./Pages/Home";
import Home1 from './Pages/Home1';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <>
            <BrowserRouter>
                <Routes>
                    <Route index element={<Home />} />
                    <Route path={'/Home'} element={<Home />} />
                    <Route path={'/Home1'} element={<Home1 />} />
                </Routes>
            </BrowserRouter>
        </>
    </React.StrictMode>
);
