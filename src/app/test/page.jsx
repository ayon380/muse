"use client"
import React from 'react';
import { CoolMode } from '@/components/Coolmode';
import BottomSheet from '../../components/BottomSheet';
const App = () => {
    const options = {
        particleCount: 50,
        speedHorz: 5,
        speedUp: 10,
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <h1 className="text-4xl font-bold mb-8">Bottom Sheet Example</h1>
        <BottomSheet>
          <h2 className="text-2xl font-semibold mb-4">Bottom Sheet Content</h2>
          <p className="text-gray-700 mb-4">
            This is a native-like bottom sheet with a pill-shaped handle. You can drag it down to close or tap outside the sheet.
          </p>
          <ul className="list-disc pl-6 text-gray-700">
            {[...Array(20)].map((_, i) => (
              <li key={i}>List item {i + 1}</li>
            ))}
          </ul>
        </BottomSheet>
      </div>
    );
};

export default App;
