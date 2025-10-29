import React from 'react';

const originalModule = jest.requireActual('react-router-dom');

module.exports = {
    __esModule: true,
    ...originalModule,

    useLocation: jest.fn().mockReturnValue({
        pathname: '/',
        search: '',
        hash: '',
        state: null,
        key: 'testKey',
    }),

    useParams: jest.fn().mockReturnValue({}),

    useNavigate: jest.fn().mockReturnValue(jest.fn()),

    NavLink: (props) => {
        const { to, children, ...rest } = props;
        return (
            <a href={to} {...rest}>
                {children}
            </a>
        );
    },

    Link: (props) => {
        const { to, children, ...rest } = props;
        return (
            <a href={to} {...rest}>
                {children}
            </a>
        );
    },

    Outlet: () => <div>Mocked Outlet</div>,

    Navigate: () => <div>Mocked Navigate</div>,

    MemoryRouter: ({ children }) => <div>{children}</div>,
};
