import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemberForm, MemberFormProps, MemberFormValues } from './MemberForm';
import { AdminContext } from '../../../../../context/admin-context-provider/AdminContextProvider';
import { TeamCategoriesApi } from '../../../../../services/api/admin/team/team-сategories/team-categories-api';
import axios from 'axios';

jest.mock('../../../../../assets/icons/cloud-download.svg', () => 'cloud-download.svg');
jest.mock('../../../../../assets/icons/chevron-up.svg', () => 'chevron-up.svg');
jest.mock('../../../../../assets/icons/chevron-down.svg', () => 'chevron-down.svg');

const mockAdminContext = {
    client: axios.create(),
    isAuthenticated: true,
    isLoading: false,
    login: jest.fn(),
    logout: jest.fn(),
    refreshAccessToken: jest.fn(),
};

const renderWithAdminContext = (ui: React.ReactElement) => {
    return render(<AdminContext.Provider value={mockAdminContext}>{ui}</AdminContext.Provider>);
};

describe('MemberForm', () => {
    const defaultProps: MemberFormProps = {
        id: 'test-form',
        onSubmit: jest.fn(),
        onValuesChange: jest.fn(),
        existingMemberFormValues: null,
        isDraft: false,
    };

    const mockCategories = [
        { id: 1, name: 'Основна команда', description: 'Test' },
        { id: 2, name: 'Наглядова рада', description: 'Test' },
        { id: 3, name: 'Радники', description: 'Test' },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(TeamCategoriesApi, 'getAll').mockResolvedValue(mockCategories);
    });

    it('renders form with all fields', async () => {
        renderWithAdminContext(<MemberForm {...defaultProps} />);

        await waitFor(() => {
            expect(screen.getByLabelText(/Категорія/)).toBeInTheDocument();
        });
        expect(screen.getByLabelText(/Ім'я та Прізвище/)).toBeInTheDocument();
        expect(screen.getByLabelText(/Опис/)).toBeInTheDocument();
        expect(screen.getByText(/Перетягніть файл сюди або натисніть для завантаження/)).toBeInTheDocument();
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
                size: 0,
            },
        };

        renderWithAdminContext(<MemberForm {...defaultProps} existingMemberFormValues={initialValues} />);

        await waitFor(() => {
            expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
        });
        expect(screen.getByDisplayValue('Test description')).toBeInTheDocument();
    });

    it('updates form values and calls onValuesChange on input change', async () => {
        renderWithAdminContext(<MemberForm {...defaultProps} />);

        const fullNameInput = screen.getByLabelText(/Ім'я та Прізвище/);
        await userEvent.type(fullNameInput, 'Jane Doe');

        await waitFor(() => {
            expect(defaultProps.onValuesChange).toHaveBeenCalledWith(
                expect.objectContaining({
                    fullName: 'Jane Doe',
                }),
            );
        });
    });

    it('updates category and calls onValuesChange', async () => {
        renderWithAdminContext(<MemberForm {...defaultProps} />);

        await waitFor(() => {
            expect(screen.getByRole('option', { name: 'Наглядова рада' })).toBeInTheDocument();
        });

        const categorySelect = screen.getByLabelText(/Категорія/);
        await userEvent.selectOptions(categorySelect, '2');

        await waitFor(() => {
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
    });

    it('updates description and calls onValuesChange', async () => {
        renderWithAdminContext(<MemberForm {...defaultProps} />);

        const descriptionTextarea = screen.getByLabelText('Опис');
        await userEvent.type(descriptionTextarea, 'New description');

        await waitFor(() => {
            expect(defaultProps.onValuesChange).toHaveBeenCalledWith(
                expect.objectContaining({
                    description: 'New description',
                }),
            );
        });
    });

    it('submits form with valid data', async () => {
        const draftProps = {
            ...defaultProps,
            isDraft: true,
            onDraftSubmit: jest.fn(),
        };

        renderWithAdminContext(<MemberForm {...draftProps} />);

        await waitFor(() => {
            expect(screen.getByText(/Радники/)).toBeInTheDocument();
        });

        const categorySelect = screen.getByLabelText(/Категорія/);
        const fullNameInput = screen.getByLabelText(/Ім'я та Прізвище/);
        const descriptionTextarea = screen.getByLabelText(/Опис/);

        await userEvent.selectOptions(categorySelect, '3');
        await userEvent.type(fullNameInput, 'Jane Doe');
        await userEvent.type(descriptionTextarea, 'Test description');

        const form = screen.getByTestId('test-form');
        fireEvent.submit(form);

        await waitFor(() => {
            expect(draftProps.onDraftSubmit).toHaveBeenCalledWith(
                expect.objectContaining({
                    category: {
                        id: 3,
                        name: 'Радники',
                        description: 'Test',
                    },
                    fullName: 'Jane Doe',
                    description: 'Test description',
                }),
            );
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

        const descriptionTextarea = screen.getByLabelText('Опис');
        await userEvent.type(descriptionTextarea, 'Test description');

        expect(screen.getByText('16/200')).toBeInTheDocument();
    });

    it('prevents form submission if required fields are empty', async () => {
        renderWithAdminContext(<MemberForm {...defaultProps} />);

        const form = screen.getByTestId('test-form');
        fireEvent.submit(form);

        await waitFor(() => {
            expect(defaultProps.onSubmit).not.toHaveBeenCalled();
        });
    });

    it('renders with correct input attributes', async () => {
        renderWithAdminContext(<MemberForm {...defaultProps} />);

        const fullNameInput = screen.getByLabelText(/Ім'я та Прізвище/);
        expect(fullNameInput).toHaveAttribute('maxLength', '50');

        const descriptionTextarea = screen.getByLabelText(/Опис/);
        expect(descriptionTextarea).toHaveAttribute('maxLength', '200');
    });

    it('does not call onValuesChange when onValuesChange prop is not provided', async () => {
        const propsWithoutOnValuesChange = {
            ...defaultProps,
            onValuesChange: undefined,
        };

        renderWithAdminContext(<MemberForm {...propsWithoutOnValuesChange} />);

        const fullNameInput = screen.getByLabelText(/Ім'я та Прізвище/);
        await userEvent.type(fullNameInput, 'Jane Doe');

        expect(fullNameInput).toHaveValue('Jane Doe');
    });

    it('handles form submission when memberFormValues exists', async () => {
        const existingValues: MemberFormValues = {
            category: {
                id: 1,
                name: 'Основна команда',
                description: '123',
            },
            fullName: 'John Doe',
            description: 'Test description',
            image: {
                base64: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A',
                mimeType: 'image/jpeg',
                size: 1000,
            },
            imageId: 1,
        };

        renderWithAdminContext(<MemberForm {...defaultProps} existingMemberFormValues={existingValues} />);

        const form = screen.getByTestId('test-form');

        await waitFor(() => {
            expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
        });

        fireEvent.submit(form);

        await waitFor(() => {
            expect(defaultProps.onSubmit).toHaveBeenCalledWith(
                expect.objectContaining({
                    category: {
                        id: 1,
                        name: 'Основна команда',
                        description: '123',
                    },
                    fullName: 'John Doe',
                    description: 'Test description',
                    image: expect.objectContaining({
                        base64: expect.any(String),
                        mimeType: 'image/jpeg',
                        size: 1000,
                    }),
                }),
            );
        });
    });

    it('displays 0 character count when fields are empty', async () => {
        renderWithAdminContext(<MemberForm {...defaultProps} />);

        expect(screen.getByText('0/50')).toBeInTheDocument();
        expect(screen.getByText('0/200')).toBeInTheDocument();
    });

    it('enforces max length for fullName and description', async () => {
        renderWithAdminContext(<MemberForm {...defaultProps} />);

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

    it('does not submit if category is empty', async () => {
        renderWithAdminContext(<MemberForm {...defaultProps} />);

        const fullNameInput = screen.getByLabelText(/Ім'я та Прізвище/);
        const descriptionTextarea = screen.getByLabelText(/Опис/);

        await userEvent.type(fullNameInput, 'Test');
        await userEvent.type(descriptionTextarea, 'Test desc');

        const form = screen.getByTestId('test-form');
        fireEvent.submit(form);

        await waitFor(() => {
            expect(defaultProps.onSubmit).not.toHaveBeenCalled();
        });
    });

    it('does not submit if fullName is empty', async () => {
        renderWithAdminContext(<MemberForm {...defaultProps} />);

        await waitFor(() => {
            expect(screen.getByRole('option', { name: 'Основна команда' })).toBeInTheDocument();
        });

        const categorySelect = screen.getByLabelText(/Категорія/);
        const descriptionTextarea = screen.getByLabelText(/Опис/);

        await userEvent.selectOptions(categorySelect, '1');
        await userEvent.type(descriptionTextarea, 'Test desc');

        const form = screen.getByTestId('test-form');
        fireEvent.submit(form);

        await waitFor(() => {
            expect(defaultProps.onSubmit).not.toHaveBeenCalled();
        });
    });

    it('does not submit if description is empty', async () => {
        renderWithAdminContext(<MemberForm {...defaultProps} />);

        await waitFor(() => {
            expect(screen.getByRole('option', { name: 'Основна команда' })).toBeInTheDocument();
        });

        const categorySelect = screen.getByLabelText(/Категорія/);
        const fullNameInput = screen.getByLabelText(/Ім'я та Прізвище/);

        await userEvent.selectOptions(categorySelect, '1');
        await userEvent.type(fullNameInput, 'Test');

        const form = screen.getByTestId('test-form');
        fireEvent.submit(form);

        await waitFor(() => {
            expect(defaultProps.onSubmit).not.toHaveBeenCalled();
        });
    });

    describe('Draft functionality', () => {
        it('calls onDraftSubmit when isDraft is true', async () => {
            const draftProps = {
                ...defaultProps,
                isDraft: true,
                onDraftSubmit: jest.fn(),
            };

            renderWithAdminContext(<MemberForm {...draftProps} />);

            await waitFor(() => {
                expect(screen.getByRole('option', { name: 'Основна команда' })).toBeInTheDocument();
            });

            const categorySelect = screen.getByLabelText(/Категорія/);
            const fullNameInput = screen.getByLabelText(/Ім'я та Прізвище/);
            const descriptionTextarea = screen.getByLabelText(/Опис/);

            await userEvent.selectOptions(categorySelect, '1');
            await userEvent.type(fullNameInput, 'John Doe');
            await userEvent.type(descriptionTextarea, 'Some description');

            const form = screen.getByTestId('test-form');
            fireEvent.submit(form);

            await waitFor(() => {
                expect(draftProps.onDraftSubmit).toHaveBeenCalledWith(
                    expect.objectContaining({
                        category: {
                            id: 1,
                            name: 'Основна команда',
                            description: 'Test',
                        },
                        fullName: 'John Doe',
                        description: 'Some description',
                    }),
                );
                expect(draftProps.onSubmit).not.toHaveBeenCalled();
            });
        });
    });

    describe('Error handling', () => {
        it('calls onError when categories fetch fails', async () => {
            const errorProps = {
                ...defaultProps,
                onError: jest.fn(),
            };

            jest.spyOn(TeamCategoriesApi, 'getAll').mockRejectedValue(new Error('API Error'));

            renderWithAdminContext(<MemberForm {...errorProps} />);

            await waitFor(() => {
                expect(errorProps.onError).toHaveBeenCalledWith('API Error');
            });
        });
    });

    describe('PhotoInput integration', () => {
        it('handles image change through PhotoInput', async () => {
            renderWithAdminContext(<MemberForm {...defaultProps} />);

            // PhotoInput is rendered as a separate component
            // The actual file handling is tested in PhotoInput component tests
            expect(screen.getByText(/Перетягніть файл сюди або натисніть для завантаження/)).toBeInTheDocument();
        });
    });
});
