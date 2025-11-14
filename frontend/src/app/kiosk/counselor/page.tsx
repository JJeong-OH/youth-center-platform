'use client';

import React from 'react';
import { AICounselor } from '../components/AIcounselor';
import { KioskHeader } from '../components/KioskHeader';

export default function CounselorPage() {
  return (
    <div className="flex flex-col h-screen">
      <KioskHeader />
      <main className="flex-grow p-4 md:p-6 max-w-7xl mx-auto w-full">
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-white/30 h-full shadow-lg">
          <AICounselor />
        </div>
      </main>
    </div>
  );
}