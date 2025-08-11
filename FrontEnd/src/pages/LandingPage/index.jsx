import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';

const LandingPage = () => {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      {/* Logo in the top-left corner */}
      <img
        src="Logo2.png"
        alt="Collaborate Logo"
        className="absolute top-8 left-8 w-16 h-16"
      />

      <Navbar />

      {/* Welcome Message */}
      <h1 className="text-5xl font-extrabold mb-8 text-blue-400 tracking-wide text-shadow-lg">
        Hello, Welcome to Collaborate!
      </h1>

      {/* Button Group */}
      <div className="flex flex-col gap-4 w-full max-w-sm">
        <Link to='/create-room'>
          <button className="w-full py-4 text-xl font-bold rounded-lg transition-all duration-300 bg-green-600 hover:bg-green-700 shadow-md">
            Create Room
          </button>
        </Link>
        <Link to='/join-room'>
          <button className="w-full py-4 text-xl font-bold rounded-lg transition-all duration-300 bg-gray-700 hover:bg-gray-800 border border-gray-600 shadow-md">
            Join Room
          </button>
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;
