import React, { lazy, Suspense } from 'react';
import { Navigate, Outlet, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import SEO from '../SEO';

const AdminLogin = lazy(() => import('../../pages/admin/AdminLogin'));

const staggerVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
      repeat: Infinity,
      repeatType: "reverse",
      repeatDelay: 0.5
    }
  })
};

const ProtectedRoute = () => {
    const { user, loading } = useAuth();
    const { adminPath } = useParams();
    const location = useLocation();

    const [showLoader, setShowLoader] = React.useState(false);

    React.useEffect(() => {
        let timer;
        if (loading) {
            timer = setTimeout(() => setShowLoader(true), 250);
        } else {
            setShowLoader(false);
        }
        return () => clearTimeout(timer);
    }, [loading]);

    if (loading) {
        if (!showLoader) return <div className="min-h-[100dvh] bg-ambient" />; // Blank background during brief check
        const text = "DECRYPTING SESSION...";
        return (
            <div className="min-h-[100dvh] bg-ambient flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-primary-neon/20 border-t-primary-neon rounded-full animate-spin mb-8" />
                <div className="flex space-x-[2px] text-theme-primary font-black uppercase tracking-[0.4em] text-[10px]">
                    {text.split("").map((char, i) => (
                        <motion.span
                            key={i}
                            custom={i}
                            variants={staggerVariants}
                            initial="hidden"
                            animate="visible"
                            className="inline-block"
                        >
                            {char === " " ? "\u00A0" : char}
                        </motion.span>
                    ))}
                </div>
            </div>
        );
    }

    if (!adminPath) {
        return <Navigate to="/" replace />;
    }

    // Show login if not authenticated or if URL index doesn't match session
    if (!user || user.indexNumber !== adminPath) {
        // Redirect to the clean index route if they are on a nested route (e.g., /1234/dashboard -> /1234)
        if (location.pathname !== `/${adminPath}`) {
            return <Navigate to={`/${adminPath}`} replace />;
        }
        
        return (
            <Suspense fallback={
                <div className="min-h-[100dvh] bg-ambient flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-primary-neon border-t-transparent rounded-full animate-spin" />
                </div>
            }>
                <AdminLogin urlIndexNo={adminPath} />
            </Suspense>
        );
    }

    return (
        <>
            <SEO noIndex={true} />
            <Outlet />
        </>
    );
};

export default ProtectedRoute;

