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

type Deferred<T> = {
    promise: Promise<T>;
    resolve: (value: T) => void;
    reject: (reason?: unknown) => void;
};

const createDeferred = <T,>(): Deferred<T> => {
    let resolve!: (value: T) => void;
    let reject!: (reason?: unknown) => void;

    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });

    return { promise, resolve, reject };
};

describe('DeletePartnerSectionModal', () => {
    const onClose = jest.fn();
    const onDeleteSection = jest.fn();

    const section = {
        id: 123,
        title: 'Ті, хто відкрили нам',
        description: 'Ранчо, завдяки яким',
        partners: [
            { id: 12, image: null, description: 'Ранчо, завдяки яким', imageId: 13 },
            { id: 11, image: null, description: 'Ранчо, завдяки яким', imageId: 14 },
        ],
    };

    const renderModal = (props?: Partial<React.ComponentProps<typeof DeletePartnerSectionModal>>) =>
        render(
            <DeletePartnerSectionModal
                isOpen={true}
                onClose={onClose}
                sectionToDelete={section as any}
                onDeleteSection={onDeleteSection}
                {...props}
            />,
        );

    beforeEach(() => {
        jest.clearAllMocks();
        capturedYesClick = undefined;
        (useAdminClient as jest.Mock).mockReturnValue({});
    });

    it('renders modal when open with title and buttons', () => {
        renderModal({ isOpen: true });

        expect(screen.getByText(PARTNERS_TEXT.FORM.TITLE.DELETE_SECTION)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.NO })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.YES })).toBeInTheDocument();
    });

    it('does not render modal content when closed', () => {
        const { container } = renderModal({ isOpen: false });
        expect(container).toBeEmptyDOMElement();
    });

    it('calls delete API and callbacks on successful confirm delete', async () => {
        const client = {};
        (useAdminClient as jest.Mock).mockReturnValue(client);
        (PartnersApi.deleteSection as jest.Mock).mockResolvedValue(undefined);

        renderModal();

        fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.YES }));

        expect(PartnersApi.deleteSection).toHaveBeenCalledWith(client, section.id);

        await waitFor(() => {
            expect(onDeleteSection).toHaveBeenCalledWith(section);
            expect(onClose).toHaveBeenCalledTimes(1);
        });
    });

    it('shows error message on failed delete and clears it on "No"', async () => {
        (PartnersApi.deleteSection as jest.Mock).mockRejectedValue(new Error('Failed'));

        renderModal();

        fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.YES }));

        expect(await screen.findByText(PARTNERS_TEXT.FORM.MESSAGE.FAIL_TO_DELETE_PARTNER_SECTION)).toBeInTheDocument();
        expect(onDeleteSection).not.toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();

        fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.NO }));

        await waitFor(() => {
            expect(onClose).toHaveBeenCalledTimes(1);
            expect(
                screen.queryByText(PARTNERS_TEXT.FORM.MESSAGE.FAIL_TO_DELETE_PARTNER_SECTION),
            ).not.toBeInTheDocument();
        });
    });

    it('does not call API when sectionToDelete is null and disables "Yes"', async () => {
        (PartnersApi.deleteSection as jest.Mock).mockResolvedValue(undefined);

        renderModal({ sectionToDelete: null });

        const yesButton = screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.YES });
        expect(yesButton).toBeDisabled();

        fireEvent.click(yesButton);

        expect(PartnersApi.deleteSection).not.toHaveBeenCalled();
        expect(onDeleteSection).not.toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
    });

    it('prevents closing and duplicate confirm while submitting; then closes after resolve', async () => {
        const d = createDeferred<void>();
        (PartnersApi.deleteSection as jest.Mock).mockReturnValue(d.promise);

        renderModal();

        fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.YES }));

        await waitFor(() => {
            expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.YES })).toBeDisabled();
        });

        fireEvent.click(screen.getByLabelText('modal-close'));
        expect(onClose).not.toHaveBeenCalled();

        capturedYesClick?.();
        expect(PartnersApi.deleteSection).toHaveBeenCalledTimes(1);

        d.resolve(undefined);

        await waitFor(() => {
            expect(onDeleteSection).toHaveBeenCalledWith(section);
            expect(onClose).toHaveBeenCalledTimes(1);
        });
    });
});
