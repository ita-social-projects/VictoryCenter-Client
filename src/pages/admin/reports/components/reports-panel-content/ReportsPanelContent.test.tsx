import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ReportsPanelContent } from './ReportsPanelContent';

const mockSubmit = jest.fn();

jest.mock('../reports-page-toolbar/ReportsPageToolbar', () => ({
    ReportsPageToolbar: (props: any) => (
        <div data-testid="mock-toolbar">
            <button data-testid="edit-btn" onClick={props.onEdit}>
                Edit
            </button>
            <button data-testid="cancel-btn" onClick={props.onCancel}>
                Cancel
            </button>
            <button data-testid="publish-btn" onClick={props.onPublish} disabled={props.isPublishDisabled}>
                Publish
            </button>
            <span data-testid="is-editing">{props.isEditing ? 'true' : 'false'}</span>
            <span data-testid="is-publish-disabled">{props.isPublishDisabled ? 'true' : 'false'}</span>
        </div>
    ),
    TOOLBAR_TABS: [
        { id: 'media-settings', label: 'Налаштування медіа' },
        { id: 'report-analytics', label: 'Звіт та аналітика' },
    ],
}));

jest.mock('../media-settings/MediaSettings', () => {
    const React = require('react');
    return {
        MediaSettings: React.forwardRef((props: any, ref: any) => {
            React.useImperativeHandle(ref, () => ({
                submit: (...args: any[]) => mockSubmit(...args),
            }));
            return (
                <div data-testid="mock-media-settings">
                    <span data-testid="ms-is-editing">{props.isEditing ? 'true' : 'false'}</span>
                    <span data-testid="ms-reset-counter">{props.resetCounter}</span>
                    <button data-testid="ms-dirty-true" onClick={() => props.onDirtyChange(true)}>
                        Mark dirty
                    </button>
                    <button data-testid="ms-dirty-false" onClick={() => props.onDirtyChange(false)}>
                        Mark clean
                    </button>
                </div>
            );
        }),
    };
});

jest.mock('@/components/admin/toast/toast-container/ToastContainer', () => ({
    ToastContainer: () => <div data-testid="mock-toast-container" />,
}));

jest.mock('./ReportsPanelContent.module.scss', () => ({
    root: 'root',
    toolbar: 'toolbar',
    content: 'content',
}));

const renderComponent = () => render(<ReportsPanelContent />);

const clickEdit = () => fireEvent.click(screen.getByTestId('edit-btn'));
const clickCancel = () => fireEvent.click(screen.getByTestId('cancel-btn'));
const clickPublish = () => fireEvent.click(screen.getByTestId('publish-btn'));
const markDirty = () => fireEvent.click(screen.getByTestId('ms-dirty-true'));
const markClean = () => fireEvent.click(screen.getByTestId('ms-dirty-false'));

const expectEditing = (value: boolean) => expect(screen.getByTestId('is-editing')).toHaveTextContent(String(value));
const expectMsEditing = (value: boolean) =>
    expect(screen.getByTestId('ms-is-editing')).toHaveTextContent(String(value));
const expectPublishDisabled = (value: boolean) =>
    expect(screen.getByTestId('is-publish-disabled')).toHaveTextContent(String(value));
const expectResetCounter = (value: number) =>
    expect(screen.getByTestId('ms-reset-counter')).toHaveTextContent(String(value));

describe('ReportsPanelContent', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockSubmit.mockResolvedValue(true);
    });

    describe('Initial render', () => {
        it('should render toolbar, media settings, and toast container', () => {
            renderComponent();

            expect(screen.getByTestId('mock-toolbar')).toBeInTheDocument();
            expect(screen.getByTestId('mock-media-settings')).toBeInTheDocument();
            expect(screen.getByTestId('mock-toast-container')).toBeInTheDocument();
        });

        it('should start in non-editing mode', () => {
            renderComponent();

            expectEditing(false);
            expectMsEditing(false);
        });

        it('should start with publish button disabled (not dirty)', () => {
            renderComponent();

            expectPublishDisabled(true);
        });

        it('should start with resetCounter at 0', () => {
            renderComponent();

            expectResetCounter(0);
        });
    });

    describe('Edit mode', () => {
        it('should enter editing mode when Edit button is clicked', () => {
            renderComponent();

            clickEdit();

            expectEditing(true);
            expectMsEditing(true);
        });

        it('should reset dirty state when entering edit mode', () => {
            renderComponent();

            markDirty();
            expectPublishDisabled(false);

            clickEdit();
            expectPublishDisabled(true);
        });
    });

    describe('Cancel', () => {
        it('should exit editing mode when Cancel is clicked', () => {
            renderComponent();

            clickEdit();
            expectEditing(true);

            clickCancel();
            expectEditing(false);
        });

        it('should increment resetCounter when Cancel is clicked', () => {
            renderComponent();

            expectResetCounter(0);

            clickCancel();
            expectResetCounter(1);

            clickCancel();
            expectResetCounter(2);
        });

        it('should reset dirty state when Cancel is clicked', () => {
            renderComponent();

            markDirty();
            expectPublishDisabled(false);

            clickCancel();
            expectPublishDisabled(true);
        });
    });

    describe('Dirty state', () => {
        it('should enable publish button when dirty', () => {
            renderComponent();

            expectPublishDisabled(true);

            markDirty();
            expectPublishDisabled(false);
        });

        it('should disable publish button when marked clean', () => {
            renderComponent();

            markDirty();
            expectPublishDisabled(false);

            markClean();
            expectPublishDisabled(true);
        });
    });

    describe('Publish', () => {
        it('should reset dirty state after successful publish', async () => {
            renderComponent();

            clickEdit();
            markDirty();
            expectPublishDisabled(false);

            clickPublish();

            await waitFor(() => {
                expectPublishDisabled(true);
            });
        });

        it('should stay in editing mode when publish fails', async () => {
            mockSubmit.mockResolvedValue(false);
            renderComponent();

            clickEdit();
            clickPublish();

            await waitFor(() => {
                expectEditing(true);
            });
        });
    });
});
