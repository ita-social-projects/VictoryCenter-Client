import { createContext, useContext } from 'react';

export const HippotherapyReadOnlyContext = createContext(false);

export const useHippotherapyReadOnly = () => useContext(HippotherapyReadOnlyContext);
