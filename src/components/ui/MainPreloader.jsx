import React, { useEffect, useRef } from "react";
import gsap from "gsap";

const MainPreloader = ({ onComplete }) => {
    const containerRef = useRef(null);
    const word1Ref = useRef(null);
    const word2Ref = useRef(null);

    useEffect(() => {
        const tl = gsap.timeline({
            onComplete: () => {
                gsap.to(containerRef.current, {
                    yPercent: -100,
                    duration: 0.8,
                    ease: "power3.inOut",
                    onComplete: onComplete
                });
            }
        });

        gsap.set([word1Ref.current, word2Ref.current], { opacity: 0, y: 10, scale: 0.98 });

        tl.to(word1Ref.current, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power2.out" })
          .to(word1Ref.current, { opacity: 0, y: -10, scale: 1.05, duration: 0.5, ease: "power2.inOut" }, "+=0.2")
          .to(word2Ref.current, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power2.out" }, "-=0.2")
          .to(word2Ref.current, { opacity: 0, y: -10, scale: 1.05, duration: 0.5, ease: "power2.inOut" }, "+=0.2");

        return () => tl.kill();
    }, [onComplete]);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-[9999] bg-black flex items-center justify-center text-white will-change-transform"
        >
            <div className="relative overflow-hidden h-20 w-full flex items-center justify-center">
                <h1
                    ref={word1Ref}
                    className="absolute text-3xl md:text-5xl tracking-[0.2em] uppercase opacity-0 will-change-transform"
                >
                    NO SACRIFICE
                </h1>
                <h1
                    ref={word2Ref}
                    className="absolute text-3xl md:text-5xl tracking-[0.2em] uppercase opacity-0 will-change-transform"
                >
                    NO VICTORY
                </h1>
            </div>

            <div className="absolute bottom-10 opacity-20 text-[10px] tracking-[0.5em] uppercase">
                SINCE 1999
            </div>
        </div>
    );
};

export default MainPreloader;
