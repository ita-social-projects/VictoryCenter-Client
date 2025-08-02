import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';
import { ADMIN_ROUTES } from '../../../const/admin/routes';
import { adminHomeDataFetch } from '../../../utils/mock-data/admin/home';

export const AdminHomePage = () => {
    const [headerInfo, setHeaderInfo] = useState('');
    const [contentInfo, setContentInfo] = useState('');

    useEffect(() => {
        (async () => {
            const responce = await adminHomeDataFetch();

            const { header, content } = responce;

            // DEV NOTE: in React 18 and higher there is a term "Automatic Batching"
            // https://react.dev/blog/2022/03/08/react-18-upgrade-guide#automatic-batching
            // that means if you are calling setState one after another it will set data in ONE render cycle
            // please follow the pattern

            setHeaderInfo(header);
            setContentInfo(content);
        })();
    }, []);

    return (
        <div className="admin-page-content">
            <h1 className="header">{headerInfo}</h1>
            <p className="content">{contentInfo}</p>
            <NavLink to={ADMIN_ROUTES.TEAM.FULL}>teams</NavLink>
            <NavLink to={ADMIN_ROUTES.PROGRAMS.FULL}>programs</NavLink>
        </div>
    );
};
