import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DeletePartnerSectionModal } from './DeletePartnerSectionModal';
import { PARTNERS_TEXT } from '@/const/admin/partners';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { PartnersApi } from '@/services/api/admin/partners/partners-api';

let capturedYesClick: (() => void) | undefined;

jest.mock('@/components/common/modal/Modal', () => {
    const React = require('react');

    const Modal = ({ isOpen, onClose, children }: any) => {
        if (!isOpen) return null;
        return (
            <div data-testid="modal">
                <button type="button" aria-label="modal-close" onClick={onClose} />
                {children}
            </div>
        );
    };

    Modal.Title = ({ children }: any) => <div>{children}</div>;
    Modal.Content = ({ children }: any) => <div>{children}</div>;
    Modal.Actions = ({ children }: any) => <div>{children}</div>;

    return { Modal };
});

jest.mock('@/components/admin/button/Button', () => ({
    Button: ({ children, onClick, disabled, ...rest }: any) => {
        if (rest.buttonStyle === 'primary') capturedYesClick = onClick;
        return (
            <button type="button" onClick={onClick} disabled={disabled} {...rest}>
                {children}
            </button>
        );
    },
}));

jest.mock('./DeletePartnerSectionModal.module.scss', () => ({
    'error-container': 'error-container',
    'btn-danger': 'btn-danger',
}));

jest.mock('@/hooks/admin/use-admin-client/useAdminClient', () => ({
    useAdminClient: jest.fn(),
}));
jest.mock('@/services/api/admin/partners/partners-api', () => ({
    PartnersApi: {
        deleteSection: jest.fn(),
    },
}));

describe('DeletePartnerSectionModal', () => {
    const onClose = jest.fn();
    const onDeleteSection = jest.fn();

    const section = {
        id: 123,
        title: 'Ті, хто відкрили нам',
        description: 'Ранчо, завдяки яким',
        partners: [
            {
                id: 12,
                image: null,
                description: 'Ранчо, завдяки яким',
                imageId: 13,
            },
            {
                id: 11,
                image: null,
                description: 'Ранчо, завдяки яким',
                imageId: 14,
            },
        ],
    };

    beforeEach(() => {
        jest.clearAllMocks();
        capturedYesClick = undefined;
        (useAdminClient as jest.Mock).mockReturnValue({});
    });

    it('renders modal when open with title and buttons', () => {
        render(
            <DeletePartnerSectionModal
                isOpen={true}
                onClose={onClose}
                sectionToDelete={section}
                onDeleteSection={onDeleteSection}
            />,
        );

        expect(screen.getByText(PARTNERS_TEXT.FORM.TITLE.DELETE_SECTION)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.NO })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.YES })).toBeInTheDocument();
    });

    it('does not render modal content when closed', () => {
        const { container } = render(
            <DeletePartnerSectionModal
                isOpen={false}
                onClose={onClose}
                sectionToDelete={section}
                onDeleteSection={onDeleteSection}
            />,
        );
        expect(container).toBeEmptyDOMElement();
    });

    it('calls onClose when clicking "No" button and resets error', () => {
        render(
            <DeletePartnerSectionModal
                isOpen={true}
                onClose={onClose}
                sectionToDelete={section}
                onDeleteSection={onDeleteSection}
            />,
        );

        fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.NO }));

        expect(onClose).toHaveBeenCalledTimes(1);
        expect(screen.queryByText(PARTNERS_TEXT.FORM.MESSAGE.FAIL_TO_DELETE_PARTNER_SECTION)).not.toBeInTheDocument();
    });

    it('calls delete API and callbacks on successful confirm delete', async () => {
        (PartnersApi.deleteSection as jest.Mock).mockResolvedValue(undefined);

        render(
            <DeletePartnerSectionModal
                isOpen={true}
                onClose={onClose}
                sectionToDelete={section}
                onDeleteSection={onDeleteSection}
            />,
        );

        fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.YES }));

        expect(PartnersApi.deleteSection).toHaveBeenCalledWith({}, section.id);

        await waitFor(() => {
            expect(onDeleteSection).toHaveBeenCalledWith(section);
            expect(onClose).toHaveBeenCalled();
        });
    });

    it('does not call API when member to delete is null', async () => {
        (PartnersApi.deleteSection as jest.Mock).mockResolvedValue(undefined);

        render(
            <DeletePartnerSectionModal
                isOpen={true}
                onClose={onClose}
                sectionToDelete={null}
                onDeleteSection={onDeleteSection}
            />,
        );

        fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.YES }));

        expect(PartnersApi.deleteSection).not.toHaveBeenCalled();
        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.YES })).toBeDisabled();

        await waitFor(() => {
            expect(onDeleteSection).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
        });
    });

    it('shows error message on failed delete', async () => {
        (PartnersApi.deleteSection as jest.Mock).mockRejectedValue(new Error('Failed'));

        render(
            <DeletePartnerSectionModal
                isOpen={true}
                onClose={onClose}
                sectionToDelete={section}
                onDeleteSection={onDeleteSection}
            />,
        );

        fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.YES }));

        await waitFor(() => {
            expect(screen.getByText(PARTNERS_TEXT.FORM.MESSAGE.FAIL_TO_DELETE_PARTNER_SECTION)).toBeInTheDocument();
        });

        expect(onDeleteSection).not.toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
    });

    it('prevents closing modal while submitting', async () => {
        let resolvePromise!: () => void;
        const pending = new Promise<void>((resolve) => {
            resolvePromise = resolve;
        });
        (PartnersApi.deleteSection as jest.Mock).mockReturnValue(pending);

        render(
            <DeletePartnerSectionModal
                isOpen={true}
                onClose={onClose}
                sectionToDelete={section}
                onDeleteSection={onDeleteSection}
            />,
        );

        fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.YES }));
        fireEvent.click(screen.getByLabelText('modal-close'));

        expect(onClose).not.toHaveBeenCalled();

        resolvePromise();

        await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    });

    it('disables "Yes" button while submitting to prevent duplicate requests', async () => {
        let resolvePromise!: () => void;
        (PartnersApi.deleteSection as jest.Mock).mockImplementation(
            () =>
                new Promise<void>((resolve) => {
                    resolvePromise = resolve;
                }),
        );

        render(
            <DeletePartnerSectionModal
                isOpen={true}
                onClose={onClose}
                sectionToDelete={section}
                onDeleteSection={onDeleteSection}
            />,
        );

        const yesButton = screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.YES });
        expect(yesButton).not.toBeDisabled();

        fireEvent.click(yesButton);
        expect(yesButton).toBeDisabled();

        fireEvent.click(yesButton);
        expect(PartnersApi.deleteSection).toHaveBeenCalledTimes(1);

        resolvePromise();

        await waitFor(() => {
            expect(onClose).toHaveBeenCalled();
        });
    });

    it('clears error after failure once modal is reopened', async () => {
        (PartnersApi.deleteSection as jest.Mock).mockRejectedValue(new Error('Failed'));

        const { rerender } = render(
            <DeletePartnerSectionModal
                isOpen={true}
                onClose={onClose}
                sectionToDelete={section}
                onDeleteSection={onDeleteSection}
            />,
        );

        fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.YES }));
        expect(await screen.findByText(PARTNERS_TEXT.FORM.MESSAGE.FAIL_TO_DELETE_PARTNER_SECTION)).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.NO }));

        rerender(
            <DeletePartnerSectionModal
                isOpen={false}
                onClose={onClose}
                sectionToDelete={section}
                onDeleteSection={onDeleteSection}
            />,
        );

        rerender(
            <DeletePartnerSectionModal
                isOpen={true}
                onClose={onClose}
                sectionToDelete={section}
                onDeleteSection={onDeleteSection}
            />,
        );

        expect(screen.queryByText(PARTNERS_TEXT.FORM.MESSAGE.FAIL_TO_DELETE_PARTNER_SECTION)).not.toBeInTheDocument();
    });

    it('returns early on confirm when already submitting (branch coverage)', async () => {
        let resolvePromise!: () => void;
        (PartnersApi.deleteSection as jest.Mock).mockImplementation(
            () =>
                new Promise<void>((resolve) => {
                    resolvePromise = resolve;
                }),
        );

        render(
            <DeletePartnerSectionModal
                isOpen={true}
                onClose={onClose}
                sectionToDelete={section}
                onDeleteSection={onDeleteSection}
            />,
        );

        fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.YES }));
        await waitFor(() => expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.YES })).toBeDisabled());

        capturedYesClick?.();

        expect(PartnersApi.deleteSection).toHaveBeenCalledTimes(1);

        resolvePromise();
        await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    });

    it('returns early on close while submitting (branch coverage)', async () => {
        let resolvePromise!: () => void;
        (PartnersApi.deleteSection as jest.Mock).mockImplementation(
            () =>
                new Promise<void>((resolve) => {
                    resolvePromise = resolve;
                }),
        );

        render(
            <DeletePartnerSectionModal
                isOpen={true}
                onClose={onClose}
                sectionToDelete={section}
                onDeleteSection={onDeleteSection}
            />,
        );

        fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.YES }));
        fireEvent.click(screen.getByLabelText('modal-close'));

        expect(onClose).not.toHaveBeenCalled();

        resolvePromise();
        await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));

        fireEvent.click(screen.getByLabelText('modal-close'));
        expect(onClose).toHaveBeenCalledTimes(2);
    });
});
