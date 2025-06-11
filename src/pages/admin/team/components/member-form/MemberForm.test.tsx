import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemberForm, MemberFormProps, MemberFormValues } from './MemberForm';

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
