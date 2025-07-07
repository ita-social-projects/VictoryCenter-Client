import React, { createContext, useContext, useMemo, ReactNode } from "react";
import { getIsLoginSuccessfulMock } from "../../utils/mock-data/admin-page/loginMethod";

// DEV NOTE: This is a exaple how we can implement log in procces using React Context
// if you are more comfortable with AutLayout for React Router then go for it

type Props = {
    children: ReactNode;
};

type ContextType = {
    token: string;
};

const AdminContext = createContext<ContextType | undefined>(undefined);

export const AdminContextProvider = ({ children }: Props) => {
    // DEV NOTE:
    // here you need to call login method to init login proccess
    // for example

    // const isLoginSuccessful =  initLogin();
    // additional logic to show log in page if needed

    // if isLoginSuccessful = true then we will "leed" user to admin page
    // if isLoginSuccessful = false then we will show user error message

    const isLoginSuccessful = getIsLoginSuccessfulMock(); // <-- true

    const token = "fake-token"; // <-- in a future provide real token here

    const contextValue = useMemo(
        () => ({
            token,
        }),
        [token],
    );

    return isLoginSuccessful ? (
        <AdminContext.Provider value={contextValue}>{children}</AdminContext.Provider>
    ) : (
        <div className="error-message-container">
            <p>YOU SHALL NOT PASS!!!</p>
            <img src={"https://i.gifer.com/36Ja.gif"} alt="you shall not pass!" />
        </div>
    );
};

export const useAdminContext = () => useContext(AdminContext) as ContextType;
