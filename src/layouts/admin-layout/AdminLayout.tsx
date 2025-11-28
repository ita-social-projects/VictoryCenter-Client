import styles from './AdminLayout.module.scss';
import { Outlet } from 'react-router-dom';
import { AdminNavigation } from '../../components/admin/admin-navigation/AdminNavigation';

export const AdminLayout = () => (
    <div className={styles['admin']}>
        <div className={styles['admin__navigation']}>
            <AdminNavigation />
        </div>
        <div className={styles['admin__page']}>
            <Outlet />
        </div>
    </div>
);
