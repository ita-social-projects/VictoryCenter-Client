import { useAdminContext } from '../../../context/admin-context-provider/AdminContextProvider';

// This hook is made for components that need to make API calls to the protected endpoints.
export const useAdminClient = () => useAdminContext().client;
