import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ShareTargetHandler = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user, loading } = useAuth();

    useEffect(() => {
        if (loading) return;

        // PWA Share Target provides title, text, and url depending on what the native app sent.
        const sharedTitle = searchParams.get('title') || '';
        const sharedText = searchParams.get('text') || '';
        const sharedUrl = searchParams.get('url') || '';

        // Extract a URL from any of the fields (sometimes Facebook puts the URL in 'text')
        let extractedUrl = sharedUrl;
        if (!extractedUrl) {
            const urlRegex = /(https?:\/\/[^\s]+)/g;
            const match = sharedText.match(urlRegex) || sharedTitle.match(urlRegex);
            if (match) {
                extractedUrl = match[0];
            }
        }

        if (extractedUrl) {
            // Save to session storage so CreateUpdate.jsx can pick it up
            sessionStorage.setItem('pendingSharedUrl', extractedUrl);
        }

        // Navigate to the update creator if logged in, otherwise go to home page
        if (user && user.indexNumber) {
            navigate(`/${user.indexNumber}/dashboard/news/update`, { replace: true });
        } else {
            // They aren't logged in. Send to home. The pendingSharedUrl will remain in sessionStorage
            // for when they eventually log in and navigate to the update creator.
            navigate('/', { replace: true });
        }
    }, [searchParams, navigate, user, loading]);

    return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white">
            <Loader2 size={48} className="animate-spin text-theme-accent  mb-4" />
            <h2 className="text-xl font-bold">Processing Shared Link...</h2>
            <p className="text-white/50 text-sm mt-2">Redirecting to ICMU Dashboard</p>
        </div>
    );
};

export default ShareTargetHandler;
