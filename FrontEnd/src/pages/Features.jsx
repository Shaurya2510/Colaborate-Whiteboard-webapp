import React from 'react';

const PaintBrushIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a5 5 0 0 0-5 5v12a5 5 0 0 0 10 0V7a5 5 0 0 0-5-5z"></path>
        <path d="M16 16v2a5 5 0 0 1-10 0v-2"></path>
        <path d="M12 2v2"></path>
        <path d="M12 22v-2"></path>
    </svg>
);

const UsersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
);

const ShareIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
        <polyline points="16 6 12 2 8 6"></polyline>
        <line x1="12" y1="2" x2="12" y2="15"></line>
    </svg>
);

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
);

const HistoryIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 8V4l-4 4"></path>
        <path d="M12 16v4l4-4"></path>
        <path d="M21 12a9 9 0 1 1-9-9c1.03 0 2.02.2 2.92.57"></path>
        <path d="M12 22a9 9 0 0 0 9-9h-9"></path>
    </svg>
);

const ChatIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
);

const Features = () => {
    const featureList = [
        {
            icon: <PaintBrushIcon />,
            title: 'Intuitive Drawing Tools',
            description: 'Use pencils, lines, and shapes with a variety of colors to bring your ideas to life.',
        },
        {
            icon: <UsersIcon />,
            title: 'Real-Time Collaboration',
            description: 'Work with multiple users simultaneously on a single, shared canvas, seeing changes as they happen.',
        },
        {
            icon: <ShareIcon />,
            title: 'Easy Sharing',
            description: 'Share your whiteboard session with a simple room code, no sign-up required.',
        },
        {
            icon: <DownloadIcon />,
            title: 'Export Whiteboards',
            description: 'Save your completed work by downloading the canvas as a high-quality image.',
        },
        {
            icon: <HistoryIcon />,
            title: 'Undo and Redo Functionality',
            description: 'Never worry about mistakes with our built-in undo and redo capabilities for all your strokes.',
        },
        {
            icon: <ChatIcon />,
            title: 'Integrated Chat',
            description: 'Communicate with other users in the room via a built-in chatbox.',
        },
    ];

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6 md:p-12">
            <h1 className="text-4xl md:text-6xl font-bold text-green-600 mb-12">Key Features</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl">
                {featureList.map((feature, index) => (
                    <div key={index} className="flex flex-col items-center text-center bg-gray-800 p-8 rounded-lg shadow-xl transition-transform duration-300 hover:scale-105">
                        <div className="mb-4 text-4xl text-blue-400">
                            {feature.icon}
                        </div>
                        <h2 className="text-xl font-bold mb-2">{feature.title}</h2>
                        <p className="text-gray-400">{feature.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Features;
