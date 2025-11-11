import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PartnerPanelContent } from './PartnerPanelContent';
import { PartnerSectionsEditorRef } from '../partner-sections-editor/PartnerSectionsEditor';

jest.mock('../partner-page-toolbar/PartnerPageToolbar', () => ({
    PartnerPageToolbar: ({ onAddSection }: { onAddSection: () => void }) => (
        <div data-testid="partner-page-toolbar">
            <button onClick={onAddSection}>Add Section</button>
        </div>
    ),
}));

jest.mock('../partner-banner-form/PartnerBannerForm', () => ({
    PartnerBanner: () => <div data-testid="partner-banner" />,
}));

const mockPartnerSectionsEditor = jest.fn();

jest.mock('../partner-sections-editor/PartnerSectionsEditor', () => {
    const React = require('react');
    return {
        PartnerSectionsEditor: React.forwardRef((_: unknown, ref: React.Ref<PartnerSectionsEditorRef>) => {
            React.useImperativeHandle(ref, () => ({
                addSection: mockPartnerSectionsEditor,
            }));

            return <div data-testid="partner-sections-editor" />;
        }),
    };
});

jest.mock('../../../../../components/admin/toast/toast-container/ToastContainer', () => ({
    ToastContainer: () => <div data-testid="toast-container" />,
}));

describe('PartnerPanelContent', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockPartnerSectionsEditor.mockReset();
    });

    it('renders toolbar, banner, sections editor, and toast container', () => {
        render(<PartnerPanelContent />);

        expect(screen.getByTestId('partner-page-toolbar')).toBeInTheDocument();
        expect(screen.getByTestId('partner-banner')).toBeInTheDocument();
        expect(screen.getByTestId('partner-sections-editor')).toBeInTheDocument();
        expect(screen.getByTestId('toast-container')).toBeInTheDocument();
    });

    it('triggers addSection on the sections editor when toolbar button is clicked', () => {
        render(<PartnerPanelContent />);

        fireEvent.click(screen.getByText('Add Section'));

        expect(mockPartnerSectionsEditor).toHaveBeenCalledTimes(1);
    });
});
