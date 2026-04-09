import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import { TitleDescriptionCard } from '../TitleDescriptionCard';
import type { TitleDescriptionCardData } from '../TitleDescriptionCardsSection';

import { PROGRAMS_TEXT } from '../../../../../../const/admin/programs';
import { SECTIONS_TEXT } from '../../../../../../const/admin/sections';
import { SectionMode, SectionTemplate } from '../../../../../../types/common/sections';
import { ContentType } from '../../../../../../types/common/section-contents';

import { parseDescriptionList } from '../../../../../../utils/functions/formatters/text-formatters';
import { useCardValidation } from '../../../../../../hooks/admin/use-section-card-validation/useCardValidation';
import {
    getSectionTemplateMaxLength,
    getSectionTemplateMinLength,
} from '../../../../../../utils/functions/section-template-validation/sectionTemplateValidation';

jest.mock('@/utils/functions/formatters/text-formatters', () => ({
    parseDescriptionList: jest.fn(),
}));

jest.mock('@/hooks/admin/use-section-card-validation/useCardValidation', () => ({
    useCardValidation: jest.fn(),
}));

jest.mock('@/utils/functions/section-template-validation/sectionTemplateValidation', () => ({
    getSectionTemplateMaxLength: jest.fn(),
    getSectionTemplateMinLength: jest.fn(),
}));

jest.mock('@/const/admin/programs', () => ({
    PROGRAMS_TEXT: {
        SECTION: {
            FORM: {
                DESCRIPTION: { TEXT: 'DEFAULT_DESC' },
            },
            CARD: {
                FORM: {
                    TITLE: { TEXT: 'DEFAULT_TITLE', PLACEHOLDER: 'TITLE_PH' },
                    DESCRIPTION: { TEXT: 'DESC_LABEL', PLACEHOLDER: 'DESC_PH' },
                },
            },
        },
    },
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

const minMock = getSectionTemplateMinLength as unknown as jest.Mock;
const maxMock = getSectionTemplateMaxLength as unknown as jest.Mock;

const TEMPLATE = SectionTemplate.DualTitleDescriptionPairs;

const baseCard: TitleDescriptionCardData = {
    title: 'Test Title',
    description: 'Test Description',
};

const mockValidationPassThrough = () => {
    useCardValidationMock.mockImplementation(({ onChange }: any) => ({
        error: undefined,
        handleChange: (v: string) => onChange?.(v),
        handleBlur: jest.fn(),
    }));
};

const renderCard = (overrides: Partial<React.ComponentProps<typeof TitleDescriptionCard>> = {}) => {
    const props: React.ComponentProps<typeof TitleDescriptionCard> = {
        card: baseCard,
        index: 0,
        template: TEMPLATE,
        ...overrides,
    };
    return render(<TitleDescriptionCard {...props} />);
};

describe('TitleDescriptionCard', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        minMock.mockReturnValue(1);
        maxMock.mockReturnValue(50);
        mockValidationPassThrough();
        parseDescriptionListMock.mockReturnValue({ intro: 'Intro', items: [] });
    });

    it('calls min/max length getters for title and description', () => {
        renderCard({ mode: SectionMode.Edit, template: TEMPLATE });

        expect(minMock).toHaveBeenCalledWith(TEMPLATE, ContentType.Title);
        expect(maxMock).toHaveBeenCalledWith(TEMPLATE, ContentType.Title);
        expect(minMock).toHaveBeenCalledWith(TEMPLATE, ContentType.Description);
        expect(maxMock).toHaveBeenCalledWith(TEMPLATE, ContentType.Description);
    });

    it('passes correct config into useCardValidation (title + description)', () => {
        renderCard({ mode: SectionMode.Edit, validationResetKey: 123 });

        expect(useCardValidationMock).toHaveBeenCalledTimes(2);

        const call1 = useCardValidationMock.mock.calls[0][0];
        const call2 = useCardValidationMock.mock.calls[1][0];

        expect(call1).toEqual(
            expect.objectContaining({
                value: baseCard.title,
                min: 1,
                max: 50,
                required: true,
                resetKey: 123,
            }),
        );

        expect(call2).toEqual(
            expect.objectContaining({
                value: baseCard.description,
                min: 1,
                max: 50,
                required: true,
                resetKey: 123,
            }),
        );
    });

    describe('editable mode (Edit/View)', () => {
        it('renders inputs in Edit mode and keeps them enabled', () => {
            renderCard({ mode: SectionMode.Edit });

            expect(screen.getByTestId('input-with-limit')).toBeInTheDocument();
            expect(screen.getByTestId('card-description-field')).toBeInTheDocument();

            expect(screen.getByTestId(/input-.*-card-title-0/)).not.toBeDisabled();
            expect(screen.getByTestId(/textarea-.*-card-description-0/)).not.toBeDisabled();
        });

        it('shows values in inputs and calls hook blur handlers', () => {
            const titleBlur = jest.fn();
            const descBlur = jest.fn();

            useCardValidationMock
                .mockImplementationOnce(({ onChange }: any) => ({
                    error: undefined,
                    handleChange: (v: string) => onChange?.(v),
                    handleBlur: titleBlur,
                }))
                .mockImplementationOnce(({ onChange }: any) => ({
                    error: undefined,
                    handleChange: (v: string) => onChange?.(v),
                    handleBlur: descBlur,
                }));

            renderCard({ mode: SectionMode.Edit });

            const titleInput = screen.getByTestId(/input-.*-card-title-0/);
            const descTextarea = screen.getByTestId(/textarea-.*-card-description-0/);

            expect(titleInput).toHaveValue('Test Title');
            expect(descTextarea).toHaveValue('Test Description');

            fireEvent.blur(titleInput);
            fireEvent.blur(descTextarea);

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

            renderCard({ mode: SectionMode.Edit });

            expect(screen.getByTestId(/error-.*-card-title-0/)).toHaveTextContent('TITLE_ERR');
            expect(screen.getByTestId(/error-.*-card-description-0/)).toHaveTextContent('DESC_ERR');
        });

        it('calls parseDescriptionList even in Edit mode (it is computed before the branch)', () => {
            renderCard({ mode: SectionMode.Edit });
            expect(parseDescriptionListMock).toHaveBeenCalledWith(baseCard.description);
        });

        it('calls onTitleChange and onDescriptionChange with (index, value) via hook change handlers', () => {
            const onTitleChange = jest.fn();
            const onDescriptionChange = jest.fn();

            renderCard({
                mode: SectionMode.Edit,
                index: 5,
                onTitleChange,
                onDescriptionChange,
            });

            fireEvent.change(screen.getByTestId(/input-.*-card-title-5/), { target: { value: 'NEW_TITLE' } });
            fireEvent.change(screen.getByTestId(/textarea-.*-card-description-5/), { target: { value: 'NEW_DESC' } });

            expect(onTitleChange).toHaveBeenCalledWith(5, 'NEW_TITLE');
            expect(onDescriptionChange).toHaveBeenCalledWith(5, 'NEW_DESC');
        });
    });

    describe('published mode', () => {
        it('does not render inputs and shows title as heading', () => {
            parseDescriptionListMock.mockReturnValueOnce({ intro: 'Intro text', items: [] });

            renderCard({ mode: SectionMode.View });

            expect(screen.queryByTestId('input-with-limit')).not.toBeInTheDocument();
            expect(screen.queryByTestId('card-description-field')).not.toBeInTheDocument();
        });

        it('should display title as heading', () => {
            render(
                <TitleDescriptionCard card={baseCard} index={0} mode={SectionMode.View} template={TEMPLATE} />,
            );

            expect(screen.getByText('Test Title')).toBeInTheDocument();
        });

        it('should display default title when empty', () => {
            render(
                <TitleDescriptionCard
                    card={{ title: '', description: 'Description' }}
                    index={0}
                    mode={SectionMode.View}
                    template={TEMPLATE}
                />,
            );

            expect(screen.getByText('DEFAULT_TITLE')).toBeInTheDocument();
        });

        it('should display parsed description intro', () => {
            parseDescriptionListMock.mockReturnValue({
                intro: 'Intro text',
                items: [],
            });

            render(
                <TitleDescriptionCard card={baseCard} index={0} mode={SectionMode.View} template={TEMPLATE} />,
            );

            expect(screen.getByText('Intro text')).toBeInTheDocument();
        });

        it('shows default title when empty', () => {
            renderCard({
                mode: SectionMode.View,
                card: { title: '', description: 'Any' },
            });

            expect(
                screen.getByRole('heading', { level: 3, name: PROGRAMS_TEXT.SECTION.CARD.FORM.TITLE.TEXT }),
            ).toBeInTheDocument();
        });

        it('renders list when parseDescriptionList returns items (no intro)', () => {
            parseDescriptionListMock.mockReturnValueOnce({ intro: null, items: ['Item 1', 'Item 2'] });

            renderCard({ mode: SectionMode.View });

            expect(screen.getByText('Item 1')).toBeInTheDocument();
            expect(screen.getByText('Item 2')).toBeInTheDocument();
        });

        it('renders both intro and items when both are present', () => {
            parseDescriptionListMock.mockReturnValueOnce({ intro: 'Intro X', items: ['I1'] });

            renderCard({ mode: SectionMode.View });

            expect(screen.getByText('Intro X')).toBeInTheDocument();
            expect(screen.getByText('I1')).toBeInTheDocument();
        });

        it('renders default description text when no intro and no items', () => {
            parseDescriptionListMock.mockReturnValueOnce({ intro: null, items: [] });

            renderCard({ mode: SectionMode.View });

            expect(screen.getByText(SECTIONS_TEXT.SECTION.FORM.DESCRIPTION.TEXT)).toBeInTheDocument();
        });
    });
});
