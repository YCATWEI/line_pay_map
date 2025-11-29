import React from 'react';
import { Wallet } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 shadow-lg sticky top-0 z-50">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        <div className="flex items-center space-x-2">
          <div className="bg-white p-1.5 rounded-full">
             <Wallet className="w-5 h-5 text-green-600" />
          </div>
          <h1 className="text-xl font-bold tracking-wide">LINE Pay Finder</h1>
        </div>
      </div>
    </header>
  );
};