import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SingleTitleQuintupleDescription } from './SingleTitleQuintupleDescription';
import { SectionMode } from '@/types/common/sections';

const mockDescProps = jest.fn();

jest.mock('@/utils/functions/section-template-validation/sectionTemplateValidation', () => ({
    getSectionTemplateMaxLength: jest.fn(() => 50),
}));

jest.mock('@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup', () => ({
    InputWithCharacterLimitGroup: ({ value, onChange, id, showCounterBelow }: any) => (
        <div data-testid={`group-${id}`} data-show-counter-below={String(showCounterBelow)}>
            <input data-testid={`input-${id}`} value={value} onChange={onChange} />
        </div>
    ),
}));

jest.mock(
    '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup',
    () => ({
        TextAreaWithCharacterLimitGroup: (props: any) => {
            mockDescProps(props);
            const { value, onChange, id } = props;
            return <textarea data-testid={`input-${id}`} value={value} onChange={onChange} />;
        },
    }),
);

jest.mock('@/const/admin/programs', () => ({
    PROGRAMS_TEXT: {
        SECTION: {
            FORM: {
                TITLE: { TEXT: 'Title', PLACEHOLDER: 'Title placeholder' },
                DESCRIPTION: { TEXT: 'Description' },
            },
        },
    },
    SINGLE_TITLE_QUINTUPLE_DESCRIPTION_CONFIG: {
        descriptionsCount: 5,
    },
}));

jest.mock('@/validation/admin/program-schema/program-schema', () => ({
    PROGRAM_SECTION_VALIDATION_FUNCTIONS: {
        validateSectionTitle: jest.fn(() => undefined),
        validateSectionDescription: jest.fn(() => undefined),
    },
}));

const setup = (props: React.ComponentProps<typeof SingleTitleQuintupleDescription> = {}) => {
    mockDescProps.mockClear();
    return render(<SingleTitleQuintupleDescription {...props} />);
};

const getRoot = (container: HTMLElement) => container.firstElementChild as HTMLElement;
const getPreviewTexts = (container: HTMLElement) =>
    Array.from(container.querySelectorAll('p')).map((p) => p.textContent);

const getDescCallIds = () => mockDescProps.mock.calls.slice(0, 5).map((call: any[]) => call[0]?.id);

describe('SingleTitleQuintupleDescription', () => {
    describe('Preview', () => {
        it('renders h2', () => {
            setup();
            expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
        });

        it('normalizes descriptions to 5', () => {
            const { container } = setup({ descriptions: ['D0'] });
            expect(getPreviewTexts(container)).toHaveLength(5);
        });

        it('fills null/undefined gaps with empty strings', () => {
            const { container } = setup({ descriptions: ['D0', undefined as any, 'D2', null as any] });
            expect(getPreviewTexts(container)).toEqual(['D0', '', 'D2', '', '']);
        });

        it('does not render editable inputs', () => {
            setup();
            expect(screen.queryByTestId('input-single-title-quintuple-title')).not.toBeInTheDocument();
            expect(screen.queryByTestId('input-single-title-quintuple-desc-0')).not.toBeInTheDocument();
        });

        it('applies template class when mode is Template', () => {
            const { container } = setup({ mode: SectionMode.Template });
            expect(getRoot(container)).toHaveClass('template');
        });

        it('applies custom className on root', () => {
            const { container } = setup({ className: 'custom-root' });
            expect(getRoot(container)).toHaveClass('custom-root');
        });
    });

    describe('Editable', () => {
        it('does not render preview h2', () => {
            setup({ mode: SectionMode.Edit });
            expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument();
        });

        it('renders title input', () => {
            setup({ mode: SectionMode.Edit, title: 'Edit' });
            expect(screen.getByTestId('input-single-title-quintuple-title')).toHaveValue('Edit');
            expect(screen.getByTestId('group-single-title-quintuple-title')).toHaveAttribute(
                'data-show-counter-below',
                'true',
            );
        });

        it('renders 5 description inputs', () => {
            setup({ mode: SectionMode.Edit });
            expect(screen.getAllByTestId(/input-single-title-quintuple-desc-/)).toHaveLength(5);
        });

        it('uses editable order (0,1,2,3,4)', () => {
            setup({ mode: SectionMode.Edit });
            expect(getDescCallIds()).toEqual([
                'single-title-quintuple-desc-0',
                'single-title-quintuple-desc-1',
                'single-title-quintuple-desc-2',
                'single-title-quintuple-desc-3',
                'single-title-quintuple-desc-4',
            ]);
        });

        it('binds normalized values by index', () => {
            setup({ mode: SectionMode.Edit, descriptions: ['A'] });
            expect(screen.getByTestId('input-single-title-quintuple-desc-0')).toHaveValue('A');
            expect(screen.getByTestId('input-single-title-quintuple-desc-4')).toHaveValue('');
        });

        it('calls onTitleChange with value', () => {
            const onTitleChange = jest.fn();
            setup({ mode: SectionMode.Edit, onTitleChange });

            fireEvent.change(screen.getByTestId('input-single-title-quintuple-title'), { target: { value: 'X' } });

            expect(onTitleChange).toHaveBeenCalledWith('X');
        });

        it('calls onDescriptionsChange with index and value', () => {
            const onDescriptionsChange = jest.fn();
            setup({ mode: SectionMode.Edit, onDescriptionsChange });

            fireEvent.change(screen.getByTestId('input-single-title-quintuple-desc-3'), { target: { value: 'Y' } });

            expect(onDescriptionsChange).toHaveBeenCalledWith(3, 'Y');
        });

        it('does not crash without handlers', () => {
            setup({ mode: SectionMode.Edit });

            fireEvent.change(screen.getByTestId('input-single-title-quintuple-title'), { target: { value: 'X' } });
            fireEvent.change(screen.getByTestId('input-single-title-quintuple-desc-0'), { target: { value: 'Y' } });

            expect(true).toBe(true);
        });

        it('applies editable class for Edit mode only', () => {
            const { container: editContainer } = setup({ mode: SectionMode.Edit });
            expect(getRoot(editContainer)).toHaveClass('editable');

            const { container: viewContainer } = setup({ mode: SectionMode.View });
            expect(getRoot(viewContainer)).not.toHaveClass('editable');
        });

        it('does not apply template class when mode is Edit', () => {
            const { container } = setup({ mode: SectionMode.Edit });
            expect(getRoot(container)).not.toHaveClass('template');
        });
    });
});
