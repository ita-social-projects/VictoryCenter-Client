import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemberForm, MemberFormProps, MemberFormValues } from './MemberForm';

class MockDataTransfer implements DataTransfer {
    dropEffect: DataTransfer['dropEffect'] = 'none';
    effectAllowed: DataTransfer['effectAllowed'] = 'all';
    files: FileList = {} as FileList;
    items: DataTransferItemList = {
        length: 0,
        add: () => null,
        remove: () => {},
        clear: () => {},
        [Symbol.iterator]: function* () {},
    };
    types: string[] = [];

    getData(format: string): string {
        return '';
    }

    setData(format: string, data: string): void {}

    clearData(format?: string): void {}

    setDragImage(image: Element, x: number, y: number): void {}
}
(global as any).DataTransfer = MockDataTransfer;

jest.mock('../../../../../assets/icons/cloud-download.svg', () => 'cloud-download.svg');

describe('MemberForm', () => {
    const defaultProps: MemberFormProps = {
        id: 'test-form',
        onSubmit: jest.fn(),
        onValuesChange: jest.fn(),
        existingMemberFormValues: null,
    };


    beforeEach(() => {
        jest.clearAllMocks();
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
        const fullNameInput = screen.getByLabelText('Ім\'я та Прізвище');
        const descriptionTextarea = screen.getByLabelText('Опис');

        fireEvent.change(categorySelect, { target: { value: 'Радники' } });
        await userEvent.type(fullNameInput, 'Jane Doe');
        await userEvent.type(descriptionTextarea, 'Test description');

        const form = screen.getByTestId('test-form');
        fireEvent.submit(form);

        expect(defaultProps.onSubmit).toHaveBeenCalledWith({
            category: 'Радники',
            fullName: 'Jane Doe',
            description: 'Test description',
            img: null
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

    it('handles form submission when memberFormValues exists', () => {
        const initialValues: MemberFormValues = {
            category: 'Основна команда',
            fullName: 'John Doe',
            description: 'Test description',
            img: null,
        };

        render(<MemberForm {...defaultProps} existingMemberFormValues={initialValues} />);

        const form = screen.getByTestId('test-form');
        fireEvent.submit(form);

        expect(defaultProps.onSubmit).toHaveBeenCalledWith(initialValues);
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
            target: { name: 'img', value: '' },
            currentTarget: { files: { length: 0 } }
        };

        fireEvent.change(fileInput, mockEvent);

        expect(defaultProps.onValuesChange).toHaveBeenCalledWith(
            expect.objectContaining({
                img: '',
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

        const dropArea = screen.getByLabelText('Перетягніть файл сюди або натисніть для завантаження');

        const dropEvent = {
            preventDefault: jest.fn(),
            dataTransfer: {
                files: null
            }
        };

        fireEvent.drop(dropArea, dropEvent);

        expect(dropEvent.preventDefault).not.toHaveBeenCalled();
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
