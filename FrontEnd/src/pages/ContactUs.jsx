import React from 'react';

// Icons
const EnvelopeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4
             c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
        <polyline points="22,6 12,13 2,6"></polyline>
    </svg>
);

const PhoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2
             19.79 19.79 0 0 1-8.63-3.07
             19.5 19.5 0 0 1-6.09-6.09
             A19.79 19.79 0 0 1 2.08 3.18
             a2 2 0 0 1 2-2.18h3
             a2 2 0 0 1 2 1.74l1.45 4.54
             a2 2 0 0 1-.41 2.13l-1.95 1.95
             a15.25 15.25 0 0 0 5.61 5.61
             l1.95-1.95a2 2 0 0 1 2.13-.41
             l4.54 1.45a2 2 0 0 1 1.74 2z"></path>
    </svg>
);

const LinkedinIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7
             a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7
             h-4v-7a6 6 0 0 1 6-6z"></path>
        <rect x="2" y="9" width="4" height="12"></rect>
        <circle cx="4" cy="4" r="2"></circle>
    </svg>
);

const GithubIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 19c-5 1.5-5-2.5-7-3
             m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61
             c3.14-.35 6.44-1.54 6.44-7
             A5.44 5.44 0 0 0 20 4.77
             A5.07 5.07 0 0 0 19.91 1
             S18.73.65 16 2.48
             a13.38 13.38 0 0 0-7 0
             C6.27.65 5.09 1 5.09 1
             A5.07 5.07 0 0 0 5 4.77
             a5.44 5.44 0 0 0-1.5 3.78
             c0 5.42 3.3 6.51 6.44 7
             A3.37 3.37 0 0 0 9 18.13V22"></path>
    </svg>
);

const Contact = () => {
    // If the file is in public folder, use "/profile-pic.jpg"
    const profilePicUrl = "Logo1.png"; // <- convert HEIC to JPG/PNG and put in public folder

    const bio = `Hi, my name is Shaurya. I'm a passionate and motivated developer
  focused on building intuitive and efficient web applications. I enjoy
  collaborating on projects and am always eager to learn new technologies to
  solve complex problems. Feel free to connect with me on the platforms below!`;

    const contactInfo = [
        { icon: <EnvelopeIcon />, text: "mail@gmail.com", href: "mailto:mail@gmail.com" },
        { icon: <PhoneIcon />, text: "+91 911xxxx343", href: "tel:+91 911xxxx343" },
        { icon: <LinkedinIcon />, text: "LinkedIn Profile", href: "https://www.linkedin.com/in" },
        { icon: <GithubIcon />, text: "GitHub Account", href: "https://github.com/Shaurya2510" },
    ];

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6 md:p-12">
            <div className="text-center max-w-2xl bg-gray-800 rounded-lg p-8 shadow-xl">

                {/* Profile Picture */}
                <img
                    src={profilePicUrl}
                    alt="Profile"
                    onError={(e) => { e.target.src = "https://placehold.co/200x200/58a6ff/0d1117?text=Your+Photo"; }}
                    className="rounded-full w-48 h-48 mx-auto mb-6 border-4 border-blue-400 object-cover"
                />

                {/* Bio Section */}
                <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-8">
                    {bio}
                </p>

                {/* Contact Information */}
                <div className="flex flex-col items-start space-y-4">
                    <h2 className="text-2xl font-bold text-green-400">Contact Details</h2>
                    {contactInfo.map((item, index) => (
                        <a
                            key={index}
                            href={item.href}
                            className="flex items-center text-lg text-gray-300 hover:text-white transition-colors duration-200"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <span className="mr-3 text-2xl text-green-400">{item.icon}</span>
                            {item.text}
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Contact;
