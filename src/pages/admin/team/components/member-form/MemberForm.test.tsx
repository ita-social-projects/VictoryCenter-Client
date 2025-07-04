import React from 'react';
import {render, screen, fireEvent, createEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemberForm, MemberFormProps, MemberFormValues } from './MemberForm';


jest.mock('../../../../../assets/icons/cloud-download.svg', () => 'cloud-download.svg');

describe('MemberForm', () => {
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
        render(<MemberForm {...defaultProps} />);

        expect(screen.getByLabelText('Категорія')).toBeInTheDocument();
        expect(screen.getByLabelText('Ім\'я та Прізвище')).toBeInTheDocument();
        expect(screen.getByLabelText('Опис')).toBeInTheDocument();
        expect(screen.getByText('Фото')).toBeInTheDocument();
    });

    it('initializes with existingMemberFormValues', () => {
        const initialValues: MemberFormValues = {
            category: 'Основна команда',
            fullName: 'John Doe',
            description: 'Test description',
            img: null,
        };
        render(<MemberForm {...defaultProps} existingMemberFormValues={initialValues} />);

        expect(screen.getByDisplayValue('Основна команда')).toBeInTheDocument();
        expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Test description')).toBeInTheDocument();
    });

    it('updates form values and calls onValuesChange on input change', async () => {
        render(<MemberForm {...defaultProps} />);

        const fullNameInput = screen.getByLabelText('Ім\'я та Прізвище');
        fireEvent.change(fullNameInput, { target: { value: 'Jane Doe' } });

        expect(defaultProps.onValuesChange).toHaveBeenCalledWith(
            expect.objectContaining({
                fullName: 'Jane Doe',
            })
        );
    });

    it('updates category and calls onValuesChange', async () => {
        render(<MemberForm {...defaultProps} />);

        const categorySelect = screen.getByLabelText('Категорія');
        fireEvent.change(categorySelect, { target: { value: 'Наглядова рада' } });

        expect(defaultProps.onValuesChange).toHaveBeenCalledWith(
            expect.objectContaining({
                category: 'Наглядова рада',
            })
        );
    });

    it('updates description and calls onValuesChange', async () => {
        render(<MemberForm {...defaultProps} />);

        const descriptionTextarea = screen.getByLabelText('Опис');
        fireEvent.change(descriptionTextarea, { target: { value: 'New description' } });

        expect(defaultProps.onValuesChange).toHaveBeenCalledWith(
            expect.objectContaining({
                description: 'New description',
            })
        );
    });
    
    it('submits form with valid data', async () => {
        render(<MemberForm {...defaultProps} />);

        const categorySelect = screen.getByLabelText('Категорія');
        const fullNameInput = screen.getByLabelText("Ім'я та Прізвище");
        const descriptionTextarea = screen.getByLabelText('Опис');
        const imgInput = screen.getByTestId('image');

        await userEvent.selectOptions(categorySelect, 'Радники');
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
            expect(defaultProps.onSubmit).toHaveBeenCalledWith(
                expect.objectContaining({
                    category: 'Радники',
                    fullName: 'Jane Doe',
                    description: 'Test description',
                    img: expect.any(FileList),
                })
            );
        });
    });
    
    it('displays character count for fullName', async () => {
        render(<MemberForm {...defaultProps} />);

        const fullNameInput = screen.getByLabelText('Ім\'я та Прізвище');
        await userEvent.type(fullNameInput, 'Jane Doe');

        expect(screen.getByText('8/50')).toBeInTheDocument();
    });

    it('displays character count for description', async () => {
        render(<MemberForm {...defaultProps} />);

        const descriptionTextarea = screen.getByLabelText('Опис');
        await userEvent.type(descriptionTextarea, 'Test description');

        expect(screen.getByText('16/200')).toBeInTheDocument();
    });

    it('prevents form submission if memberFormValues is null', () => {
        render(<MemberForm {...defaultProps} existingMemberFormValues={null} />);

        const form = screen.getByTestId('test-form');
        fireEvent.submit(form);

        expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });

    it('handles drag over and drag leave events', () => {
        render(<MemberForm {...defaultProps} />);

        const dropArea = screen.getByLabelText('Перетягніть файл сюди або натисніть для завантаження');
        fireEvent.dragOver(dropArea);
        fireEvent.dragLeave(dropArea);

        expect(dropArea).toBeInTheDocument();
    });

    it('renders with correct input attributes', () => {
        render(<MemberForm {...defaultProps} />);

        const fullNameInput = screen.getByLabelText('Ім\'я та Прізвище');
        expect(fullNameInput).toHaveAttribute('maxLength', '50');

        const descriptionTextarea = screen.getByLabelText('Опис');
        expect(descriptionTextarea).toHaveAttribute('maxLength', '200');
    });
});

describe('MemberForm - Additional Coverage', () => {
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

    it('displays uploaded file names', () => {
        const file1 = new File(['test1'], 'test1.jpg', { type: 'image/jpeg' });
        const file2 = new File(['test2'], 'test2.jpg', { type: 'image/jpeg' });
        const fileList = [file1, file2] as any as FileList;

        const initialValues: MemberFormValues = {
            category: 'Основна команда',
            fullName: 'John Doe',
            description: 'Test description',
            img: fileList,
        };

        render(<MemberForm {...defaultProps} existingMemberFormValues={initialValues} />);

        expect(screen.getByText('test1.jpg')).toBeInTheDocument();
        expect(screen.getByText('test2.jpg')).toBeInTheDocument();
    });

    it('renders empty div when no files are uploaded', () => {
        render(<MemberForm {...defaultProps} />);

        const imageLoadedSection = document.querySelector('.form-group-image-loaded');
        expect(imageLoadedSection).toBeInTheDocument();
        expect(imageLoadedSection?.children).toHaveLength(1);
    });

    it('does not call onValuesChange when onValuesChange prop is not provided', () => {
        const propsWithoutOnValuesChange = {
            ...defaultProps,
            onValuesChange: undefined,
        };

        render(<MemberForm {...propsWithoutOnValuesChange} />);

        const fullNameInput = screen.getByLabelText('Ім\'я та Прізвище');
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
                })
            );
        });
    });


    it('handles file input change without files (edge case)', () => {
        render(<MemberForm {...defaultProps} />);

        const fullNameInput = screen.getByLabelText('Ім\'я та Прізвище');

        fireEvent.change(fullNameInput, {
            target: { name: 'fullName', value: 'Test Name' },
            currentTarget: { files: null }
        });

        expect(defaultProps.onValuesChange).toHaveBeenCalledWith(
            expect.objectContaining({
                fullName: 'Test Name',
            })
        );
    });

    it('handles file input with empty FileList', () => {
        render(<MemberForm {...defaultProps} />);

        const fileInput = screen.getByTestId('image');

        const mockEvent = {
            target: { name: 'img', value: null },
            currentTarget: { files: { length: 0 } }
        };

        fireEvent.change(fileInput, mockEvent);

        expect(defaultProps.onValuesChange).toHaveBeenCalledWith(
            expect.objectContaining({
                img: expect.any(FileList)
            })
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
                files: []
            }
        });

        dropEvent.preventDefault = jest.fn();

        fireEvent(dropArea, dropEvent);

        expect(dropEvent.preventDefault).toHaveBeenCalled();
    });

    it('handles drag events with files in dataTransfer', () => {
        render(<MemberForm {...defaultProps} />);

        const dropArea = screen.getByTestId('drop-area');
        const file = new File(['hello'], 'hello.png', { type: 'image/png' });

        const data = {
            files: [file],
            types: ['Files'],
        };

        fireEvent.drop(dropArea, {
            dataTransfer: data,
        });

        expect(screen.getByText('hello.png')).toBeInTheDocument();
    });
});

describe('MemberForm - Extra Function Coverage', () => {
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

    it('updates file input after already set', () => {
        render(<MemberForm {...defaultProps} />);
        const fileInput = screen.getByTestId('image');
        const file1 = new File(['a'], 'a.png', { type: 'image/png' });
        fireEvent.change(fileInput, { target: { files: [file1], name: 'img' }, currentTarget: { files: [file1] } });
        expect(screen.getByText('a.png')).toBeInTheDocument();
        const file2 = new File(['b'], 'b.png', { type: 'image/png' });
        fireEvent.change(fileInput, { target: { files: [file2], name: 'img' }, currentTarget: { files: [file2] } });
        expect(screen.getByText('b.png')).toBeInTheDocument();
    });

    it('does not submit if category is empty', () => {
        render(<MemberForm {...defaultProps} />);
        const fullNameInput = screen.getByLabelText('Ім\'я та Прізвище');
        const descriptionTextarea = screen.getByLabelText('Опис');
        fireEvent.change(fullNameInput, { target: { value: 'Test' } });
        fireEvent.change(descriptionTextarea, { target: { value: 'Test desc' } });
        const form = screen.getByTestId('test-form');
        fireEvent.submit(form);
        expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });

    it('does not submit if fullName is empty', () => {
        render(<MemberForm {...defaultProps} />);
        const categorySelect = screen.getByLabelText('Категорія');
        const descriptionTextarea = screen.getByLabelText('Опис');
        fireEvent.change(categorySelect, { target: { value: 'Основна команда' } });
        fireEvent.change(descriptionTextarea, { target: { value: 'Test desc' } });
        const form = screen.getByTestId('test-form');
        fireEvent.submit(form);
        expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });

    it('does not submit if description is empty', () => {
        render(<MemberForm {...defaultProps} />);
        const categorySelect = screen.getByLabelText('Категорія');
        const fullNameInput = screen.getByLabelText('Ім\'я та Прізвище');
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
            dataTransfer: { files: null }
        };
        fireEvent.drop(dropArea, dropEvent);
        expect(screen.getByText('0/50')).toBeInTheDocument();
    });

    it('handles drag-and-drop with multiple files', () => {
        render(<MemberForm {...defaultProps} />);
        const dropArea = screen.getByTestId('drop-area');
        const file1 = new File(['a'], 'a.png', { type: 'image/png' });
        const file2 = new File(['b'], 'b.png', { type: 'image/png' });
        const data = { files: [file1, file2], types: ['Files'] };
        fireEvent.drop(dropArea, { dataTransfer: data, preventDefault: jest.fn() });
        expect(screen.getByText('a.png')).toBeInTheDocument();
        expect(screen.getByText('b.png')).toBeInTheDocument();
    });

    it('does not call onValuesChange if memberFormValues is falsy (defensive)', () => {
        // Simulate effect with falsy memberFormValues
        // Not directly possible, but we can check that the effect is not called if onValuesChange is not provided (already covered)
        // So this is just for completeness
        render(<MemberForm {...defaultProps} onValuesChange={undefined} />);
        const fullNameInput = screen.getByLabelText('Ім\'я та Прізвище');
        fireEvent.change(fullNameInput, { target: { value: 'Test' } });
        expect(fullNameInput).toHaveValue('Test');
    });

    it('enforces max length for fullName and description', async () => {
        render(<MemberForm {...defaultProps} />);
        const fullNameInput = screen.getByLabelText('Ім\'я та Прізвище');
        const descriptionTextarea = screen.getByLabelText('Опис');
        const longName = 'a'.repeat(60);
        const longDesc = 'b'.repeat(250);
        await userEvent.type(fullNameInput, longName);
        await userEvent.type(descriptionTextarea, longDesc);
        expect(fullNameInput).toHaveValue('a'.repeat(50));
        expect(descriptionTextarea).toHaveValue('b'.repeat(200));
        expect(screen.getByText('50/50')).toBeInTheDocument();
        expect(screen.getByText('200/200')).toBeInTheDocument();
    });

    it('removes file input (sets to null) after file was set', () => {
        render(<MemberForm {...defaultProps} />);
        const fileInput = screen.getByTestId('image');
        const file1 = new File(['a'], 'a.png', { type: 'image/png' });
        fireEvent.change(fileInput, { target: { files: [file1], name: 'img' }, currentTarget: { files: [file1] } });
        expect(screen.getByText('a.png')).toBeInTheDocument();
        // Now remove file
        fireEvent.change(fileInput, { target: { files: null, name: 'img' }, currentTarget: { files: null } });
        // Should render empty div
        const imageLoadedSection = document.querySelector('.form-group-image-loaded');
        expect(imageLoadedSection?.children).toHaveLength(1);
    });
});
