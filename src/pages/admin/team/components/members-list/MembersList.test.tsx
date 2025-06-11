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

// Mock dependencies
jest.mock('../../../../../components/common/modal/Modal', () => ({
    Modal: ({children, isOpen, onClose}: any) => (
        isOpen ? (
            <div data-testid="modal" onClick={onClose}>
                {children}
            </div>
        ) : null
    ),
    'Modal.Title': ({children}: any) => <div data-testid="modal-title">{children}</div>,
    'Modal.Content': ({children}: any) => <div data-testid="modal-content">{children}</div>,
    'Modal.Actions': ({children}: any) => <div data-testid="modal-actions">{children}</div>
}));

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
            {member.fullName}
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

// Mock icons
jest.mock('../../../../../assets/icons/not-found.svg', () => 'not-found-icon');
jest.mock('../../../../../assets/icons/load.svg', () => 'loader-icon');
jest.mock('../../../../../assets/icons/arrow-up.svg', () => 'arrow-up-icon');

// Mock localStorage
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

    let mockFetchMembers: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        localStorageMock.clear();
        mockMembers.splice(0, mockMembers.length, ...[mockMember]);
        // @ts-ignore
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

    // it('triggers load more members when scrolling to bottom', async () => {
    //     mockFetchMembers.mockImplementation(async (category, pageSize, pageNumber) => ({
    //         newMembers: [{...mockMember, id: pageNumber + 1, fullName: `Member ${pageNumber + 1}`}],
    //         totalCountOfPages: 3,
    //     }));
    //     render(<MembersList {...defaultProps} />);
    //     const list = screen.getByTestId('members-list');
    //     Object.defineProperty(list, 'scrollHeight', {value: 1000});
    //     Object.defineProperty(list, 'clientHeight', {value: 500});
    //     Object.defineProperty(list, 'scrollTop', {value: 500});
    //
    //     fireEvent.scroll(list);
    //     await waitFor(() => {
    //         expect(mockFetchMembers).toHaveBeenCalledTimes(2);
    //         expect(screen.getByTestId('member-item-1')).toHaveTextContent('Member 2');
    //     });
    // });
    //
    // it('opens delete modal and handles deletion', async () => {
    //     render(<MembersList {...defaultProps} />);
    //
    //     await waitFor(() => {
    //         expect(screen.getByTestId('member-item-0')).toHaveTextContent('First First');
    //     }, {timeout: 3000});
    //
    //     fireEvent.click(screen.getByTestId('delete-button-0'));
    //     expect(screen.getByTestId('modal')).toBeInTheDocument();
    //     expect(screen.getByTestId('modal-title')).toHaveTextContent('Видалити члена команди?');
    //
    //     fireEvent.click(screen.getByTestId('button-primary'));
    //     await waitFor(() => {
    //         expect(screen.queryByTestId('member-item-0')).not.toBeInTheDocument();
    //         expect(mockMembers).toHaveLength(0);
    //     });
    // });
    //
    // it('closes delete modal without deletion', async () => {
    //     render(<MembersList {...defaultProps} />);
    //     fireEvent.click(screen.getByTestId('delete-button-0'));
    //     fireEvent.click(screen.getByTestId('button-secondary'));
    //     await waitFor(() => {
    //         expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    //         expect(screen.getByTestId('member-item-0')).toBeInTheDocument();
    //     });
    // });
    //
    // it('opens edit modal and handles form changes', async () => {
    //     render(<MembersList {...defaultProps} />);
    //     fireEvent.click(screen.getByTestId('edit-button-0'));
    //     await waitFor(() => {
    //         expect(screen.getByTestId('modal')).toBeInTheDocument();
    //         expect(screen.getByTestId('modal-title')).toHaveTextContent('Редагування учасника команди');
    //         expect(screen.getByTestId('form-fullName')).toHaveValue('First First');
    //     });
    //
    //     fireEvent.change(screen.getByTestId('form-fullName'), {target: {value: 'Updated Name'}});
    //     expect(screen.getByTestId('form-fullName')).toHaveValue('Updated Name');
    // });
    //
    // it('saves member as draft', async () => {
    //     render(<MembersList {...defaultProps} />);
    //     fireEvent.click(screen.getByTestId('edit-button-0'));
    //     fireEvent.change(screen.getByTestId('form-fullName'), {target: {value: 'Updated Name'}});
    //     fireEvent.click(screen.getByTestId('button-secondary'));
    //     await waitFor(() => {
    //         expect(mockMembers[0].fullName).toBe('Updated Name');
    //         expect(mockMembers[0].status).toBe('Чернетка');
    //     });
    // });
    //
    // it('publishes edited member', async () => {
    //     render(<MembersList {...defaultProps} />);
    //     fireEvent.click(screen.getByTestId('edit-button-0'));
    //     fireEvent.change(screen.getByTestId('form-fullName'), {target: {value: 'Updated Name'}});
    //     fireEvent.submit(screen.getByTestId('member-form'));
    //     await waitFor(() => {
    //         expect(screen.getByTestId('modal-title')).toHaveTextContent('Опублікувати нового члена команди?');
    //     });
    //     fireEvent.click(screen.getByTestId('button-primary'));
    //     await waitFor(() => {
    //         expect(mockMembers[0].fullName).toBe('Updated Name');
    //         expect(mockMembers[0].status).toBe('Опубліковано');
    //         expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    //     });
    // });
    //
    // it('cancels publish modal', async () => {
    //     render(<MembersList {...defaultProps} />);
    //     fireEvent.click(screen.getByTestId('edit-button-0'));
    //     fireEvent.submit(screen.getByTestId('member-form'));
    //     fireEvent.click(screen.getByTestId('button-secondary'));
    //     await waitFor(() => {
    //         expect(screen.getByTestId('modal')).toBeInTheDocument();
    //         expect(screen.getByTestId('modal-title')).toHaveTextContent('Редагування учасника команди');
    //     });
    // });
    //
    // it('shows confirm close modal when changes are made and handles close', async () => {
    //     render(<MembersList {...defaultProps} />);
    //     await new Promise((res) => setTimeout(res, 1500));
    //
    //     fireEvent.click(screen.getByTestId('edit-button-0'));
    //     fireEvent.change(screen.getByTestId('form-fullName'), {target: {value: 'Updated Name'}});
    //     fireEvent.click(screen.getByTestId('modal'));
    //     await waitFor(() => {
    //         expect(screen.getByTestId('modal-title')).toHaveTextContent('Зміни буде втрачено. Бажаєте продовжити?');
    //     });
    //     fireEvent.click(screen.getByTestId('button-primary'));
    //     await waitFor(() => {
    //         expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    //         expect(mockMembers[0].fullName).toBe('First First'); // Changes not saved
    //     });
    // });
    //
    // it('closes edit modal without confirm when no changes', async () => {
    //     render(<MembersList {...defaultProps} />);
    //
    //     await waitFor(() => {
    //         expect(screen.getByTestId('edit-button-0')).toBeInTheDocument();
    //     }, {timeout: 1500});
    //
    //     fireEvent.click(screen.getByTestId('edit-button-0'));
    //
    //     await waitFor(() => {
    //         expect(screen.getByTestId('modal')).toBeInTheDocument();
    //         expect(screen.getByTestId('modal-title')).toHaveTextContent('Редагування учасника команди');
    //     });
    //
    //     fireEvent.click(screen.getByTestId('modal'));
    //
    //     await waitFor(() => {
    //         expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    //         expect(screen.queryByTestId('modal-title')).not.toBeInTheDocument();
    //     });
    // });

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
});
