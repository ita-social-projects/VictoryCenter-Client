import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

export const ScrollWrapper = ({ behavior = 'auto' }: { behavior?: 'auto' | 'smooth' }) => {
    const pathName = useLocation().pathname;

    useEffect(() => {
        window.scrollTo({ top: 0, behavior });
    }, [pathName, behavior]);

    return <Outlet />;
};
