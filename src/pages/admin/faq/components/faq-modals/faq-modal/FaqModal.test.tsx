import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FaqModal, FaqModalProps } from './FaqModal';
import { VisibilityStatus } from '../../../../../../types/admin/common';
import { AdminContext } from '../../../../../../contexts/admin/admin-context-provider/AdminContextProvider';
import { FAQ_TEXT } from '../../../../../../const/admin/faq';
// Create a minimal mock Axios client
const mockClient: any = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    request: jest.fn(),
    interceptors: { request: { use: jest.fn(), eject: jest.fn() }, response: { use: jest.fn(), eject: jest.fn() } },
    defaults: {
        headers: {
            common: { Accept: '' },
            delete: {},
            get: {},
            head: {},
            post: {},
            put: {},
            patch: {},
            options: {},
        },
    },
    getUri: jest.fn(),
    head: jest.fn(),
    options: jest.fn(),
    patch: jest.fn(),
    create: jest.fn(),
    postForm: jest.fn(),
    putForm: jest.fn(),
    patchForm: jest.fn(),
};
const mockContextValue = {
    client: mockClient,
    isAuthenticated: true,
    isLoading: false,
    login: jest.fn(),
    logout: jest.fn(),
    refreshAccessToken: jest.fn(),
};

const renderWithAdminContext = (ui: React.ReactElement) =>
    render(<AdminContext.Provider value={mockContextValue}>{ui}</AdminContext.Provider>);

const mockPages = [
    { id: 1, slug: 'home', title: 'Home', name: 'Home' },
    { id: 2, slug: 'about', title: 'About', name: 'About' },
];

const mockFaq = {
    id: 101,
    questionText: 'What is Victory Center?',
    answerText: 'Victory Center is a platform...',
    pages: mockPages,
    status: VisibilityStatus.Published,
};

describe('FaqModal', () => {
    it('renders in add mode', () => {
        renderWithAdminContext(
            <FaqModal isOpen={true} onClose={jest.fn()} mode="add" pages={mockPages} onAddFaq={jest.fn()} />,
        );
        expect(screen.getByText(FAQ_TEXT.FORM.TITLE.ADD_FAQ)).toBeInTheDocument();
        expect(screen.getByText(FAQ_TEXT.FORM.LABEL.QUESTION)).toBeInTheDocument();
        expect(screen.getByText(FAQ_TEXT.FORM.LABEL.ANSWER)).toBeInTheDocument();
    });

    it('renders in edit mode', () => {
        renderWithAdminContext(
            <FaqModal
                isOpen={true}
                onClose={jest.fn()}
                mode="edit"
                faqToEdit={mockFaq}
                pages={mockPages}
                onEditFaq={jest.fn()}
            />,
        );
        expect(screen.getByText(FAQ_TEXT.FORM.TITLE.EDIT_FAQ)).toBeInTheDocument();
        expect(screen.getByDisplayValue(mockFaq.questionText)).toBeInTheDocument();
        expect(screen.getByDisplayValue(mockFaq.answerText)).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
        const onClose = jest.fn();
        renderWithAdminContext(
            <FaqModal isOpen={true} onClose={onClose} mode="add" pages={mockPages} onAddFaq={jest.fn()} />,
        );
        const closeBtn = screen.getByRole('button', { name: 'Close modal' });
        fireEvent.click(closeBtn);
        expect(onClose).toHaveBeenCalled();
    });
});
