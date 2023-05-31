import { useEffect } from 'react';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }) {
    const router = useRouter();

    useEffect(() => {
        const authToken = localStorage.getItem('authToken');
        if (!authToken && router.pathname !== '/login') {
            router.push('/login');
        }
    }, [router]);

    return <Component {...pageProps} />;
}

export default MyApp;
