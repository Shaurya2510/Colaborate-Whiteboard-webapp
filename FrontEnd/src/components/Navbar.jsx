import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="fixed top-0 right-0 p-4">
            <ul className="flex space-x-4">

                <li>
                    <Link to="/about" className="text-white hover:text-blue-400 text-lg font-semibold transition-colors duration-300">About Us</Link>
                </li>
                <li>
                    <Link to="/contact" className="text-white hover:text-blue-400 text-lg font-semibold transition-colors duration-300">Contact Us</Link>
                </li>
                <li>
                    <Link to="/features" className="text-white hover:text-blue-400 text-lg font-semibold transition-colors duration-300">Features</Link>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;