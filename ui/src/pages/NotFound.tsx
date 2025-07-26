import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
    const location = useLocation();

    useEffect(() => {
        console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    }, [location.pathname]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
            <div className="text-center p-8 bg-white/80 rounded-xl shadow-xl max-w-lg mx-auto animate-fade-in">
                <div className="flex justify-center mb-6">
                    {/* SVG Illustration */}
                    <svg
                        width="120"
                        height="120"
                        viewBox="0 0 120 120"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <circle
                            cx="60"
                            cy="60"
                            r="56"
                            fill="#f3e8ff"
                            stroke="#a78bfa"
                            strokeWidth="4"
                        />
                        <ellipse cx="60" cy="80" rx="28" ry="10" fill="#ddd6fe" />
                        <circle cx="45" cy="55" r="6" fill="#a78bfa" />
                        <circle cx="75" cy="55" r="6" fill="#a78bfa" />
                        <rect x="50" y="70" width="20" height="6" rx="3" fill="#a78bfa" />
                    </svg>
                </div>
                <h1 className="text-6xl font-extrabold text-purple-600 mb-2 tracking-tight drop-shadow-lg">
                    404
                </h1>
                <p className="text-2xl text-gray-700 mb-4 font-semibold">Oops! Page not found</p>
                <p className="text-gray-500 mb-6">
                    The page you are looking for does not exist or has been moved.
                </p>
                <a
                    href="/"
                    className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg shadow-lg font-bold text-lg hover:scale-105 transition-transform"
                >
                    Return to Home
                </a>
            </div>
        </div>
    );
};

export default NotFound;
