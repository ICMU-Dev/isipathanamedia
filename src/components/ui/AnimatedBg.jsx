import React from 'react';

/**
 * AnimatedBg — simplified version to reduce lag.
 * Removed massive blurs and continuous CSS animations.
 */
const AnimatedBg = ({ variant = 'about' }) => {
    // Instead of blurred glows, we use crisp, performant SVG dot patterns
    return (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-[0.03]">
            <svg
                className="absolute inset-0 w-full h-full"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <pattern
                        id={`dotGrid-${variant}`}
                        width="30"
                        height="30"
                        patternUnits="userSpaceOnUse"
                    >
                        <circle cx="2" cy="2" r="1.5" fill="#4bc433" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill={`url(#dotGrid-${variant})`} />
            </svg>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/80 to-black"></div>
        </div>
    );
};

export default AnimatedBg;
