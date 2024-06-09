"use client"
import React from 'react';
import { CoolMode } from '@/components/Coolmode';

const App = () => {
    const options = {
        particleCount: 50,
        speedHorz: 5,
        speedUp: 10,
    };

    return (
        <CoolMode options={options}>
            <div style={{ height: '100vh', background: '#f0f0f0' }}>
                Hover or click to see the particles!
            </div>
        </CoolMode>
    );
};

export default App;
