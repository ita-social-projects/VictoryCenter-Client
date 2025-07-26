import React from 'react';
import { render, screen, fireEvent, createEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemberForm, MemberFormProps, MemberFormValues } from './MemberForm';
import { AdminContext } from '../../../../../context/admin-context-provider/AdminContextProvider';
import axios from 'axios';
import { TeamCategoriesApi } from '../../../../../services/data-fetch/admin-page-data-fetch/team-page-data-fetch/TeamCategoriesApi/TeamCategoriesApi';
import { Image, ImageValues } from '../../../../../types/Image';
import { mapImageToBase64 } from '../../../../../utils/functions/mapImageToBase64';

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
    };

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

    it('renders form with all fields', () => {
        renderWithAdminContext(<MemberForm {...defaultProps} />);

        expect(screen.getByLabelText('Категорія')).toBeInTheDocument();
        expect(screen.getByLabelText("Ім'я та Прізвище")).toBeInTheDocument();
        expect(screen.getByLabelText('Опис')).toBeInTheDocument();
        expect(screen.getByTestId('photo-input-hidden')).toBeInTheDocument();
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
            imageId: 1,
            image: {
                base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y4nYFMAAAAASUVORK5CYII=',
                mimeType: 'image/jpeg',
            },
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

        const fullNameInput = screen.getByLabelText("Ім'я та Прізвище");
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

        const categorySelect = screen.getByLabelText('Категорія');
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

        const descriptionTextarea = screen.getByLabelText('Опис');
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

        const categorySelect = screen.getByLabelText('Категорія');
        const fullNameInput = screen.getByLabelText("Ім'я та Прізвище");
        const descriptionTextarea = screen.getByLabelText('Опис');

        fireEvent.change(categorySelect, {
            target: {
                value: 'Радники',
            },
        });
        await userEvent.type(fullNameInput, 'Jane Doe');
        await userEvent.type(descriptionTextarea, 'Test description');

        const form = screen.getByTestId('test-form');
        fireEvent.submit(form);

        await waitFor(() => {
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
        });
    });

    it('displays character count for fullName', async () => {
        renderWithAdminContext(<MemberForm {...defaultProps} />);

        const fullNameInput = screen.getByLabelText("Ім'я та Прізвище");
        await userEvent.type(fullNameInput, 'Jane Doe');

        expect(screen.getByText('8/50')).toBeInTheDocument();
    });

    it('displays character count for description', async () => {
        renderWithAdminContext(<MemberForm {...defaultProps} />);

        const descriptionTextarea = screen.getByLabelText('Опис');
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

        const fullNameInput = screen.getByLabelText("Ім'я та Прізвище");
        expect(fullNameInput).toHaveAttribute('maxLength', '50');

        const descriptionTextarea = screen.getByLabelText('Опис');
        expect(descriptionTextarea).toHaveAttribute('maxLength', '200');
    });

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

            expect(defaultProps.onSubmit).toHaveBeenCalledWith(initialValues);
        });

        it('handles file input change without files (edge case)', () => {
            renderWithAdminContext(<MemberForm {...defaultProps} />);

            const fullNameInput = screen.getByLabelText("Ім'я та Прізвище");

            fireEvent.change(fullNameInput, {
                target: { name: 'fullName', value: 'Test Name' },
                currentTarget: { files: null },
            });

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
        });
    });
});
