import { render, screen, fireEvent, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import { MembersList, MembersListProps } from './MembersList';
import { TeamCategory, TeamMember } from '../../../../../types/admin/TeamMembers';
import * as React from 'react';
import { TeamMembersApi } from '../../../../../services/data-fetch/admin-page-data-fetch/team-page-data-fetch/TeamMembersApi/TeamMembersApi';
import { TeamCategoriesApi } from '../../../../../services/data-fetch/admin-page-data-fetch/team-page-data-fetch/TeamCategoriesApi/TeamCategoriesApi';

const mockMembers = [] as TeamMember[];

const mockDataTransfer = {
    setDragImage: jest.fn(),
    setData: jest.fn(),
    getData: jest.fn(),
    clearData: jest.fn(),
    types: [],
};

jest.mock('../../../../../context/admin-context-provider/AdminContextProvider', () => ({
    useAdminContext: () => ({
        client: {
            get: jest.fn(),
            post: jest.fn(),
            put: jest.fn(),
            delete: jest.fn(),
        },
    }),
}));

jest.mock('../../../../../components/common/modal/Modal', () => {
    const Modal = ({ children, isOpen, onClose }: any) =>
        isOpen ? (
            <div
                data-testid="modal"
                onClick={onClose}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        onClose();
                    }
                }}
            >
                {children}
            </div>
        ) : null;

    Modal.Title = ({ children }: any) => <div data-testid="modal-title">{children}</div>;
    Modal.Content = ({ children }: any) => <div data-testid="modal-content">{children}</div>;
    Modal.Actions = ({ children }: any) => <div data-testid="modal-actions">{children}</div>;

    return {
        Modal,
    };
});

jest.mock('../member-drag-preview/MemberDragPreview', () => ({
    MemberDragPreview: ({ dragPreview }: any) =>
        dragPreview.visible ? <div data-testid="drag-preview">{dragPreview.member.fullName}</div> : null,
}));
jest.mock('../members-list-item/MembersListItem', () => ({
    MembersListItem: ({
        member,
        index,
        handleDragStart,
        handleDrag,
        handleDragEnd,
        handleDragOver,
        handleDrop,
        handleOnDeleteMember,
        handleOnEditMember,
        draggedIndex,
    }: any) => (
        <div
            data-testid={`member-item-${index}`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleDragStart(e as unknown as React.DragEvent, index);
                }
            }}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDrag={(e) => handleDrag(e)}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(index)}
        >
            <span>{member.fullName}</span>
            <span>{member.status}</span>
            <button data-testid={`delete-button-${index}`} onClick={() => handleOnDeleteMember(member.fullName)}>
                Delete
            </button>
            <button data-testid={`edit-button-${index}`} onClick={() => handleOnEditMember(member.id)}>
                Edit
            </button>
            {draggedIndex === index && <span data-testid="dragged-indicator">Dragged</span>}
        </div>
    ),
}));

jest.mock('../member-form/MemberForm', () => ({
    MemberForm: ({ onValuesChange, existingMemberFormValues, id, onSubmit }: any) => (
        <form data-testid="member-form" id={id} onSubmit={onSubmit}>
            <input
                data-testid="form-fullName"
                value={existingMemberFormValues?.fullName ?? ''}
                onChange={(e) => onValuesChange({ ...existingMemberFormValues, fullName: e.target.value })}
            />
            <input
                data-testid="form-description"
                value={existingMemberFormValues?.description ?? ''}
                onChange={(e) => onValuesChange({ ...existingMemberFormValues, description: e.target.value })}
            />
            <input
                data-testid="form-category"
                value={existingMemberFormValues?.category ?? ''}
                onChange={(e) => onValuesChange({ ...existingMemberFormValues, category: e.target.value })}
            />
        </form>
    ),
}));

jest.mock('../../../../../components/common/button/Button', () => ({
    Button: ({ children, onClick, style, form, type }: any) => (
        <button data-testid={`button-${style}${form ? '-' + form : ''}`} type={type ?? 'button'} onClick={onClick}>
            {children}
        </button>
    ),
}));

jest.mock('../../../../../assets/icons/not-found.svg', () => 'not-found-icon');
jest.mock('../../../../../assets/icons/load.svg', () => 'loader-icon');
jest.mock('../../../../../assets/icons/arrow-up.svg', () => 'arrow-up-icon');

const localStorageMock = (() => {
    let store: { [key: string]: string } = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => (store[key] = value),
        clear: () => (store = {}),
    };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

const sharedDefaultProps: MembersListProps = {
    searchByNameQuery: null,
    statusFilter: 'Усі',
    onAutocompleteValuesChange: jest.fn(),
};

let idCounter = 0;
const createMockMember = (overrides = {}): TeamMember => ({
    id: ++idCounter,
    img: 'https://randomuser.me/api/portraits/men/1.jpg',
    fullName: 'First First',
    description: 'Software Engineer',
    status: 'Опубліковано',
    category: {
        id: 1,
        name: 'Основна команда',
        description: 'Test',
    },
    ...overrides,
});

const resetMockMembers = (members: TeamMember[] = [createMockMember()]) => {
    const membersWithUniqueIds = members.map((member, index) => ({
        ...member,
        id: member.id || index + 1,
    }));
    mockMembers.length = 0;
    mockMembers.push(...membersWithUniqueIds);
};

describe('MembersList', () => {
    beforeAll(() => {
        Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
            configurable: true,
            get() {
                return 800;
            },
        });
    });
    beforeEach(() => {
        idCounter = 0;
        jest.clearAllMocks();
        localStorageMock.clear();
        resetMockMembers();

        jest.spyOn(TeamCategoriesApi, 'getAll').mockImplementation(() =>
            Promise.resolve([
                { id: 1, name: 'Основна команда', description: 'Test' },
                { id: 2, name: 'Наглядова рада', description: 'Test' },
                { id: 3, name: 'Радники', description: 'Test' },
            ]),
        );

        jest.spyOn(TeamMembersApi, 'getAll').mockResolvedValue(mockMembers);
        jest.spyOn(TeamMembersApi, 'updateDraft').mockResolvedValue(undefined);
        jest.spyOn(TeamMembersApi, 'updatePublish').mockResolvedValue(undefined);
        jest.spyOn(TeamMembersApi, 'delete').mockResolvedValue(undefined);
        jest.spyOn(TeamMembersApi, 'postDraft').mockResolvedValue(undefined);
        jest.spyOn(TeamMembersApi, 'postPublished').mockResolvedValue(undefined);
        jest.spyOn(TeamMembersApi, 'reorder').mockResolvedValue(undefined);
    });

    it('renders without crashing and sets default category from localStorage', async () => {
        const category = { id: 1, name: 'Основна команда', description: 'Test' } as TeamCategory;
        localStorageMock.setItem('currentTab', JSON.stringify(category));
        render(<MembersList {...sharedDefaultProps} />);
        await waitFor(() => {
            expect(screen.getByText('Основна команда')).toHaveClass('members-categories-selected');
        });
    });

    it('renders default category when localStorage is empty', async () => {
        render(<MembersList {...sharedDefaultProps} />);
        await waitFor(() => {
            expect(screen.getByText('Основна команда')).toHaveClass('members-categories-selected');
        });
    });

    it('displays not found message when no members are available', async () => {
        mockMembers.splice(0, mockMembers.length);
        render(<MembersList {...sharedDefaultProps} />);
        await waitFor(
            () => {
                expect(screen.getByText('Нічого не знайдено')).toBeInTheDocument();
                expect(screen.getByTestId('members-not-found-icon')).toHaveAttribute('src', 'not-found-icon');
            },
            { timeout: 3000 },
        );
    });

    it('shows loader when members are loading', async () => {
        jest.spyOn(TeamCategoriesApi, 'getAll').mockResolvedValue([
            { id: 1, name: 'Test Category', description: '123' },
        ]);

        jest.spyOn(TeamMembersApi, 'getAll').mockImplementation(
            () => new Promise((resolve) => setTimeout(() => resolve(mockMembers), 50)),
        );

        render(<MembersList {...sharedDefaultProps} />);

        await waitFor(() => {
            expect(screen.getByTestId('members-list-loader-icon')).toBeInTheDocument();
        });

        expect(screen.getByTestId('members-list-loader-icon')).toHaveAttribute('src', 'loader-icon');

        await waitFor(
            () => {
                expect(screen.queryByTestId('members-list-loader')).not.toBeInTheDocument();
            },
            { timeout: 200 },
        );
    });

    it('filters members by status', async () => {
        mockMembers.push(
            createMockMember({
                id: 2,
                img: 'https://randomuser.me/api/portraits/men/2.jpg',
                fullName: 'Second Second',
                description: 'Developer',
                status: 'Чернетка',
            }),
        );
        render(<MembersList {...sharedDefaultProps} statusFilter="Чернетка" />);
        await waitFor(
            () => {
                expect(screen.getByTestId('member-item-0')).toHaveTextContent('Second Second');
                expect(screen.queryByText('First First')).not.toBeInTheDocument();
            },
            { timeout: 3000 },
        );
    });

    it('updates autocomplete values based on search query', async () => {
        mockMembers.push(
            createMockMember({
                id: 2,
                img: 'https://randomuser.me/api/portraits/men/2.jpg',
                fullName: 'Second Second',
                description: 'Developer',
            }),
        );
        render(<MembersList {...sharedDefaultProps} searchByNameQuery="Sec" />);
        await waitFor(() => {
            expect(sharedDefaultProps.onAutocompleteValuesChange).toHaveBeenCalledWith(['Second Second']);
        });
    });

    it('disables category buttons when loading', async () => {
        jest.spyOn(TeamCategoriesApi, 'getAll').mockResolvedValue([
            { id: 1, name: 'Test Category 1', description: '123' },
            { id: 2, name: 'Test Category 2', description: '123' },
        ]);

        jest.spyOn(TeamMembersApi, 'getAll').mockImplementation(
            () => new Promise((resolve) => setTimeout(() => resolve(mockMembers), 50)),
        );

        render(<MembersList {...sharedDefaultProps} />);

        await waitFor(() => {
            expect(screen.getByTestId('members-categories')).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(screen.getByTestId('members-categories')).toHaveStyle('pointer-events: none');
        });

        await waitFor(
            () => {
                expect(screen.getByTestId('members-categories')).toHaveStyle('pointer-events: all');
            },
            { timeout: 200 },
        );
    });

    // TODO
    it('should reset dragPreview and draggedIndex state', async () => {
        render(<MembersList {...sharedDefaultProps} />);

        const dragItem = await screen.findByTestId('member-item-0');

        fireEvent.dragStart(dragItem, { dataTransfer: mockDataTransfer });

        expect(screen.getByTestId('drag-preview')).toBeInTheDocument();

        fireEvent.dragEnd(dragItem, { dataTransfer: mockDataTransfer });

        await waitFor(
            () => {
                expect(screen.queryByTestId('drag-preview')).not.toBeInTheDocument();
            },
            {
                timeout: 3000,
                interval: 100, // Check every 100ms
            },
        );

        expect(screen.queryByTestId('dragged-indicator')).not.toBeInTheDocument();
    });

    describe('MembersList - Category Switching', () => {
        beforeEach(() => {
            jest.clearAllMocks();
            localStorageMock.clear();
            resetMockMembers([
                createMockMember({
                    id: 1,
                    fullName: 'Main Team Member',
                    description: 'Software Engineer',
                }),
                createMockMember({
                    id: 2,
                    img: 'https://randomuser.me/api/portraits/women/1.jpg',
                    fullName: 'Board Member',
                    description: 'Director',
                    category: {
                        id: 2,
                        name: 'Наглядова рада',
                        description: 'Test',
                    },
                }),
                createMockMember({
                    id: 3,
                    img: 'https://randomuser.me/api/portraits/men/2.jpg',
                    fullName: 'Advisor Member',
                    description: 'Consultant',
                    category: {
                        id: 3,
                        name: 'Радники',
                        description: 'Test',
                    },
                }),
            ]);
        });

        it('saves selected category to localStorage', async () => {
            const category = { id: 2, name: 'Наглядова рада', description: 'Test' } as TeamCategory;
            render(<MembersList {...sharedDefaultProps} />);
            await screen.findByText('Наглядова рада');
            fireEvent.click(screen.getByText('Наглядова рада'));
            await waitFor(() => {
                expect(localStorageMock.getItem('currentTab')).toBe(JSON.stringify(category));
            });
        });
    });

    describe('MembersList - Scroll and Pagination', () => {
        beforeEach(() => {
            jest.clearAllMocks();
            localStorageMock.clear();
            const members = Array.from({ length: 10 }, (_, i) =>
                createMockMember({
                    id: i + 1,
                    img: `https://randomuser.me/api/portraits/men/${i + 1}.jpg`,
                    fullName: `Member ${i + 1}`,
                    description: `Description ${i + 1}`,
                }),
            );
            resetMockMembers(members);
        });

        // Helper for scrolled members list setup
        const setupScrolledMembersList = async () => {
            render(<MembersList {...sharedDefaultProps} />);
            await waitFor(() => {
                expect(screen.getByText('Member 1')).toBeInTheDocument();
            });
            const membersList = screen.getByTestId('members-list');
            Object.defineProperty(membersList, 'scrollTop', {
                writable: true,
                value: 100,
            });
            fireEvent.scroll(membersList);
            return membersList;
        };

        it('shows "move to top" button when scrolled down', async () => {
            await setupScrolledMembersList();
            expect(screen.getByTestId('members-list-list-to-top')).toBeInTheDocument();
        });

        it('scrolls to top when "move to top" button is clicked', async () => {
            const membersList = await setupScrolledMembersList();
            const moveToTopButton = screen.getByTestId('members-list-list-to-top');
            fireEvent.click(moveToTopButton);
            expect(membersList.scrollTop).toBe(0);
        });
    });

    describe('MembersList - Edit Member Modal', () => {
        const modalMember = createMockMember({
            id: 1,
            fullName: 'Test Member',
            description: 'Test Description',
        });
        beforeEach(() => {
            jest.clearAllMocks();
            localStorageMock.clear();
            resetMockMembers([modalMember]);
        });

        // Helper for edit modal with unsaved changes
        const setupEditModalWithUnsavedChanges = async () => {
            render(<MembersList {...sharedDefaultProps} />);
            await screen.findByText('Test Member');
            fireEvent.click(await screen.findByTestId('edit-button-0'));
            const nameInput = await screen.findByTestId('form-fullName');
            fireEvent.change(nameInput, { target: { value: 'Changed Name' } });
            const modal = await screen.findByTestId('modal');
            fireEvent.click(modal);
            return { modal };
        };

        it('opens edit modal when edit button is clicked', async () => {
            render(<MembersList {...sharedDefaultProps} />);

            await waitFor(() => {
                expect(screen.getByText('Test Member')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByTestId('edit-button-0'));

            expect(screen.getByText('Редагування учасника команди')).toBeInTheDocument();
            expect(screen.getByTestId('member-form')).toBeInTheDocument();
        });

        it('opens publish confirmation modal when form is submitted', async () => {
            render(<MembersList {...sharedDefaultProps} />);

            await waitFor(() => {
                expect(screen.getByText('Test Member')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByTestId('edit-button-0'));

            const form = screen.getByTestId('member-form');
            fireEvent.submit(form);

            expect(screen.getByText('Опублікувати нового члена команди?')).toBeInTheDocument();
        });

        it('publishes member when confirmation is accepted', async () => {
            render(<MembersList {...sharedDefaultProps} />);

            await waitFor(() => {
                expect(screen.getByText('Test Member')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByTestId('edit-button-0'));

            const nameInput = screen.getByTestId('form-fullName');
            fireEvent.change(nameInput, { target: { value: 'Published Name' } });

            const form = screen.getByTestId('member-form');
            fireEvent.submit(form);

            const confirmButton = screen.getByRole('button', { name: /Так/i });
            fireEvent.click(confirmButton);

            await waitFor(() => {
                expect(screen.queryByText('Редагування учасника команди')).not.toBeInTheDocument();
            });
        });

        it('cancels publish when confirmation is rejected', async () => {
            render(<MembersList {...sharedDefaultProps} />);

            await waitFor(() => {
                expect(screen.getByText('Test Member')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByTestId('edit-button-0'));

            const form = screen.getByTestId('member-form');
            fireEvent.submit(form);

            const cancelButton = screen.getByText('Ні');
            fireEvent.click(cancelButton);

            expect(screen.getByText('Редагування учасника команди')).toBeInTheDocument();
        });

        it('shows close confirmation when closing modal with unsaved changes', async () => {
            await setupEditModalWithUnsavedChanges();
            await waitFor(() => {
                expect(screen.getByText('Зміни буде втрачено. Бажаєте продовжити?')).toBeInTheDocument();
            });
        });

        it('confirms close when user accepts losing changes', async () => {
            await setupEditModalWithUnsavedChanges();
            const confirmCloseButton = await screen.findByRole('button', { name: /Так/i });
            fireEvent.click(confirmCloseButton);
            await waitFor(() => {
                expect(screen.queryByText('Редагування учасника команди')).not.toBeInTheDocument();
            });
        });

        it('closes edit modal when memberToEdit is null', async () => {
            render(<MembersList {...sharedDefaultProps} />);

            await waitFor(async () => {
                expect(await screen.findByText('Test Member')).toBeInTheDocument();
            });

            fireEvent.click(await screen.findByTestId('edit-button-0'));

            const nameInput = await screen.findByTestId('form-fullName');
            fireEvent.change(nameInput, { target: { value: '' } });
            const descInput = await screen.findByTestId('form-description');
            fireEvent.change(descInput, { target: { value: '' } });
            const catInput = await screen.findByTestId('form-category');
            fireEvent.change(catInput, { target: { value: '' } });

            fireEvent.click(await screen.findByTestId('modal'));
            expect(await screen.findByText('Зміни буде втрачено. Бажаєте продовжити?')).toBeInTheDocument();

            const confirmCloseButton = await screen.findByRole('button', { name: /Так/i });
            fireEvent.click(confirmCloseButton);

            await waitFor(() => {
                expect(screen.queryByText('Редагування учасника команди')).not.toBeInTheDocument();
            });
        });

        it('closes edit modal when memberToEdit is an empty object (all fields falsy)', async () => {
            resetMockMembers([createMockMember({ id: 1, fullName: 'Alpha', description: 'A' })]);
            render(<MembersList {...sharedDefaultProps} />);
            expect(await screen.findByText('Alpha')).toBeInTheDocument();
            fireEvent.click(await screen.findByTestId('edit-button-0'));

            fireEvent.change(await screen.findByTestId('form-fullName'), { target: { value: '' } });
            fireEvent.change(await screen.findByTestId('form-description'), { target: { value: '' } });
            fireEvent.change(await screen.findByTestId('form-category'), { target: { value: '' } });

            fireEvent.click(await screen.findByTestId('modal'));
            expect(await screen.findByText('Зміни буде втрачено. Бажаєте продовжити?')).toBeInTheDocument();

            const confirmCloseButton = await screen.findByRole('button', { name: /Так/i });
            fireEvent.click(confirmCloseButton);

            await waitFor(() => {
                expect(screen.queryByText('Редагування учасника команди')).not.toBeInTheDocument();
            });
        });
    });

    describe('MembersList - Search Functionality', () => {
        beforeEach(() => {
            jest.clearAllMocks();
            localStorageMock.clear();
            resetMockMembers([
                createMockMember({
                    id: 1,
                    fullName: 'John Doe',
                    description: 'Engineer',
                }),
                createMockMember({
                    id: 2,
                    img: 'https://randomuser.me/api/portraits/women/1.jpg',
                    fullName: 'Jane Smith',
                    description: 'Designer',
                }),
            ]);
        });

        it('filters members by search query', async () => {
            const { rerender } = render(<MembersList {...sharedDefaultProps} />);

            await waitFor(() => {
                expect(screen.getByText('John Doe')).toBeInTheDocument();
                expect(screen.getByText('Jane Smith')).toBeInTheDocument();
            });

            rerender(<MembersList {...sharedDefaultProps} searchByNameQuery="John" />);

            await waitFor(() => {
                expect(screen.getByText('John Doe')).toBeInTheDocument();
                expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
            });
        });

        it('calls onAutocompleteValuesChange with empty array when no search query', async () => {
            render(<MembersList {...sharedDefaultProps} />);

            await waitFor(() => {
                expect(sharedDefaultProps.onAutocompleteValuesChange).toHaveBeenCalledWith([]);
            });
        });
    });

    describe('MembersList - Drag Events', () => {
        beforeEach(() => {
            jest.clearAllMocks();
            localStorageMock.clear();
            resetMockMembers([
                createMockMember({
                    id: 1,
                    fullName: 'Test Member',
                    description: 'Test Description',
                }),
            ]);
        });

        it('handles drag with zero coordinates', async () => {
            render(<MembersList {...sharedDefaultProps} />);

            await waitFor(() => {
                expect(screen.getByText('Test Member')).toBeInTheDocument();
            });

            const dragItem = screen.getByTestId('member-item-0');

            fireEvent.dragStart(dragItem, { clientX: 100, clientY: 100, dataTransfer: mockDataTransfer });

            fireEvent.drag(dragItem, { clientX: 0, clientY: 0, dataTransfer: mockDataTransfer });

            expect(screen.getByTestId('drag-preview')).toBeInTheDocument();
        });

        it('does not reorder when dropping on same index', async () => {
            mockMembers.push(
                createMockMember({
                    id: 2,
                    img: 'https://randomuser.me/api/portraits/men/2.jpg',
                    fullName: 'Second Member',
                    description: 'Second Description',
                }),
            );

            render(<MembersList {...sharedDefaultProps} />);

            await waitFor(async () => {
                expect(await screen.findByText('Test Member')).toBeInTheDocument();
                expect(await screen.findByText('Second Member')).toBeInTheDocument();
            });

            const dragItem = await screen.findByTestId('member-item-0');

            fireEvent.dragStart(dragItem, { clientX: 100, clientY: 100, dataTransfer: mockDataTransfer });
            fireEvent.drop(dragItem, { dataTransfer: mockDataTransfer });

            expect(await screen.findByTestId('member-item-0')).toHaveTextContent('Test Member');
            expect(await screen.findByTestId('member-item-1')).toHaveTextContent('Second Member');
        });

        it('tracks mouse movement during drag', async () => {
            render(<MembersList {...sharedDefaultProps} />);

            await waitFor(() => {
                expect(screen.getByText('Test Member')).toBeInTheDocument();
            });

            const dragItem = screen.getByTestId('member-item-0');

            fireEvent.dragStart(dragItem, { clientX: 100, clientY: 100, dataTransfer: mockDataTransfer });

            fireEvent.mouseMove(document, { clientX: 200, clientY: 200 });

            expect(screen.getByTestId('drag-preview')).toBeInTheDocument();
        });
    });

    describe('MembersList - Internal Functions and Edge Cases', () => {
        beforeEach(() => {
            jest.clearAllMocks();
            localStorageMock.clear();
            resetMockMembers([
                createMockMember({ id: 1, fullName: 'Alpha', description: 'A' }),
                createMockMember({ id: 2, fullName: 'Beta', description: 'B' }),
                createMockMember({ id: 3, fullName: 'Gamma', description: 'C' }),
            ]);
        });

        it('appends members on scroll to bottom (pagination)', async () => {
            // Simulate more members for pagination
            for (let i = 4; i <= 12; i++) {
                mockMembers.push(createMockMember({ id: i, fullName: `Member ${i}` }));
            }
            render(<MembersList {...sharedDefaultProps} />);
            await waitFor(async () => expect(await screen.findByText('Alpha')).toBeInTheDocument());
            const membersList = screen.getByTestId('members-list');
            Object.defineProperty(membersList, 'scrollTop', { writable: true, value: 1000 });
            Object.defineProperty(membersList, 'scrollHeight', { writable: true, value: 1000 });
            Object.defineProperty(membersList, 'clientHeight', { writable: true, value: 1 });
            fireEvent.scroll(membersList);

            await waitFor(async () => expect(await screen.findByText('Member 6')).toBeInTheDocument());
        });

        it('resets members when search query is cleared', async () => {
            const { rerender } = render(<MembersList {...sharedDefaultProps} searchByNameQuery={'Alpha'} />);
            await waitFor(async () => expect(await screen.findByText('Alpha')).toBeInTheDocument());
            rerender(<MembersList {...sharedDefaultProps} searchByNameQuery={null} />);
            await waitFor(async () => expect(await screen.findByText('Beta')).toBeInTheDocument());
        });

        it('persists and restores selected category from localStorage', async () => {
            localStorageMock.setItem(
                'currentTab',
                JSON.stringify({
                    id: 3,
                    name: 'Радники',
                    description: 'Test',
                } as TeamCategory),
            );
            render(<MembersList {...sharedDefaultProps} />);
            await waitFor(async () =>
                expect(await screen.findByText('Радники')).toHaveClass('members-categories-selected'),
            );
        });

        it('does not reorder members if dropped on same index', async () => {
            render(<MembersList {...sharedDefaultProps} />);
            await waitFor(async () => expect(await screen.findByText('Alpha')).toBeInTheDocument());
            const dragItem = await screen.findByTestId('member-item-0');
            fireEvent.dragStart(dragItem, { clientX: 100, clientY: 100, dataTransfer: mockDataTransfer });
            fireEvent.drop(dragItem, { dataTransfer: mockDataTransfer });
            expect(await screen.findByTestId('member-item-0')).toHaveTextContent('Alpha');
        });

        it('opens and closes delete modal, and deletes member', async () => {
            render(<MembersList {...sharedDefaultProps} />);
            await waitFor(async () => expect(await screen.findByText('Alpha')).toBeInTheDocument());
            fireEvent.click(screen.getByTestId('delete-button-0'));
            expect(screen.getByText('Видалити члена команди?')).toBeInTheDocument();
            const confirmButton = screen.getByRole('button', { name: /Так/i });
            fireEvent.click(confirmButton);
            await waitFor(() => expect(screen.queryByText('Alpha')).not.toBeInTheDocument());
        });

        it('cancels delete modal', async () => {
            render(<MembersList {...sharedDefaultProps} />);
            expect(await screen.findByText('Alpha')).toBeInTheDocument();
            fireEvent.click(await screen.findByTestId('delete-button-0'));
            expect(await screen.findByText('Видалити члена команди?')).toBeInTheDocument();
            fireEvent.click(await screen.findByRole('button', { name: /Ні/i }));
            expect(await screen.findByText('Alpha')).toBeInTheDocument();
        });

        it('saves member as draft from edit modal', async () => {
            jest.spyOn(TeamMembersApi, 'updateDraft').mockImplementation(async () => {
                jest.spyOn(TeamMembersApi, 'getAll').mockResolvedValueOnce([
                    {
                        id: 1,
                        fullName: 'Alpha',
                        category: {
                            id: 1,
                            name: 'Основна команда',
                            description: 'Test',
                        },
                        description: '',
                        status: 'Чернетка',
                        img: '',
                    },
                ]);
            });
            render(<MembersList {...sharedDefaultProps} />);
            await waitFor(async () => expect(await screen.findByText('Alpha')).toBeInTheDocument());
            fireEvent.click(screen.getByTestId('edit-button-0'));
            const draftButton = screen.getByRole('button', { name: /Зберегти як чернетку/i });
            fireEvent.click(draftButton);
            await waitFor(() => expect(TeamMembersApi.updateDraft).toHaveBeenCalled());
            await waitFor(() => expect(screen.getByTestId('member-item-0')).toHaveTextContent('Чернетка'));
        });

        it('cancels publish confirmation and keeps edit modal open', async () => {
            render(<MembersList {...sharedDefaultProps} />);
            await waitFor(async () => expect(await screen.findByText('Alpha')).toBeInTheDocument());
            fireEvent.click(screen.getByTestId('edit-button-0'));
            const form = screen.getByTestId('member-form');
            fireEvent.submit(form);
            expect(screen.getByText('Опублікувати нового члена команди?')).toBeInTheDocument();
            const cancelButton = screen.getByText('Ні');
            fireEvent.click(cancelButton);
            expect(screen.getByText('Редагування учасника команди')).toBeInTheDocument();
        });

        it('shows and hides move-to-top button correctly', async () => {
            render(<MembersList {...sharedDefaultProps} />);
            await waitFor(async () => expect(await screen.findByText('Alpha')).toBeInTheDocument());
            const membersList = await screen.findByTestId('members-list');
            Object.defineProperty(membersList, 'scrollTop', { writable: true, value: 100 });
            fireEvent.scroll(membersList);
            expect(await screen.findByTestId('members-list-list-to-top')).toBeInTheDocument();
            Object.defineProperty(membersList, 'scrollTop', { writable: true, value: 0 });
            fireEvent.scroll(membersList);
            await waitFor(() => {
                expect(screen.queryByTestId('members-list-list-to-top')).not.toBeInTheDocument();
            });
        });

        it('handles empty mockMembers array gracefully', async () => {
            resetMockMembers([]);
            render(<MembersList {...sharedDefaultProps} />);
            await waitFor(async () => expect(await screen.findByText('Нічого не знайдено')).toBeInTheDocument());
        });

        it('handles rapid category switching', async () => {
            render(<MembersList {...sharedDefaultProps} />);
            await waitFor(async () => expect(await screen.findByText('Alpha')).toBeInTheDocument());
            fireEvent.click(screen.getByText('Наглядова рада'));
            fireEvent.click(screen.getByText('Радники'));
            fireEvent.click(screen.getByText('Основна команда'));
            await waitFor(async () => expect(await screen.findByText('Alpha')).toBeInTheDocument());
        });

        it('handles rapid search input changes', async () => {
            const { rerender } = render(<MembersList {...sharedDefaultProps} />);
            await waitFor(async () => expect(await screen.findByText('Alpha')).toBeInTheDocument());
            rerender(<MembersList {...sharedDefaultProps} searchByNameQuery={'Bet'} />);
            await waitFor(async () => expect(await screen.findByText('Beta')).toBeInTheDocument());
            rerender(<MembersList {...sharedDefaultProps} searchByNameQuery={''} />);
            await waitFor(async () => expect(await screen.findByText('Alpha')).toBeInTheDocument());
        });
    });
});
