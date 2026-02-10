import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { TitleDescriptionCard } from '../TitleDescriptionCard';
import { TitleDescriptionCardData } from '../TitleDescriptionCardsSection';
import { ProgramSectionMode } from '../../../../../../types/common/program-sections';
import * as textFormatters from '../../../../../../utils/functions/formatters/text-formatters';
import * as useCardValidationModule from '../../../../../../hooks/admin/use-section-card-validation/useCardValidation';

jest.mock('@/utils/functions/formatters/text-formatters');
jest.mock('@/hooks/admin/use-section-card-validation/useCardValidation');
jest.mock('@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup', () => ({
    InputWithCharacterLimitGroup: ({ value, onChange, onBlur, error, label, isRequired, ...props }: any) => (
        <div data-testid="input-with-limit">
            <label>{label}</label>
            <input
                {...props}
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                onBlur={onBlur}
                data-testid={`input-${props.id}`}
            />
            {error && <span data-testid="title-error">{error}</span>}
        </div>
    ),
}));

jest.mock('../CardDescriptionField', () => ({
    CardDescriptionField: ({ value, onChange, onBlur, error, label, isRequired, ...props }: any) => (
        <div data-testid="card-description-field">
            <label>{label}</label>
            <textarea
                {...props}
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                onBlur={onBlur}
                data-testid={`textarea-${props.id}`}
            />
            {error && <span data-testid="description-error">{error}</span>}
        </div>
    ),
}));

describe('TitleDescriptionCard', () => {
    const mockCard: TitleDescriptionCardData = {
        title: 'Test Title',
        description: 'Test Description',
    };

    beforeEach(() => {
        jest.clearAllMocks();

        (useCardValidationModule.useCardValidation as jest.Mock).mockImplementation(() => ({
            error: null,
            handleChange: jest.fn(),
            handleBlur: jest.fn(),
        }));

        (textFormatters.parseDescriptionList as jest.Mock).mockReturnValue({
            intro: 'Test Description',
            items: [],
        });
    });

    describe('editable mode', () => {
        it('should render input fields in editable mode', () => {
            render(<TitleDescriptionCard card={mockCard} index={0} mode={ProgramSectionMode.Edit} />);

            expect(screen.getByTestId('input-with-limit')).toBeInTheDocument();
            expect(screen.getByTestId('card-description-field')).toBeInTheDocument();
        });

        it('should display title and description values in inputs', () => {
            render(<TitleDescriptionCard card={mockCard} index={0} mode={ProgramSectionMode.Edit} />);

            expect((screen.getByTestId('input-card-title-0') as HTMLInputElement).value).toBe('Test Title');
            expect((screen.getByTestId('textarea-card-description-0') as HTMLTextAreaElement).value).toBe(
                'Test Description',
            );
        });

        it('should display validation errors', () => {
            (useCardValidationModule.useCardValidation as jest.Mock).mockImplementationOnce(() => ({
                error: 'Title is required',
                handleChange: jest.fn(),
                handleBlur: jest.fn(),
            }));

            render(<TitleDescriptionCard card={mockCard} index={0} mode={ProgramSectionMode.Edit} />);

            expect(screen.getByText('Title is required')).toBeInTheDocument();
        });
    });

    describe('read-only mode', () => {
        it('should not render input fields in read-only mode', () => {
            render(<TitleDescriptionCard card={mockCard} index={0} mode={ProgramSectionMode.Published} />);

            expect(screen.queryByTestId('input-with-limit')).not.toBeInTheDocument();
            expect(screen.queryByTestId('card-description-field')).not.toBeInTheDocument();
        });

        it('should display title as heading', () => {
            render(<TitleDescriptionCard card={mockCard} index={0} mode={ProgramSectionMode.Published} />);

            expect(screen.getByText('Test Title')).toBeInTheDocument();
        });

        it('should display default title when empty', () => {
            render(
                <TitleDescriptionCard
                    card={{ title: '', description: 'Description' }}
                    index={0}
                    mode={ProgramSectionMode.Published}
                />,
            );

            expect(screen.getByText('Заголовок')).toBeInTheDocument();
        });

        it('should display parsed description intro', () => {
            (textFormatters.parseDescriptionList as jest.Mock).mockReturnValue({
                intro: 'Intro text',
                items: [],
            });

            render(<TitleDescriptionCard card={mockCard} index={0} mode={ProgramSectionMode.Published} />);

            expect(screen.getByText('Intro text')).toBeInTheDocument();
        });

        it('should display description list items', () => {
            (textFormatters.parseDescriptionList as jest.Mock).mockReturnValue({
                intro: null,
                items: ['Item 1', 'Item 2'],
            });

            render(<TitleDescriptionCard card={mockCard} index={0} mode={ProgramSectionMode.Published} />);

            expect(screen.getByText('Item 1')).toBeInTheDocument();
            expect(screen.getByText('Item 2')).toBeInTheDocument();
        });

        it('should display default description when no content', () => {
            (textFormatters.parseDescriptionList as jest.Mock).mockReturnValue({
                intro: null,
                items: [],
            });

            render(<TitleDescriptionCard card={mockCard} index={0} mode={ProgramSectionMode.Published} />);

            expect(screen.getByText('Опис секції')).toBeInTheDocument();
        });
    });

    describe('callbacks', () => {
        it('should handle title change', async () => {
            const mockHandleChange = jest.fn();

            (useCardValidationModule.useCardValidation as jest.Mock).mockImplementationOnce(() => ({
                error: null,
                handleChange: mockHandleChange,
                handleBlur: jest.fn(),
            }));

            render(<TitleDescriptionCard card={mockCard} index={0} mode={ProgramSectionMode.Edit} />);

            const titleInput = screen.getByTestId('input-card-title-0');
            await userEvent.type(titleInput, 'New');

            expect(mockHandleChange).toHaveBeenCalled();
        });

        it('should handle description change', async () => {
            const mockHandleChange = jest.fn();

            (useCardValidationModule.useCardValidation as jest.Mock)
                .mockImplementationOnce(() => ({
                    error: null,
                    handleChange: jest.fn(),
                    handleBlur: jest.fn(),
                }))
                .mockImplementationOnce(() => ({
                    error: null,
                    handleChange: mockHandleChange,
                    handleBlur: jest.fn(),
                }));

            render(<TitleDescriptionCard card={mockCard} index={0} mode={ProgramSectionMode.Edit} />);

            const descriptionInput = screen.getByTestId('textarea-card-description-0');
            await userEvent.type(descriptionInput, 'New');

            expect(mockHandleChange).toHaveBeenCalled();
        });

        it('should call onTitleChange when validation hook triggers change', async () => {
            const onTitleChangeMock = jest.fn();

            (useCardValidationModule.useCardValidation as jest.Mock).mockImplementation(({ onChange }) => ({
                error: null,
                handleChange: (v: string) => onChange(v),
                handleBlur: jest.fn(),
            }));

            render(
                <TitleDescriptionCard
                    card={mockCard}
                    index={5}
                    mode={ProgramSectionMode.Edit}
                    onTitleChange={onTitleChangeMock}
                />,
            );

            const titleInput = screen.getByTestId('input-card-title-5');
            await userEvent.type(titleInput, 'A');

            expect(onTitleChangeMock).toHaveBeenCalledWith(5, 'Test TitleA');
        });

        it('should call onDescriptionChange when validation hook triggers change', async () => {
            const onDescriptionChangeMock = jest.fn();

            (useCardValidationModule.useCardValidation as jest.Mock)
                .mockReturnValueOnce({ error: null, handleChange: jest.fn(), handleBlur: jest.fn() })
                .mockImplementationOnce(({ onChange }) => ({
                    error: null,
                    handleChange: (v: string) => onChange(v),
                    handleBlur: jest.fn(),
                }));

            render(
                <TitleDescriptionCard
                    card={mockCard}
                    index={0}
                    mode={ProgramSectionMode.Edit}
                    onDescriptionChange={onDescriptionChangeMock}
                />,
            );

            const descriptionInput = screen.getByTestId('textarea-card-description-0');
            await userEvent.type(descriptionInput, 'B');

            expect(onDescriptionChangeMock).toHaveBeenCalledWith(0, 'Test DescriptionB');
        });
    });
});
