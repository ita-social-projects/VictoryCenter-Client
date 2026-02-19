import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ReportsPanelContent } from './ReportsPanelContent';

var toolbarProps: any = null;
var mediaSettingsProps: any = null;

const mockSubmit = jest.fn();

jest.mock('../reports-page-toolbar/ReportsPageToolbar', () => ({
    ReportsPageToolbar: (props: any) => {
        toolbarProps = props;
        return (
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
        );
    },
}));

jest.mock('../media-settings/MediaSettings', () => {
    const React = require('react');
    return {
        MediaSettings: React.forwardRef((props: any, ref: any) => {
            mediaSettingsProps = props;
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

describe('ReportsPanelContent', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        toolbarProps = null;
        mediaSettingsProps = null;
        mockSubmit.mockResolvedValue(true);
    });

    describe('Initial render', () => {
        it('should render toolbar, media settings, and toast container', () => {
            render(<ReportsPanelContent />);

            expect(screen.getByTestId('mock-toolbar')).toBeInTheDocument();
            expect(screen.getByTestId('mock-media-settings')).toBeInTheDocument();
            expect(screen.getByTestId('mock-toast-container')).toBeInTheDocument();
        });

        it('should start in non-editing mode', () => {
            render(<ReportsPanelContent />);

            expect(screen.getByTestId('is-editing')).toHaveTextContent('false');
            expect(screen.getByTestId('ms-is-editing')).toHaveTextContent('false');
        });

        it('should start with publish button disabled (not dirty)', () => {
            render(<ReportsPanelContent />);

            expect(screen.getByTestId('is-publish-disabled')).toHaveTextContent('true');
        });

        it('should start with resetCounter at 0', () => {
            render(<ReportsPanelContent />);

            expect(screen.getByTestId('ms-reset-counter')).toHaveTextContent('0');
        });
    });

    describe('Edit mode', () => {
        it('should enter editing mode when Edit button is clicked', () => {
            render(<ReportsPanelContent />);

            fireEvent.click(screen.getByTestId('edit-btn'));

            expect(screen.getByTestId('is-editing')).toHaveTextContent('true');
            expect(screen.getByTestId('ms-is-editing')).toHaveTextContent('true');
        });

        it('should reset dirty state when entering edit mode', () => {
            render(<ReportsPanelContent />);

            // Mark dirty first
            fireEvent.click(screen.getByTestId('ms-dirty-true'));
            expect(screen.getByTestId('is-publish-disabled')).toHaveTextContent('false');

            // Enter edit mode resets dirty
            fireEvent.click(screen.getByTestId('edit-btn'));
            expect(screen.getByTestId('is-publish-disabled')).toHaveTextContent('true');
        });
    });

    describe('Cancel', () => {
        it('should exit editing mode when Cancel is clicked', () => {
            render(<ReportsPanelContent />);

            fireEvent.click(screen.getByTestId('edit-btn'));
            expect(screen.getByTestId('is-editing')).toHaveTextContent('true');

            fireEvent.click(screen.getByTestId('cancel-btn'));
            expect(screen.getByTestId('is-editing')).toHaveTextContent('false');
        });

        it('should increment resetCounter when Cancel is clicked', () => {
            render(<ReportsPanelContent />);

            expect(screen.getByTestId('ms-reset-counter')).toHaveTextContent('0');

            fireEvent.click(screen.getByTestId('cancel-btn'));
            expect(screen.getByTestId('ms-reset-counter')).toHaveTextContent('1');

            fireEvent.click(screen.getByTestId('cancel-btn'));
            expect(screen.getByTestId('ms-reset-counter')).toHaveTextContent('2');
        });

        it('should reset dirty state when Cancel is clicked', () => {
            render(<ReportsPanelContent />);

            fireEvent.click(screen.getByTestId('ms-dirty-true'));
            expect(screen.getByTestId('is-publish-disabled')).toHaveTextContent('false');

            fireEvent.click(screen.getByTestId('cancel-btn'));
            expect(screen.getByTestId('is-publish-disabled')).toHaveTextContent('true');
        });
    });

    describe('Dirty state', () => {
        it('should enable publish button when dirty', () => {
            render(<ReportsPanelContent />);

            expect(screen.getByTestId('is-publish-disabled')).toHaveTextContent('true');

            fireEvent.click(screen.getByTestId('ms-dirty-true'));
            expect(screen.getByTestId('is-publish-disabled')).toHaveTextContent('false');
        });

        it('should disable publish button when marked clean', () => {
            render(<ReportsPanelContent />);

            fireEvent.click(screen.getByTestId('ms-dirty-true'));
            expect(screen.getByTestId('is-publish-disabled')).toHaveTextContent('false');

            fireEvent.click(screen.getByTestId('ms-dirty-false'));
            expect(screen.getByTestId('is-publish-disabled')).toHaveTextContent('true');
        });
    });

    describe('Publish', () => {
        it('should reset dirty state after successful publish', async () => {
            render(<ReportsPanelContent />);

            fireEvent.click(screen.getByTestId('edit-btn'));
            fireEvent.click(screen.getByTestId('ms-dirty-true'));
            expect(screen.getByTestId('is-publish-disabled')).toHaveTextContent('false');

            fireEvent.click(screen.getByTestId('publish-btn'));

            await waitFor(() => {
                expect(screen.getByTestId('is-publish-disabled')).toHaveTextContent('true');
            });
        });

        it('should stay in editing mode when publish fails', async () => {
            mockSubmit.mockResolvedValue(false);

            render(<ReportsPanelContent />);

            fireEvent.click(screen.getByTestId('edit-btn'));

            fireEvent.click(screen.getByTestId('publish-btn'));

            await waitFor(() => {
                expect(screen.getByTestId('is-editing')).toHaveTextContent('true');
            });
        });
    });
});
