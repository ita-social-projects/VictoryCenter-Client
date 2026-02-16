import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { TitleDescriptionCard } from '../TitleDescriptionCard';
import type { TitleDescriptionCardData } from '../TitleDescriptionCardsSection';

import { PROGRAMS_TEXT } from '../../../../../../const/admin/programs';
import { ProgramSectionMode, ProgramSectionTemplate } from '../../../../../..//types/common/program-sections';
import { ContentType } from '../../../../../..//types/common/programs';

import { parseDescriptionList } from '../../../../../..//utils/functions/formatters/text-formatters';
import { useCardValidation } from '../../../../../..//hooks/admin/use-section-card-validation/useCardValidation';

import {
    getProgramSectionTemplateMaxLength,
    getProgramSectionTemplateMinLength,
} from '../../../../../..//utils/functions/program-section-template-validation/programSectionTemplateValidation';

jest.mock('@/utils/functions/formatters/text-formatters', () => ({
    parseDescriptionList: jest.fn(),
}));

jest.mock('@/hooks/admin/use-section-card-validation/useCardValidation', () => ({
    useCardValidation: jest.fn(),
}));

jest.mock('@/utils/functions/program-section-template-validation/programSectionTemplateValidation', () => ({
    getProgramSectionTemplateMaxLength: jest.fn(),
    getProgramSectionTemplateMinLength: jest.fn(),
}));

jest.mock('@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup', () => ({
    InputWithCharacterLimitGroup: ({ value, onChange, onBlur, error, label, ...props }: any) => (
        <div data-testid="input-with-limit">
            <label>{label}</label>
            <input
                {...props}
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                onBlur={onBlur}
                data-testid={`input-${props.id}`}
            />
            <div data-testid={`error-${props.id}`}>{error ?? ''}</div>
        </div>
    ),
}));

jest.mock('../CardDescriptionField', () => ({
    CardDescriptionField: ({ value, onChange, onBlur, error, label, ...props }: any) => (
        <div data-testid="card-description-field">
            <label>{label}</label>
            <textarea
                {...props}
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                onBlur={onBlur}
                data-testid={`textarea-${props.id}`}
            />
            <div data-testid={`error-${props.id}`}>{error ?? ''}</div>
        </div>
    ),
}));

const parseDescriptionListMock = parseDescriptionList as unknown as jest.Mock;
const useCardValidationMock = useCardValidation as unknown as jest.Mock;

const minMock = getProgramSectionTemplateMinLength as unknown as jest.Mock;
const maxMock = getProgramSectionTemplateMaxLength as unknown as jest.Mock;

describe('TitleDescriptionCard', () => {
    const mockCard: TitleDescriptionCardData = {
        title: 'Test Title',
        description: 'Test Description',
    };

    beforeEach(() => {
        jest.clearAllMocks();

        minMock.mockReturnValue(1);
        maxMock.mockReturnValue(50);

        useCardValidationMock.mockImplementation(() => ({
            error: undefined,
            handleChange: jest.fn(),
            handleBlur: jest.fn(),
        }));

        parseDescriptionListMock.mockReturnValue({
            intro: 'Intro',
            items: [],
        });
    });

    it('calls min/max length getters for title and description', () => {
        render(
            <TitleDescriptionCard
                card={mockCard}
                index={0}
                mode={ProgramSectionMode.Edit}
                template={ProgramSectionTemplate.DualTitleDescriptionPairs}
            />,
        );

        expect(minMock).toHaveBeenCalledWith(ProgramSectionTemplate.DualTitleDescriptionPairs, ContentType.Title);
        expect(maxMock).toHaveBeenCalledWith(ProgramSectionTemplate.DualTitleDescriptionPairs, ContentType.Title);

        expect(minMock).toHaveBeenCalledWith(ProgramSectionTemplate.DualTitleDescriptionPairs, ContentType.Description);
        expect(maxMock).toHaveBeenCalledWith(ProgramSectionTemplate.DualTitleDescriptionPairs, ContentType.Description);
    });

    describe('editable mode (Edit/View)', () => {
        it('renders inputs in Edit mode and keeps them enabled', () => {
            render(<TitleDescriptionCard card={mockCard} index={0} mode={ProgramSectionMode.Edit} />);

            expect(screen.getByTestId('input-with-limit')).toBeInTheDocument();
            expect(screen.getByTestId('card-description-field')).toBeInTheDocument();

            expect(screen.getByTestId('input-card-title-0')).not.toBeDisabled();
            expect(screen.getByTestId('textarea-card-description-0')).not.toBeDisabled();
        });

        it('renders inputs in View mode and disables them', () => {
            render(<TitleDescriptionCard card={mockCard} index={0} mode={ProgramSectionMode.View} />);

            expect(screen.getByTestId('input-with-limit')).toBeInTheDocument();
            expect(screen.getByTestId('card-description-field')).toBeInTheDocument();

            expect(screen.getByTestId('input-card-title-0')).toBeDisabled();
            expect(screen.getByTestId('textarea-card-description-0')).toBeDisabled();
        });

        it('shows values in inputs and calls hook blur handlers', () => {
            const titleBlur = jest.fn();
            const descBlur = jest.fn();

            useCardValidationMock
                .mockImplementationOnce(() => ({
                    error: undefined,
                    handleChange: jest.fn(),
                    handleBlur: titleBlur,
                }))
                .mockImplementationOnce(() => ({
                    error: undefined,
                    handleChange: jest.fn(),
                    handleBlur: descBlur,
                }));

            render(<TitleDescriptionCard card={mockCard} index={0} mode={ProgramSectionMode.Edit} />);

            expect(screen.getByTestId('input-card-title-0')).toHaveValue('Test Title');
            expect(screen.getByTestId('textarea-card-description-0')).toHaveValue('Test Description');

            fireEvent.blur(screen.getByTestId('input-card-title-0'));
            fireEvent.blur(screen.getByTestId('textarea-card-description-0'));

            expect(titleBlur).toHaveBeenCalledTimes(1);
            expect(descBlur).toHaveBeenCalledTimes(1);
        });

        it('shows validation errors from hook (title + description)', () => {
            useCardValidationMock
                .mockImplementationOnce(() => ({
                    error: 'TITLE_ERR',
                    handleChange: jest.fn(),
                    handleBlur: jest.fn(),
                }))
                .mockImplementationOnce(() => ({
                    error: 'DESC_ERR',
                    handleChange: jest.fn(),
                    handleBlur: jest.fn(),
                }));

            render(<TitleDescriptionCard card={mockCard} index={0} mode={ProgramSectionMode.Edit} />);

            expect(screen.getByTestId('error-card-title-0')).toHaveTextContent('TITLE_ERR');
            expect(screen.getByTestId('error-card-description-0')).toHaveTextContent('DESC_ERR');
        });
    });

    describe('published mode', () => {
        it('does not render inputs and shows title as heading', () => {
            render(<TitleDescriptionCard card={mockCard} index={0} mode={ProgramSectionMode.Published} />);

            expect(screen.queryByTestId('input-with-limit')).not.toBeInTheDocument();
            expect(screen.queryByTestId('card-description-field')).not.toBeInTheDocument();

            expect(screen.getByText('Test Title')).toBeInTheDocument();
        });

        it('shows default title when empty', () => {
            render(
                <TitleDescriptionCard
                    card={{ title: '', description: 'Any' }}
                    index={0}
                    mode={ProgramSectionMode.Published}
                />,
            );

            expect(screen.getByText(PROGRAMS_TEXT.SECTION.CARD.FORM.TITLE.TEXT)).toBeInTheDocument();
        });

        it('renders intro paragraph when parseDescriptionList returns intro', () => {
            parseDescriptionListMock.mockReturnValueOnce({ intro: 'Intro text', items: [] });

            render(<TitleDescriptionCard card={mockCard} index={0} mode={ProgramSectionMode.Published} />);

            expect(screen.getByText('Intro text')).toBeInTheDocument();
        });

        it('renders list when parseDescriptionList returns items', () => {
            parseDescriptionListMock.mockReturnValueOnce({ intro: null, items: ['Item 1', 'Item 2'] });

            render(<TitleDescriptionCard card={mockCard} index={0} mode={ProgramSectionMode.Published} />);

            expect(screen.getByText('Item 1')).toBeInTheDocument();
            expect(screen.getByText('Item 2')).toBeInTheDocument();
        });

        it('renders both intro and items when both are present', () => {
            parseDescriptionListMock.mockReturnValueOnce({ intro: 'Intro X', items: ['I1'] });

            render(<TitleDescriptionCard card={mockCard} index={0} mode={ProgramSectionMode.Published} />);

            expect(screen.getByText('Intro X')).toBeInTheDocument();
            expect(screen.getByText('I1')).toBeInTheDocument();
        });

        it('renders default description text when no intro and no items', () => {
            parseDescriptionListMock.mockReturnValueOnce({ intro: null, items: [] });

            render(<TitleDescriptionCard card={mockCard} index={0} mode={ProgramSectionMode.Published} />);

            expect(screen.getByText(PROGRAMS_TEXT.SECTION.FORM.DESCRIPTION.TEXT)).toBeInTheDocument();
        });
    });

    describe('callbacks via validation hook', () => {
        it('onTitleChange called with (index, value) when hook triggers change', async () => {
            const onTitleChangeMock = jest.fn();

            useCardValidationMock.mockImplementation(({ onChange }: any) => ({
                error: undefined,
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

            await userEvent.type(screen.getByTestId('input-card-title-5'), 'A');

            expect(onTitleChangeMock).toHaveBeenCalledWith(5, 'Test TitleA');
        });

        it('onDescriptionChange called with (index, value) when hook triggers change', async () => {
            const onDescriptionChangeMock = jest.fn();

            useCardValidationMock
                .mockImplementationOnce(() => ({
                    error: undefined,
                    handleChange: jest.fn(),
                    handleBlur: jest.fn(),
                }))
                .mockImplementationOnce(({ onChange }: any) => ({
                    error: undefined,
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

            await userEvent.type(screen.getByTestId('textarea-card-description-0'), 'B');

            expect(onDescriptionChangeMock).toHaveBeenCalledWith(0, 'Test DescriptionB');
        });
    });
});
