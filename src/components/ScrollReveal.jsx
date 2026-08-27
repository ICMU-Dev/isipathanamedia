import { useEffect, useRef, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ScrollReveal = ({
    children,
    scrollContainerRef,
    enableBlur = true,
    baseOpacity = 0.1,
    baseRotation = 3,
    blurStrength = 3,
    className = '',
    textClassName = '',
    as: Container = 'div',
    textAs: TextWrapper = 'p',
    rotationStart = 'top bottom',
    rotationEnd = 'top 50%',
    wordAnimationStart = 'top 100%',
    wordAnimationEnd = 'top 50%'
}) => {
    const containerRef = useRef(null);
    const triggersRef = useRef([]);

    // Extract raw text from children (supports string and nested JSX)
    const extractText = (node) => {
        if (typeof node === 'string') return node;
        if (typeof node === 'number') return String(node);
        if (Array.isArray(node)) return node.map(extractText).join('');
        if (node?.props?.children) return extractText(node.props.children);
        return '';
    };

    const splitText = useMemo(() => {
        const text = extractText(children);
        if (!text) return null;

        return text.split(/(\s+)/).map((word, index) => {
            if (word.match(/^\s+$/)) return word;
            return (
                <span className="inline-block word" key={index}>
                    {word}
                </span>
            );
        });
    }, [children]);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const scroller =
            scrollContainerRef?.current ? scrollContainerRef.current : window;

        // Rotation animation
        const rotationTween = gsap.fromTo(
            el,
            { transformOrigin: '0% 50%', rotate: baseRotation },
            {
                ease: 'none',
                rotate: 0,
                scrollTrigger: {
                    trigger: el,
                    scroller,
                    start: rotationStart,
                    end: rotationEnd,
                    scrub: true
                }
            }
        );

        const wordElements = el.querySelectorAll('.word');

        // Opacity stagger animation
        const opacityTween = gsap.fromTo(
            wordElements,
            { opacity: baseOpacity, willChange: 'opacity' },
            {
                ease: 'none',
                opacity: 1,
                stagger: 0.05,
                scrollTrigger: {
                    trigger: el,
                    scroller,
                    start: wordAnimationStart,
                    end: wordAnimationEnd,
                    scrub: true
                }
            }
        );

        // Blur animation (Disabled on mobile to prevent severe scroll compositor lag)
        let blurTween;
        if (enableBlur) {
            let mm = gsap.matchMedia();
            mm.add("(min-width: 768px)", () => {
                blurTween = gsap.fromTo(
                    wordElements,
                    { filter: `blur(${blurStrength}px)` },
                    {
                        ease: 'none',
                        filter: 'blur(0px)',
                        stagger: 0.05,
                        scrollTrigger: {
                            trigger: el,
                            scroller,
                            start: wordAnimationStart,
                            end: wordAnimationEnd,
                            scrub: true
                        }
                    }
                );
            });
        }

        // Store triggers for this instance only
        triggersRef.current = [
            rotationTween.scrollTrigger,
            opacityTween.scrollTrigger,
            blurTween?.scrollTrigger
        ].filter(Boolean);

        return () => {
            triggersRef.current.forEach(trigger => trigger.kill());
            triggersRef.current = [];
        };
    }, [scrollContainerRef, enableBlur, baseRotation, baseOpacity, rotationStart, rotationEnd, wordAnimationStart, wordAnimationEnd, blurStrength]);

    return (
        <Container ref={containerRef} className={className}>
            <TextWrapper className={textClassName}>
                {splitText}
            </TextWrapper>
        </Container>
    );
};

export default ScrollReveal;
