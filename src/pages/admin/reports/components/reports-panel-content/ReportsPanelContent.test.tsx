import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ReportsPanelContent } from './ReportsPanelContent';

const mockSubmit = jest.fn();

jest.mock('../reports-page-toolbar/ReportsPageToolbar', () => {
    const actual = jest.requireActual('../reports-page-toolbar/ReportsPageToolbar');
    return {
        ...actual,
        ReportsPageToolbar: (props: any) => (
            <div data-testid="mock-toolbar">
                <span data-testid="selected-tab-id">{props.selectedTab.id}</span>
            </div>
        ),
    };
});

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
                    <span data-testid="ms-publish-disabled">{props.isPublishDisabled ? 'true' : 'false'}</span>
                    <span data-testid="ms-cancel-disabled">{props.isCancelDisabled ? 'true' : 'false'}</span>
                    <button data-testid="ms-dirty-true" onClick={() => props.onDirtyChange(true)}>
                        Mark dirty
                    </button>
                    <button data-testid="ms-dirty-false" onClick={() => props.onDirtyChange(false)}>
                        Mark clean
                    </button>
                    <button data-testid="ms-cancel" onClick={props.onCancel}>
                        Cancel
                    </button>
                    <button data-testid="ms-publish" onClick={props.onPublish}>
                        Publish
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

const clickMsCancel = () => fireEvent.click(screen.getByTestId('ms-cancel'));
const clickMsPublish = () => fireEvent.click(screen.getByTestId('ms-publish'));
const markDirty = () => fireEvent.click(screen.getByTestId('ms-dirty-true'));
const markClean = () => fireEvent.click(screen.getByTestId('ms-dirty-false'));

const expectMsEditing = (value: boolean) =>
    expect(screen.getByTestId('ms-is-editing')).toHaveTextContent(String(value));
const expectPublishDisabled = (value: boolean) =>
    expect(screen.getByTestId('ms-publish-disabled')).toHaveTextContent(String(value));
const expectCancelDisabled = (value: boolean) =>
    expect(screen.getByTestId('ms-cancel-disabled')).toHaveTextContent(String(value));
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

        it('should start in editing mode', () => {
            renderComponent();

            expectMsEditing(true);
        });

        it('should start with publish and cancel buttons disabled (not dirty)', () => {
            renderComponent();

            expectPublishDisabled(true);
            expectCancelDisabled(true);
        });

        it('should start with resetCounter at 0', () => {
            renderComponent();

            expectResetCounter(0);
        });
    });

    describe('Cancel', () => {
        it('should increment resetCounter when Cancel is clicked', () => {
            renderComponent();

            expectResetCounter(0);

            clickMsCancel();
            expectResetCounter(1);

            clickMsCancel();
            expectResetCounter(2);
        });

        it('should reset dirty state when Cancel is clicked', () => {
            renderComponent();

            markDirty();
            expectPublishDisabled(false);
            expectCancelDisabled(false);

            clickMsCancel();
            expectPublishDisabled(true);
            expectCancelDisabled(true);
        });
    });

    describe('Dirty state', () => {
        it('should enable publish and cancel buttons when dirty', () => {
            renderComponent();

            expectPublishDisabled(true);
            expectCancelDisabled(true);

            markDirty();
            expectPublishDisabled(false);
            expectCancelDisabled(false);
        });

        it('should disable publish and cancel buttons when marked clean', () => {
            renderComponent();

            markDirty();
            expectPublishDisabled(false);
            expectCancelDisabled(false);

            markClean();
            expectPublishDisabled(true);
            expectCancelDisabled(true);
        });
    });

    describe('Publish', () => {
        it('should reset dirty state after successful publish', async () => {
            renderComponent();

            markDirty();
            expectPublishDisabled(false);
            expectCancelDisabled(false);

            clickMsPublish();

            await waitFor(() => {
                expectPublishDisabled(true);
                expectCancelDisabled(true);
            });
        });

        it('should keep dirty state when publish fails', async () => {
            mockSubmit.mockResolvedValue(false);
            renderComponent();

            markDirty();
            clickMsPublish();

            await waitFor(() => {
                expectPublishDisabled(false);
                expectCancelDisabled(false);
            });
        });
    });
});
