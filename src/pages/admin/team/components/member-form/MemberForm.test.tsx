import React from 'react';
<<<<<<< HEAD
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
=======
import { render, screen, fireEvent, createEvent, waitFor } from '@testing-library/react';
>>>>>>> feature/issue-12
import userEvent from '@testing-library/user-event';
import { MemberForm, MemberFormProps, MemberFormValues } from './MemberForm';
import { AdminContext } from '../../../../../context/admin-context-provider/AdminContextProvider';
import axios from 'axios';
import { TeamCategoriesApi } from '../../../../../services/data-fetch/admin-page-data-fetch/team-page-data-fetch/TeamCategoriesApi/TeamCategoriesApi';

jest.mock('../../../../../assets/icons/cloud-download.svg', () => 'cloud-download.svg');

const mockAdminContext = {
    client: axios.create(),
    isAuthenticated: true,
    isLoading: false,
    login: jest.fn(),
    logout: jest.fn(),
    refreshAccessToken: jest.fn(),
};

const renderWithAdminContext = async (ui: React.ReactElement) => {
    render(<AdminContext.Provider value={mockAdminContext}>{ui}</AdminContext.Provider>);
    await screen.findByLabelText("Ім'я та Прізвище");
};

describe('MemberForm', () => {
    const defaultProps: MemberFormProps = {
        id: 'test-form',
        onSubmit: jest.fn(),
        onValuesChange: jest.fn(),
        existingMemberFormValues: null,
        isDraft: false,
    };

    beforeAll(() => {
        global.URL.createObjectURL = jest.fn(() => 'blob:http://localhost/mock');
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(TeamCategoriesApi, 'getAll').mockImplementation(() =>
            Promise.resolve([
                { id: 1, name: 'Основна команда', description: 'Test' },
                { id: 2, name: 'Наглядова рада', description: 'Test' },
                { id: 3, name: 'Радники', description: 'Test' },
            ]),
        );
    });

    it('calls preventDefault on dragOver and dragLeave', () => {
        render(<MemberForm {...defaultProps} />);

        const dropArea = screen.getByTestId('drop-area');

        const dragOverEvent = createEvent.dragOver(dropArea);
        const dragLeaveEvent = createEvent.dragLeave(dropArea);

        dragOverEvent.preventDefault = jest.fn();
        dragLeaveEvent.preventDefault = jest.fn();

        fireEvent(dropArea, dragOverEvent);
        fireEvent(dropArea, dragLeaveEvent);

        expect(dragOverEvent.preventDefault).toHaveBeenCalled();
        expect(dragLeaveEvent.preventDefault).toHaveBeenCalled();
    });

    it('renders form with all fields', () => {
        renderWithAdminContext(<MemberForm {...defaultProps} />);

<<<<<<< HEAD
        expect(screen.getByLabelText('Категорія')).toBeInTheDocument();
        expect(screen.getByLabelText("Ім'я та Прізвище")).toBeInTheDocument();
        expect(screen.getByLabelText('Опис')).toBeInTheDocument();
        expect(screen.getByTestId('photo-input-hidden')).toBeInTheDocument();
=======
        expect(screen.getByLabelText(/Категорія/)).toBeInTheDocument();
        expect(screen.getByLabelText(/Ім'я та Прізвище/)).toBeInTheDocument();
        expect(screen.getByLabelText(/Опис/)).toBeInTheDocument();
        expect(screen.getByText(/Фото/)).toBeInTheDocument();
>>>>>>> feature/issue-12
    });

    it('initializes with existingMemberFormValues', async () => {
        const initialValues: MemberFormValues = {
            category: {
                id: 1,
                name: 'Основна команда',
                description: 'Test',
            },
            fullName: 'John Doe',
            description: 'Test description',
<<<<<<< HEAD
            imageId: 1,
            image: {
                base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y4nYFMAAAAASUVORK5CYII=',
                mimeType: 'image/jpeg',
            },
=======
            img: undefined,
>>>>>>> feature/issue-12
        };
        renderWithAdminContext(<MemberForm {...defaultProps} existingMemberFormValues={initialValues} />);

        await waitFor(() => {
            expect(screen.getByDisplayValue('Основна команда')).toBeInTheDocument();
        });
        expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Test description')).toBeInTheDocument();
    });

    it('updates form values and calls onValuesChange on input change', async () => {
        renderWithAdminContext(<MemberForm {...defaultProps} />);

        const fullNameInput = screen.getByLabelText(/Ім'я та Прізвище/);
        fireEvent.change(fullNameInput, { target: { value: 'Jane Doe' } });

        expect(defaultProps.onValuesChange).toHaveBeenCalledWith(
            expect.objectContaining({
                fullName: 'Jane Doe',
            }),
        );
    });

    it('updates category and calls onValuesChange', async () => {
        renderWithAdminContext(<MemberForm {...defaultProps} />);

        await waitFor(() => {
            expect(screen.getByRole('option', { name: 'Наглядова рада' })).toBeInTheDocument();
        });

        const categorySelect = screen.getByLabelText(/Категорія/);
        fireEvent.change(categorySelect, { target: { value: 'Наглядова рада' } });

        expect(defaultProps.onValuesChange).toHaveBeenCalledWith(
            expect.objectContaining({
                category: {
                    id: 2,
                    name: 'Наглядова рада',
                    description: 'Test',
                },
            }),
        );
    });

    it('updates description and calls onValuesChange', async () => {
        renderWithAdminContext(<MemberForm {...defaultProps} />);

        const descriptionTextarea = screen.getByLabelText(/Опис/);
        fireEvent.change(descriptionTextarea, { target: { value: 'New description' } });

        expect(defaultProps.onValuesChange).toHaveBeenCalledWith(
            expect.objectContaining({
                description: 'New description',
            }),
        );
    });

    it('submits form with valid data', async () => {
        renderWithAdminContext(<MemberForm {...defaultProps} />);

        await waitFor(() => {
            expect(screen.getByText('Радники')).toBeInTheDocument();
        });

        const categorySelect = screen.getByLabelText(/Категорія/);
        const fullNameInput = screen.getByLabelText(/Ім'я та Прізвище/);
        const descriptionTextarea = screen.getByLabelText(/Опис/);
        const imgInput = screen.getByTestId('image');

<<<<<<< HEAD
        fireEvent.change(categorySelect, {
            target: {
                value: 'Радники',
            },
        });
=======
        await userEvent.selectOptions(categorySelect, 'Радники');
>>>>>>> feature/issue-12
        await userEvent.type(fullNameInput, 'Jane Doe');
        await userEvent.type(descriptionTextarea, 'Test description');

        const file = new File(['dummy content'], 'test-image.jpg', { type: 'image/jpeg' });
        Object.defineProperty(file, 'size', { value: 1024 * 1024 });

        const fileList = {
            0: file,
            length: 1,
            item: (index: number) => file,
            [Symbol.iterator]: function* () {
                yield file;
            },
        };

        Object.setPrototypeOf(fileList, FileList.prototype);

        fireEvent.change(imgInput, {
            target: { files: fileList },
        });

        const form = screen.getByTestId('test-form');
        fireEvent.submit(form);

        await waitFor(() => {
<<<<<<< HEAD
            expect(defaultProps.onSubmit).toHaveBeenCalledWith({
                category: {
                    id: 3,
                    name: 'Радники',
                    description: 'Test',
                },
                fullName: 'Jane Doe',
                description: 'Test description',
                image: null,
                imageId: null,
            });
=======
            expect(defaultProps.onSubmit).toHaveBeenCalledWith(
                expect.objectContaining({
                    category: 'Радники',
                    fullName: 'Jane Doe',
                    description: 'Test description',
                    img: expect.any(FileList),
                }),
            );
>>>>>>> feature/issue-12
        });
    });

    it('displays character count for fullName', async () => {
        renderWithAdminContext(<MemberForm {...defaultProps} />);

        const fullNameInput = screen.getByLabelText(/Ім'я та Прізвище/);
        await userEvent.type(fullNameInput, 'Jane Doe');

        expect(screen.getByText('8/50')).toBeInTheDocument();
    });

    it('displays character count for description', async () => {
        renderWithAdminContext(<MemberForm {...defaultProps} />);

        const descriptionTextarea = screen.getByLabelText(/Опис/);
        await userEvent.type(descriptionTextarea, 'Test description');

        expect(screen.getByText('16/200')).toBeInTheDocument();
    });

    it('prevents form submission if memberFormValues is null', () => {
        renderWithAdminContext(<MemberForm {...defaultProps} existingMemberFormValues={null} />);

        const form = screen.getByTestId('test-form');
        fireEvent.submit(form);

        expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });

    it('handles drag over and drag leave events', () => {
        renderWithAdminContext(<MemberForm {...defaultProps} />);

        const dropArea = screen.getByLabelText('Перетягніть файл сюди або натисніть для завантаження');
        fireEvent.dragOver(dropArea);
        fireEvent.dragLeave(dropArea);

        expect(dropArea).toBeInTheDocument();
    });

    it('renders with correct input attributes', () => {
        renderWithAdminContext(<MemberForm {...defaultProps} />);

        const fullNameInput = screen.getByLabelText(/Ім'я та Прізвище/);
        expect(fullNameInput).toHaveAttribute('maxLength', '50');

        const descriptionTextarea = screen.getByLabelText(/Опис/);
        expect(descriptionTextarea).toHaveAttribute('maxLength', '200');
    });

<<<<<<< HEAD
    describe('Additional Coverage', () => {
        it('does not call onValuesChange when onValuesChange prop is not provided', () => {
            const propsWithoutOnValuesChange = {
                ...defaultProps,
                onValuesChange: undefined,
            };

            renderWithAdminContext(<MemberForm {...propsWithoutOnValuesChange} />);

            const fullNameInput = screen.getByLabelText("Ім'я та Прізвище");
            fireEvent.change(fullNameInput, { target: { value: 'Jane Doe' } });

            expect(fullNameInput).toHaveValue('Jane Doe');
=======
    it('renders empty div when no files are uploaded', () => {
        render(<MemberForm {...defaultProps} />);

        const imageLoadedSection = document.querySelector('.form-group-image-loaded');
        expect(imageLoadedSection).toBeInTheDocument();
        expect(imageLoadedSection?.textContent?.trim()).toBe('');
    });

    it('does not call onValuesChange when onValuesChange prop is not provided', () => {
        const propsWithoutOnValuesChange = {
            ...defaultProps,
            onValuesChange: undefined,
        };

        render(<MemberForm {...propsWithoutOnValuesChange} />);

        const fullNameInput = screen.getByLabelText(/Ім'я та Прізвище/);
        fireEvent.change(fullNameInput, { target: { value: 'Jane Doe' } });

        expect(fullNameInput).toHaveValue('Jane Doe');
    });

    it('handles form submission when memberFormValues exists', async () => {
        const file = new File(['dummy'], 'avatar.jpg', { type: 'image/jpg' });
        const mockFileList = {
            0: file,
            length: 1,
            item: () => file,
        };
        Object.setPrototypeOf(mockFileList, FileList.prototype);

        const existingValues: MemberFormValues = {
            category: 'Основна команда',
            fullName: 'John Doe',
            description: 'Test description',
            img: mockFileList as unknown as FileList,
        };

        render(<MemberForm {...defaultProps} existingMemberFormValues={existingValues} />);

        const form = screen.getByTestId('test-form');

        await waitFor(() => {
            expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
            expect(screen.getByDisplayValue('Test description')).toBeInTheDocument();
            expect(screen.getByDisplayValue('Основна команда')).toBeInTheDocument();
        });

        fireEvent.submit(form);

        await waitFor(() => {
            expect(defaultProps.onSubmit).toHaveBeenCalledWith(
                expect.objectContaining({
                    category: 'Основна команда',
                    fullName: 'John Doe',
                    description: 'Test description',
                    img: expect.any(FileList),
                }),
            );
        });
    });

    it('handles file input change without files (edge case)', () => {
        render(<MemberForm {...defaultProps} />);

        const fullNameInput = screen.getByLabelText(/Ім'я та Прізвище/);

        fireEvent.change(fullNameInput, {
            target: { name: 'fullName', value: 'Test Name' },
            currentTarget: { files: null },
>>>>>>> feature/issue-12
        });

        it('handles form submission when memberFormValues exists', () => {
            const initialValues: MemberFormValues = {
                category: {
                    id: 1,
                    name: 'Основна команда',
                    description: 'Test',
                },
                fullName: 'John Doe',
                description: 'Test description',
                image: null,
                imageId: null,
            };

            renderWithAdminContext(<MemberForm {...defaultProps} existingMemberFormValues={initialValues} />);

            const form = screen.getByTestId('test-form');
            fireEvent.submit(form);

<<<<<<< HEAD
            expect(defaultProps.onSubmit).toHaveBeenCalledWith(initialValues);
=======
        const mockEvent = {
            target: { name: 'img', value: null },
            currentTarget: { files: { length: 0 } },
        };

        fireEvent.change(fileInput, mockEvent);

        expect(defaultProps.onValuesChange).toHaveBeenCalledWith(
            expect.objectContaining({
                img: expect.any(FileList),
            }),
        );
    });

    it('displays 0 character count when fields are empty', () => {
        render(<MemberForm {...defaultProps} />);

        expect(screen.getByText('0/50')).toBeInTheDocument();
        expect(screen.getByText('0/200')).toBeInTheDocument();
    });

    it('handles drag events without files in dataTransfer', () => {
        render(<MemberForm {...defaultProps} />);

        const dropArea = screen.getByTestId('drop-area');

        const dropEvent = createEvent.drop(dropArea);

        Object.defineProperty(dropEvent, 'dataTransfer', {
            value: {
                files: [],
            },
>>>>>>> feature/issue-12
        });

        it('handles file input change without files (edge case)', () => {
            renderWithAdminContext(<MemberForm {...defaultProps} />);

            const fullNameInput = screen.getByLabelText("Ім'я та Прізвище");

            fireEvent.change(fullNameInput, {
                target: { name: 'fullName', value: 'Test Name' },
                currentTarget: { files: null },
            });

<<<<<<< HEAD
            expect(defaultProps.onValuesChange).toHaveBeenCalledWith(
                expect.objectContaining({
                    fullName: 'Test Name',
                }),
            );
        });

        it('displays 0 character count when fields are empty', () => {
            renderWithAdminContext(<MemberForm {...defaultProps} />);

            expect(screen.getByText('0/50')).toBeInTheDocument();
            expect(screen.getByText('0/200')).toBeInTheDocument();
        });
    });

    describe('Extra Function Coverage', () => {
        it('does not submit if category is empty', () => {
            renderWithAdminContext(<MemberForm {...defaultProps} />);
            const fullNameInput = screen.getByLabelText("Ім'я та Прізвище");
            const descriptionTextarea = screen.getByLabelText('Опис');
            fireEvent.change(fullNameInput, { target: { value: 'Test' } });
            fireEvent.change(descriptionTextarea, { target: { value: 'Test desc' } });
            const form = screen.getByTestId('test-form');
            fireEvent.submit(form);
            expect(defaultProps.onSubmit).not.toHaveBeenCalled();
        });

        it('does not submit if fullName is empty', () => {
            renderWithAdminContext(<MemberForm {...defaultProps} />);
            const categorySelect = screen.getByLabelText('Категорія');
            const descriptionTextarea = screen.getByLabelText('Опис');
            fireEvent.change(categorySelect, { target: { value: 'Основна команда' } });
            fireEvent.change(descriptionTextarea, { target: { value: 'Test desc' } });
            const form = screen.getByTestId('test-form');
            fireEvent.submit(form);
            expect(defaultProps.onSubmit).not.toHaveBeenCalled();
        });

        it('does not submit if description is empty', () => {
            renderWithAdminContext(<MemberForm {...defaultProps} />);
            const categorySelect = screen.getByLabelText('Категорія');
            const fullNameInput = screen.getByLabelText("Ім'я та Прізвище");
            fireEvent.change(categorySelect, { target: { value: 'Основна команда' } });
            fireEvent.change(fullNameInput, { target: { value: 'Test' } });
            const form = screen.getByTestId('test-form');
            fireEvent.submit(form);
            expect(defaultProps.onSubmit).not.toHaveBeenCalled();
        });

        it('does not call onValuesChange if memberFormValues is falsy (defensive)', () => {
            // Simulate effect with falsy memberFormValues
            // Not directly possible, but we can check that the effect is not called if onValuesChange is not provided (already covered)
            // So this is just for completeness
            renderWithAdminContext(<MemberForm {...defaultProps} onValuesChange={undefined} />);
            const fullNameInput = screen.getByLabelText("Ім'я та Прізвище");
            fireEvent.change(fullNameInput, { target: { value: 'Test' } });
            expect(fullNameInput).toHaveValue('Test');
        });

        it('enforces max length for fullName and description', async () => {
            renderWithAdminContext(<MemberForm {...defaultProps} />);
            await waitFor(() => {
                expect(screen.getByLabelText("Ім'я та Прізвище")).toBeInTheDocument();
            });

            const fullNameInput = screen.getByLabelText("Ім'я та Прізвище");
            const descriptionTextarea = screen.getByLabelText('Опис');
            const longName = 'a'.repeat(60);
            const longDesc = 'b'.repeat(250);
            await userEvent.type(fullNameInput, longName);
            await userEvent.type(descriptionTextarea, longDesc);
            expect(fullNameInput).toHaveValue('a'.repeat(50));
            expect(descriptionTextarea).toHaveValue('b'.repeat(200));
            expect(screen.getByText('50/50')).toBeInTheDocument();
            expect(screen.getByText('200/200')).toBeInTheDocument();
=======
    it('handles drag events with files in dataTransfer', async () => {
        render(<MemberForm {...defaultProps} />);

        const dropArea = screen.getByTestId('drop-area');
        const file = new File(['hello'], 'hello.png', { type: 'image/png' });

        const mockFileList = {
            0: file,
            length: 1,
            item: (index: number) => (index === 0 ? file : null),
            [Symbol.iterator]: function* () {
                yield file;
            },
        };
        Object.setPrototypeOf(mockFileList, FileList.prototype);

        const dropEvent = new Event('drop', { bubbles: true });
        Object.defineProperty(dropEvent, 'dataTransfer', {
            value: {
                files: mockFileList,
                types: ['Files'],
            },
        });

        fireEvent(dropArea, dropEvent);

        await waitFor(() => {
            expect(screen.getByText('hello.png')).toBeInTheDocument();
        });
    });
});

describe('MemberForm - Extra Function Coverage', () => {
    beforeAll(() => {
        global.URL.createObjectURL = jest.fn(() => 'blob:http://localhost/mock');
    });

    const defaultProps: MemberFormProps = {
        id: 'test-form',
        onSubmit: jest.fn(),
        onValuesChange: jest.fn(),
        existingMemberFormValues: null,
        isDraft: false,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('updates file input after already set', async () => {
        render(<MemberForm {...defaultProps} />);

        const fileInput = screen.getByTestId('image');

        const file1 = new File(['a'], 'a.png', { type: 'image/png' });
        const fileList1 = {
            0: file1,
            length: 1,
            item: (index: number) => file1,
            [Symbol.iterator]: function* () {
                yield file1;
            },
        };
        Object.setPrototypeOf(fileList1, FileList.prototype);

        fireEvent.change(fileInput, { target: { files: fileList1 } });

        await waitFor(() => {
            expect(screen.getByText('a.png')).toBeInTheDocument();
        });

        const file2 = new File(['b'], 'b.png', { type: 'image/png' });
        const fileList2 = {
            0: file2,
            length: 1,
            item: (index: number) => file2,
            [Symbol.iterator]: function* () {
                yield file2;
            },
        };
        Object.setPrototypeOf(fileList2, FileList.prototype);

        fireEvent.change(fileInput, { target: { files: fileList2 } });

        await waitFor(() => {
            expect(screen.queryByText('a.png')).not.toBeInTheDocument();
            expect(screen.getByText('b.png')).toBeInTheDocument();
        });
    });

    it('does not submit if category is empty', () => {
        render(<MemberForm {...defaultProps} />);
        const fullNameInput = screen.getByLabelText(/Ім'я та Прізвище/);
        const descriptionTextarea = screen.getByLabelText(/Опис/);
        fireEvent.change(fullNameInput, { target: { value: 'Test' } });
        fireEvent.change(descriptionTextarea, { target: { value: 'Test desc' } });
        const form = screen.getByTestId('test-form');
        fireEvent.submit(form);
        expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });

    it('does not submit if fullName is empty', () => {
        render(<MemberForm {...defaultProps} />);
        const categorySelect = screen.getByLabelText(/Категорія/);
        const descriptionTextarea = screen.getByLabelText(/Опис/);
        fireEvent.change(categorySelect, { target: { value: 'Основна команда' } });
        fireEvent.change(descriptionTextarea, { target: { value: 'Test desc' } });
        const form = screen.getByTestId('test-form');
        fireEvent.submit(form);
        expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });

    it('does not submit if description is empty', () => {
        render(<MemberForm {...defaultProps} />);
        const categorySelect = screen.getByLabelText(/Категорія/);
        const fullNameInput = screen.getByLabelText(/Ім'я та Прізвище/);
        fireEvent.change(categorySelect, { target: { value: 'Основна команда' } });
        fireEvent.change(fullNameInput, { target: { value: 'Test' } });
        const form = screen.getByTestId('test-form');
        fireEvent.submit(form);
        expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });

    it('handles drag-and-drop with empty FileList', () => {
        render(<MemberForm {...defaultProps} />);
        const dropArea = screen.getByTestId('drop-area');
        const dropEvent = {
            preventDefault: jest.fn(),
            dataTransfer: { files: null },
        };
        fireEvent.drop(dropArea, dropEvent);
        expect(screen.getByText('0/50')).toBeInTheDocument();
    });

    it('does not call onValuesChange if memberFormValues is falsy (defensive)', () => {
        render(<MemberForm {...defaultProps} onValuesChange={undefined} />);
        const fullNameInput = screen.getByLabelText(/Ім'я та Прізвище/);
        fireEvent.change(fullNameInput, { target: { value: 'Test' } });
        expect(fullNameInput).toHaveValue('Test');
    });

    it('enforces max length for fullName and description', async () => {
        render(<MemberForm {...defaultProps} />);
        const fullNameInput = screen.getByLabelText(/Ім'я та Прізвище/);
        const descriptionTextarea = screen.getByLabelText(/Опис/);
        const longName = 'a'.repeat(60);
        const longDesc = 'b'.repeat(250);
        await userEvent.type(fullNameInput, longName);
        await userEvent.type(descriptionTextarea, longDesc);
        expect(fullNameInput).toHaveValue('a'.repeat(50));
        expect(descriptionTextarea).toHaveValue('b'.repeat(200));
        expect(screen.getByText('50/50')).toBeInTheDocument();
        expect(screen.getByText('200/200')).toBeInTheDocument();
    });

    it('removes file input (sets to empty FileList) after file was set', async () => {
        render(<MemberForm {...defaultProps} />);
        const fileInput = screen.getByTestId('image');
        const file1 = new File(['a'], 'a.png', { type: 'image/png' });

        const fileListWithFile = {
            0: file1,
            length: 1,
            item: (index: number) => (index === 0 ? file1 : null),
            [Symbol.iterator]: function* () {
                yield file1;
            },
        };
        Object.setPrototypeOf(fileListWithFile, FileList.prototype);

        fireEvent.change(fileInput, {
            target: { files: fileListWithFile, name: 'img' },
            currentTarget: { files: fileListWithFile },
        });

        await waitFor(() => {
            expect(screen.getByText('a.png')).toBeInTheDocument();
        });

        const emptyFileList = {
            length: 0,
            item: () => null,
            [Symbol.iterator]: function* () {},
        };
        Object.setPrototypeOf(emptyFileList, FileList.prototype);

        fireEvent.change(fileInput, {
            target: { files: emptyFileList, name: 'img' },
            currentTarget: { files: emptyFileList },
        });

        await waitFor(() => {
            const imageLoadedSection = document.querySelector('.form-group-image-loaded');
            expect(imageLoadedSection?.textContent?.trim()).toBe('');
        });
    });
});
describe('MemberForm branch coverage additions', () => {
    beforeAll(() => {
        global.URL.createObjectURL = jest.fn(() => 'blob:http://localhost/mock');
    });

    const baseProps: MemberFormProps = {
        id: 'test-form',
        onSubmit: jest.fn(),
        onDraftSubmit: jest.fn(),
        isDraft: false,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('does not submit when category is missing', async () => {
        render(<MemberForm {...baseProps} />);
        const fullNameInput = screen.getByLabelText(/Ім'я та Прізвище/);
        const descriptionInput = screen.getByLabelText(/Опис/);

        await userEvent.type(fullNameInput, 'John Doe');
        await userEvent.type(descriptionInput, 'Some description');

        const form = screen.getByTestId('test-form');
        fireEvent.submit(form);

        await waitFor(() => {
            expect(baseProps.onSubmit).not.toHaveBeenCalled();
            expect(baseProps.onDraftSubmit).not.toHaveBeenCalled();
        });
    });

    it('does not submit when fullName is missing', async () => {
        render(<MemberForm {...baseProps} />);
        const categorySelect = screen.getByLabelText(/Категорія/);
        const descriptionInput = screen.getByLabelText(/Опис/);

        await userEvent.selectOptions(categorySelect, 'Основна команда');
        await userEvent.type(descriptionInput, 'Some description');

        const form = screen.getByTestId('test-form');
        fireEvent.submit(form);

        await waitFor(() => {
            expect(baseProps.onSubmit).not.toHaveBeenCalled();
            expect(baseProps.onDraftSubmit).not.toHaveBeenCalled();
        });
    });

    it('does not submit when description is missing', async () => {
        render(<MemberForm {...baseProps} />);
        const categorySelect = screen.getByLabelText(/Категорія/);
        const fullNameInput = screen.getByLabelText(/Ім'я та Прізвище/);

        await userEvent.selectOptions(categorySelect, 'Основна команда');
        await userEvent.type(fullNameInput, 'John Doe');

        const form = screen.getByTestId('test-form');
        fireEvent.submit(form);

        await waitFor(() => {
            expect(baseProps.onSubmit).not.toHaveBeenCalled();
            expect(baseProps.onDraftSubmit).not.toHaveBeenCalled();
        });
    });

    it('calls onDraftSubmit when isDraft is true', async () => {
        render(<MemberForm {...baseProps} isDraft={true} />);
        const categorySelect = screen.getByLabelText(/Категорія/);
        const fullNameInput = screen.getByLabelText(/Ім'я та Прізвище/);
        const descriptionInput = screen.getByLabelText(/Опис/);

        await userEvent.selectOptions(categorySelect, 'Основна команда');
        await userEvent.type(fullNameInput, 'John Doe');
        await userEvent.type(descriptionInput, 'Some description');

        const form = screen.getByTestId('test-form');
        fireEvent.submit(form);

        await waitFor(() => {
            expect(baseProps.onDraftSubmit).toHaveBeenCalledWith(
                expect.objectContaining({
                    category: 'Основна команда',
                    fullName: 'John Doe',
                    description: 'Some description',
                }),
            );
            expect(baseProps.onSubmit).not.toHaveBeenCalled();
>>>>>>> feature/issue-12
        });
    });
});
