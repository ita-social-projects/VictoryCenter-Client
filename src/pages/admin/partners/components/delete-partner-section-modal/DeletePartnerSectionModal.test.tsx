import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DeletePartnerSectionModal } from './DeletePartnerSectionModal';
import { PARTNERS_TEXT } from '../../../../../const/admin/partners';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import { useAdminClient } from '../../../../../hooks/admin/use-admin-client/useAdminClient';
import { PartnersApi } from '../../../../../services/api/admin/partners/partners-api';

jest.mock('../../../../../hooks/admin/use-admin-client/useAdminClient', () => ({
    useAdminClient: jest.fn(),
}));
jest.mock('../../../../../services/api/admin/partners/partners-api', () => ({
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
        let resolvePromise: () => void;
        const neverResolvingPromise = new Promise<void>((resolve) => {
            resolvePromise = resolve;
        });
        (PartnersApi.deleteSection as jest.Mock).mockReturnValue(neverResolvingPromise);

        render(
            <DeletePartnerSectionModal
                isOpen={true}
                onClose={onClose}
                sectionToDelete={section}
                onDeleteSection={onDeleteSection}
            />,
        );

        fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.YES }));

        fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.NO }));

        expect(onClose).not.toHaveBeenCalled();

        resolvePromise!();

        await waitFor(() => {
            const btn = screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.NO });
            expect(btn).toBeInTheDocument();
        });

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('disables "Yes" button while submitting to prevent duplicate requests', async () => {
        let resolvePromise: () => void;
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

        // Try clicking again while submitting
        fireEvent.click(yesButton);
        expect(PartnersApi.deleteSection).toHaveBeenCalledTimes(1);

        resolvePromise!();

        await waitFor(() => {
            expect(onClose).toHaveBeenCalled();
        });
    });
});
