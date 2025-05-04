import React from 'react';
import { AdminContextProvider } from '../../context/admin-context-provider/AdminContextProvider';
import { AdminPageContent } from './admin-page-content/AdminPageContent';

export const AdminPage = () => {
    return(
        <AdminContextProvider>
            <AdminPageContent />
        </AdminContextProvider>
    )
};
