import React from 'react';

const CommonFooter = () => {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
        <p className="text-sm">&copy; {new Date().getFullYear()} Naploo. All rights reserved.</p>
        <div className="space-x-4">
          <a href="/privacy" className="hover:underline">Privacy</a>
          <a href="/terms" className="hover:underline">Terms</a>
          <a href="/about" className="hover:underline">About</a>
        </div>
      </div>
    </footer>
  );
};

export default CommonFooter;
