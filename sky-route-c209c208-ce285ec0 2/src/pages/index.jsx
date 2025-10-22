import Layout from "./Layout.jsx";

import ShipmentLog from "./ShipmentLog";

import RampInput from "./RampInput";

import LogisticInput from "./LogisticInput";

import CheckNumbers from "./CheckNumbers";

import InBondForm from "./InBondForm";

import ReallocationRegister from "./ReallocationRegister";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    ShipmentLog: ShipmentLog,
    
    RampInput: RampInput,
    
    LogisticInput: LogisticInput,
    
    CheckNumbers: CheckNumbers,
    
    InBondForm: InBondForm,
    
    ReallocationRegister: ReallocationRegister,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<ShipmentLog />} />
                
                
                <Route path="/ShipmentLog" element={<ShipmentLog />} />
                
                <Route path="/RampInput" element={<RampInput />} />
                
                <Route path="/LogisticInput" element={<LogisticInput />} />
                
                <Route path="/CheckNumbers" element={<CheckNumbers />} />
                
                <Route path="/InBondForm" element={<InBondForm />} />
                
                <Route path="/ReallocationRegister" element={<ReallocationRegister />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}