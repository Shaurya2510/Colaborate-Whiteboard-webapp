import React from 'react';

const AboutUs = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6 md:p-12">
            <div className="text-center max-w-4xl">
                <h2 className="text-4xl md:text-6xl font-bold text-blue-400 mb-6">About <strong>Collaborate</strong></h2>
                <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-8">
                    Welcome to Collaborate, a real-time, shared whiteboard application designed to empower teams, students, and creative minds to work together seamlessly. Our mission is to break down the barriers of distance and provide a canvas where ideas can flow freely, regardless of your location.
                </p>
                <p className="text-md md:text-lg text-gray-400">
                    The platform offers a distraction-free environment with intuitive tools for drawing, writing, and sharing. Whether you're brainstorming a new project, teaching an online class, or just having fun, Collaborate is the perfect space for your collective imagination.
                </p>
            </div>
        </div>
    );
};

export default AboutUs;
