import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {MembersList, MembersListProps, Member, mockMembers} from './MembersList';
import * as React from 'react';

const mockDataTransfer = {
    setDragImage: jest.fn(),
    setData: jest.fn(),
    getData: jest.fn(),
    clearData: jest.fn(),
    types: [],
};

jest.mock('../../../../../components/common/modal/Modal', () => {
    const Modal = ({ children, isOpen, onClose }: any) =>
        isOpen ? (
            <div data-testid="modal" onClick={onClose}>
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
    MemberDragPreview: ({dragPreview}: any) => (
        dragPreview.visible ? <div data-testid="drag-preview">{dragPreview.member.fullName}</div> : null
    ),
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
                          draggedIndex
                      }: any) => (
        <div
            data-testid={`member-item-${index}`}
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
    MemberForm: ({onValuesChange, existingMemberFormValues, id, onSubmit}: any) => (
        <form data-testid="member-form" id={id} onSubmit={onSubmit}>
            <input
                data-testid="form-fullName"
                value={existingMemberFormValues?.fullName || ''}
                onChange={(e) => onValuesChange({...existingMemberFormValues, fullName: e.target.value})}
            />
            <input
                data-testid="form-description"
                value={existingMemberFormValues?.description || ''}
                onChange={(e) => onValuesChange({...existingMemberFormValues, description: e.target.value})}
            />
            <input
                data-testid="form-category"
                value={existingMemberFormValues?.category || ''}
                onChange={(e) => onValuesChange({...existingMemberFormValues, category: e.target.value})}
            />
        </form>
    ),
}));

jest.mock('../../../../../components/common/button/Button', () => ({
    Button: ({children, onClick, style, form, type}: any) => (
        <button data-testid={`button-${style}${form ? '-' + form : ''}`} type={type || 'button'} onClick={onClick}>
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
Object.defineProperty(window, 'localStorage', {value: localStorageMock});

describe('MembersList', () => {
    const defaultProps: MembersListProps = {
        searchByNameQuery: null,
        statusFilter: 'Усі',
        onAutocompleteValuesChange: jest.fn(),
    };

    const mockMember: Member = {
        id: 1,
        img: 'https://randomuser.me/api/portraits/men/1.jpg',
        fullName: 'First First',
        description: 'Software Engineer',
        status: 'Опубліковано',
        category: 'Основна команда',
    };

    let mockFetchMembers: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        localStorageMock.clear();
        const resetMockMembers = () => {
            mockMembers.length = 0;
            mockMembers.push(...[mockMember]);
        };
        resetMockMembers();
        mockFetchMembers = jest.spyOn(require('./MembersList'), 'fetchMembers');
        mockFetchMembers.mockImplementation(async (category: string, pageSize: number, pageNumber: number) => {
            const filtered = mockMembers.filter((m) => m.category === category);
            const start = (pageNumber - 1) * pageSize;
            return {
                newMembers: filtered.slice(start, start + pageSize),
                totalCountOfPages: Math.ceil(filtered.length / pageSize),
            };
        });
    });

    it('renders without crashing and sets default category from localStorage', async () => {
        localStorageMock.setItem('currentTab', 'Наглядова рада');
        render(<MembersList {...defaultProps} />);
        await waitFor(() => {
            expect(screen.getByText('Наглядова рада')).toHaveClass('members-categories-selected');
        });
    });

    it('renders default category when localStorage is empty', async () => {
        render(<MembersList {...defaultProps} />);
        await waitFor(() => {
            expect(screen.getByText('Основна команда')).toHaveClass('members-categories-selected');
        });
    });

    it('displays not found message when no members are available', async () => {
        mockMembers.splice(0, mockMembers.length);
        render(<MembersList {...defaultProps} />);
        await waitFor(() => {
            expect(screen.getByText('Нічого не знайдено')).toBeInTheDocument();
            expect(screen.getByTestId('members-not-found-icon')).toHaveAttribute("src", "not-found-icon");
        }, {timeout: 3000});
    });

    it('shows loader when members are loading', async () => {
        mockFetchMembers.mockImplementation(
            () => new Promise((resolve) => setTimeout(() => resolve({newMembers: [], totalCountOfPages: 0}), 1000))
        );
        render(<MembersList {...defaultProps} />);
        expect(screen.getByTestId('members-list-loader-icon')).toHaveAttribute("src", "loader-icon");
        await waitFor(() => {
            expect(screen.queryByTestId('members-list-loader')).not.toBeInTheDocument();
        });
    });

    it('filters members by status', async () => {
        mockMembers.push({
            id: 2,
            img: 'https://randomuser.me/api/portraits/men/2.jpg',
            fullName: 'Second Second',
            description: 'Developer',
            status: 'Чернетка',
            category: 'Основна команда',
        });
        render(<MembersList {...defaultProps} statusFilter="Чернетка"/>);
        await waitFor(() => {
            expect(screen.getByTestId('member-item-0')).toHaveTextContent('Second Second');
            expect(screen.queryByText('First First')).not.toBeInTheDocument();
        }, {timeout: 3000});
    });

    it('handles drag and drop to reorder members', async () => {
        mockMembers.push({
            id: 2,
            img: 'https://randomuser.me/api/portraits/men/2.jpg',
            fullName: 'Second Second',
            description: 'Developer',
            status: 'Опубліковано',
            category: 'Основна команда',
        });
        render(<MembersList {...defaultProps} />);
        await waitFor(() => {
            expect(screen.getByTestId('member-item-0')).toHaveTextContent('First First');
            expect(screen.getByTestId('member-item-1')).toHaveTextContent('Second Second');
        }, {timeout: 3000});

        const item0 = screen.getByTestId('member-item-0');
        const item1 = screen.getByTestId('member-item-1');

        fireEvent.dragStart(item0, {clientX: 100, clientY: 100, dataTransfer: mockDataTransfer});
        expect(screen.getByTestId('drag-preview')).toHaveTextContent('First First');
        expect(screen.getByTestId('dragged-indicator')).toBeInTheDocument();

        fireEvent.drag(item0, {clientX: 150, clientY: 150, dataTransfer: mockDataTransfer});
        fireEvent.dragOver(item1, {dataTransfer: mockDataTransfer});
        fireEvent.drop(item1, {dataTransfer: mockDataTransfer});

        await waitFor(() => {
            expect(screen.getByTestId('member-item-0')).toHaveTextContent('Second Second');
            expect(screen.getByTestId('member-item-1')).toHaveTextContent('First First');
        });
    });

    it('updates autocomplete values based on search query', async () => {
        mockMembers.push({
            id: 2,
            img: 'https://randomuser.me/api/portraits/men/2.jpg',
            fullName: 'Second Second',
            description: 'Developer',
            status: 'Опубліковано',
            category: 'Основна команда',
        });
        render(<MembersList {...defaultProps} searchByNameQuery="Sec"/>);
        await waitFor(() => {
            expect(defaultProps.onAutocompleteValuesChange).toHaveBeenCalledWith(['Second Second']);
        });
    });

    it('disables category buttons when loading', async () => {
        mockFetchMembers.mockImplementation(
            () => new Promise((resolve) => setTimeout(() => resolve({newMembers: [], totalCountOfPages: 0}), 1000))
        );
        render(<MembersList {...defaultProps} />);
        expect(screen.getByTestId('members-categories')).toHaveStyle({pointerEvents: 'none'});
        await waitFor(() => {
            expect(screen.getByTestId('members-categories')).toHaveStyle({pointerEvents: 'all'});
        });
    });

    it('should reset dragPreview and draggedIndex state', async () => {
        render(<MembersList {...defaultProps} />);

        const dragItem = await screen.findByTestId('member-item-0');

        fireEvent.dragStart(dragItem, { dataTransfer: mockDataTransfer });
        fireEvent.dragEnd(dragItem);

        await waitFor(() => {
            expect(screen.queryByTestId('drag-preview')).not.toBeInTheDocument();
        });
    });

    // Additional tests to cover uncovered code paths

    describe('MembersList - Category Switching', () => {
        const defaultProps: MembersListProps = {
            searchByNameQuery: null,
            statusFilter: 'Усі',
            onAutocompleteValuesChange: jest.fn(),
        };

        beforeEach(() => {
            jest.clearAllMocks();
            localStorageMock.clear();
            mockMembers.length = 0;
            mockMembers.push(
                {
                    id: 1,
                    img: 'https://randomuser.me/api/portraits/men/1.jpg',
                    fullName: 'Main Team Member',
                    description: 'Software Engineer',
                    status: 'Опубліковано',
                    category: 'Основна команда',
                },
                {
                    id: 2,
                    img: 'https://randomuser.me/api/portraits/women/1.jpg',
                    fullName: 'Board Member',
                    description: 'Director',
                    status: 'Опубліковано',
                    category: 'Наглядова рада',
                },
                {
                    id: 3,
                    img: 'https://randomuser.me/api/portraits/men/2.jpg',
                    fullName: 'Advisor Member',
                    description: 'Consultant',
                    status: 'Опубліковано',
                    category: 'Радники',
                }
            );
        });




        it('saves selected category to localStorage', async () => {
            render(<MembersList {...defaultProps} />);

            fireEvent.click(screen.getByText('Наглядова рада'));

            expect(localStorageMock.getItem('currentTab')).toBe('Наглядова рада');
        });
    });

    describe('MembersList - Scroll and Pagination', () => {
        const defaultProps: MembersListProps = {
            searchByNameQuery: null,
            statusFilter: 'Усі',
            onAutocompleteValuesChange: jest.fn(),
        };

        beforeEach(() => {
            jest.clearAllMocks();
            localStorageMock.clear();
            mockMembers.length = 0;
            // Add 10 members to test pagination
            for (let i = 1; i <= 10; i++) {
                mockMembers.push({
                    id: i,
                    img: `https://randomuser.me/api/portraits/men/${i}.jpg`,
                    fullName: `Member ${i}`,
                    description: `Description ${i}`,
                    status: 'Опубліковано',
                    category: 'Основна команда',
                });
            }
        });

        it('shows "move to top" button when scrolled down', async () => {
            render(<MembersList {...defaultProps} />);

            await waitFor(() => {
                expect(screen.getByText('Member 1')).toBeInTheDocument();
            });

            const membersList = screen.getByTestId('members-list');

            // Mock scrollTop to simulate scrolling
            Object.defineProperty(membersList, 'scrollTop', {
                writable: true,
                value: 100,
            });

            fireEvent.scroll(membersList);

            expect(screen.getByTestId('members-list-list-to-top')).toBeInTheDocument();
        });

        it('hides "move to top" button when at top', async () => {
            render(<MembersList {...defaultProps} />);

            await waitFor(() => {
                expect(screen.getByText('Member 1')).toBeInTheDocument();
            });

            const membersList = screen.getByTestId('members-list');

            // First scroll down
            Object.defineProperty(membersList, 'scrollTop', {
                writable: true,
                value: 100,
            });
            fireEvent.scroll(membersList);

            // Then scroll back to top
            Object.defineProperty(membersList, 'scrollTop', {
                writable: true,
                value: 0,
            });
            fireEvent.scroll(membersList);

            expect(screen.queryByTestId('members-list-list-to-top')).not.toBeInTheDocument();
        });

        it('scrolls to top when "move to top" button is clicked', async () => {
            render(<MembersList {...defaultProps} />);

            await waitFor(() => {
                expect(screen.getByText('Member 1')).toBeInTheDocument();
            });

            const membersList = screen.getByTestId('members-list');

            Object.defineProperty(membersList, 'scrollTop', {
                writable: true,
                value: 100,
            });

            fireEvent.scroll(membersList);

            const moveToTopButton = screen.getByTestId('members-list-list-to-top');
            fireEvent.click(moveToTopButton);

            expect(membersList.scrollTop).toBe(0);
        });
    });

    describe('MembersList - Edit Member Modal', () => {
        const defaultProps: MembersListProps = {
            searchByNameQuery: null,
            statusFilter: 'Усі',
            onAutocompleteValuesChange: jest.fn(),
        };

        const mockMember: Member = {
            id: 1,
            img: 'https://randomuser.me/api/portraits/men/1.jpg',
            fullName: 'Test Member',
            description: 'Test Description',
            status: 'Опубліковано',
            category: 'Основна команда',
        };

        beforeEach(() => {
            jest.clearAllMocks();
            localStorageMock.clear();
            mockMembers.length = 0;
            mockMembers.push(mockMember);
        });

        it('opens edit modal when edit button is clicked', async () => {
            render(<MembersList {...defaultProps} />);

            await waitFor(() => {
                expect(screen.getByText('Test Member')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByTestId('edit-button-0'));

            expect(screen.getByText('Редагування учасника команди')).toBeInTheDocument();
            expect(screen.getByTestId('member-form')).toBeInTheDocument();
        });

        it('opens publish confirmation modal when form is submitted', async () => {
            render(<MembersList {...defaultProps} />);

            await waitFor(() => {
                expect(screen.getByText('Test Member')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByTestId('edit-button-0'));

            const form = screen.getByTestId('member-form');
            fireEvent.submit(form);

            expect(screen.getByText('Опублікувати нового члена команди?')).toBeInTheDocument();
        });

        it('publishes member when confirmation is accepted', async () => {
            render(<MembersList {...defaultProps} />);

            await waitFor(() => {
                expect(screen.getByText('Test Member')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByTestId('edit-button-0'));

            // Modify form
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
            render(<MembersList {...defaultProps} />);

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
            render(<MembersList {...defaultProps} />);

            await waitFor(() => {
                expect(screen.getByText('Test Member')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByTestId('edit-button-0'));

            // Make changes
            const nameInput = screen.getByTestId('form-fullName');
            fireEvent.change(nameInput, { target: { value: 'Changed Name' } });

            // Try to close modal (simulate onClose)
            const modal = screen.getByTestId('modal');
            fireEvent.click(modal);

            expect(screen.getByText('Зміни буде втрачено. Бажаєте продовжити?')).toBeInTheDocument();
        });

        it('closes modal directly when no changes are made', async () => {
            render(<MembersList {...defaultProps} />);

            await waitFor(() => {
                expect(screen.getByText('Test Member')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByTestId('edit-button-0'));

            // Close modal without changes
            const modal = screen.getByTestId('modal');
            fireEvent.click(modal);

            await waitFor(() => {
                expect(screen.queryByText('Редагування учасника команди')).not.toBeInTheDocument();
            });
        });

        it('confirms close when user accepts losing changes', async () => {
            render(<MembersList {...defaultProps} />);

            await waitFor(() => {
                expect(screen.getByText('Test Member')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByTestId('edit-button-0'));

            // Make changes
            const nameInput = screen.getByTestId('form-fullName');
            fireEvent.change(nameInput, { target: { value: 'Changed Name' } });

            // Try to close modal
            const modal = screen.getByTestId('modal');
            fireEvent.click(modal);

            // Confirm close
            const confirmCloseButton = screen.getByRole('button', { name: /Так/i });
            fireEvent.click(confirmCloseButton);

            await waitFor(() => {
                expect(screen.queryByText('Редагування учасника команди')).not.toBeInTheDocument();
            });
        });
    });

    describe('MembersList - Search Functionality', () => {
        const defaultProps: MembersListProps = {
            searchByNameQuery: null,
            statusFilter: 'Усі',
            onAutocompleteValuesChange: jest.fn(),
        };

        beforeEach(() => {
            jest.clearAllMocks();
            localStorageMock.clear();
            mockMembers.length = 0;
            mockMembers.push(
                {
                    id: 1,
                    img: 'https://randomuser.me/api/portraits/men/1.jpg',
                    fullName: 'John Doe',
                    description: 'Engineer',
                    status: 'Опубліковано',
                    category: 'Основна команда',
                },
                {
                    id: 2,
                    img: 'https://randomuser.me/api/portraits/women/1.jpg',
                    fullName: 'Jane Smith',
                    description: 'Designer',
                    status: 'Опубліковано',
                    category: 'Основна команда',
                }
            );
        });

        it('filters members by search query', async () => {
            const { rerender } = render(<MembersList {...defaultProps} />);

            await waitFor(() => {
                expect(screen.getByText('John Doe')).toBeInTheDocument();
                expect(screen.getByText('Jane Smith')).toBeInTheDocument();
            });

            rerender(<MembersList {...defaultProps} searchByNameQuery="John" />);

            await waitFor(() => {
                expect(screen.getByText('John Doe')).toBeInTheDocument();
                expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
            });
        });

        it('calls onAutocompleteValuesChange with empty array when no search query', async () => {
            render(<MembersList {...defaultProps} />);

            await waitFor(() => {
                expect(defaultProps.onAutocompleteValuesChange).toHaveBeenCalledWith([]);
            });
        });
    });

    describe('MembersList - Drag Events', () => {
        const defaultProps: MembersListProps = {
            searchByNameQuery: null,
            statusFilter: 'Усі',
            onAutocompleteValuesChange: jest.fn(),
        };

        beforeEach(() => {
            jest.clearAllMocks();
            localStorageMock.clear();
            mockMembers.length = 0;
            mockMembers.push({
                id: 1,
                img: 'https://randomuser.me/api/portraits/men/1.jpg',
                fullName: 'Test Member',
                description: 'Test Description',
                status: 'Опубліковано',
                category: 'Основна команда',
            });
        });

        it('handles drag with zero coordinates', async () => {
            render(<MembersList {...defaultProps} />);

            await waitFor(() => {
                expect(screen.getByText('Test Member')).toBeInTheDocument();
            });

            const dragItem = screen.getByTestId('member-item-0');

            fireEvent.dragStart(dragItem, { clientX: 100, clientY: 100, dataTransfer: mockDataTransfer });

            // Drag with zero coordinates (should not update preview position)
            fireEvent.drag(dragItem, { clientX: 0, clientY: 0, dataTransfer: mockDataTransfer });

            expect(screen.getByTestId('drag-preview')).toBeInTheDocument();
        });

        it('does not reorder when dropping on same index', async () => {
            mockMembers.push({
                id: 2,
                img: 'https://randomuser.me/api/portraits/men/2.jpg',
                fullName: 'Second Member',
                description: 'Second Description',
                status: 'Опубліковано',
                category: 'Основна команда',
            });

            render(<MembersList {...defaultProps} />);

            await waitFor(() => {
                expect(screen.getByText('Test Member')).toBeInTheDocument();
                expect(screen.getByText('Second Member')).toBeInTheDocument();
            });

            const dragItem = screen.getByTestId('member-item-0');

            fireEvent.dragStart(dragItem, { clientX: 100, clientY: 100, dataTransfer: mockDataTransfer });
            fireEvent.drop(dragItem, { dataTransfer: mockDataTransfer });

            // Order should remain the same
            expect(screen.getByTestId('member-item-0')).toHaveTextContent('Test Member');
            expect(screen.getByTestId('member-item-1')).toHaveTextContent('Second Member');
        });

        it('tracks mouse movement during drag', async () => {
            render(<MembersList {...defaultProps} />);

            await waitFor(() => {
                expect(screen.getByText('Test Member')).toBeInTheDocument();
            });

            const dragItem = screen.getByTestId('member-item-0');

            fireEvent.dragStart(dragItem, { clientX: 100, clientY: 100, dataTransfer: mockDataTransfer });

            // Simulate mouse move
            fireEvent.mouseMove(document, { clientX: 200, clientY: 200 });

            expect(screen.getByTestId('drag-preview')).toBeInTheDocument();
        });
    });

});


