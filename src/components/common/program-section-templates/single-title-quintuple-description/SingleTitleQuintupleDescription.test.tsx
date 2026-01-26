import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SingleTitleQuintupleDescription } from './SingleTitleQuintupleDescription';

jest.mock('@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup', () => ({
    InputWithCharacterLimitGroup: ({ value, onChange, id, placeholder }: any) => (
        <input data-testid={`input-${id}`} value={value} onChange={onChange} placeholder={placeholder} />
    ),
}));

jest.mock(
    '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup',
    () => ({
        TextAreaWithCharacterLimitGroup: ({ value, onChange, id }: any) => (
            <textarea data-testid={`input-${id}`} value={value} onChange={onChange} />
        ),
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
    PROGRAM_SECTION_VALIDATION: {
        title: { max: 100 },
        description: { max: 200 },
    },
    SINGLE_TITLE_QUINTUPLE_DESCRIPTION_CONFIG: {
        descriptionsCount: 5,
    },
}));

describe('SingleTitleQuintupleDescription', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Preview mode', () => {
        it('should render empty title and 5 empty descriptions by default', () => {
            const { container } = render(<SingleTitleQuintupleDescription />);

            expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();

            const paragraphs = container.querySelectorAll('p');
            expect(paragraphs).toHaveLength(5);
            expect(paragraphs[0].textContent).toBe('');
        });

        it('should render title in preview', () => {
            render(<SingleTitleQuintupleDescription title="Preview Title" />);

            expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Preview Title');
        });

        it('should not render editable inputs in preview mode', () => {
            render(<SingleTitleQuintupleDescription title="Preview Title" descriptions={['A']} />);

            expect(screen.queryByTestId('input-single-title-quintuple-title')).not.toBeInTheDocument();
            expect(screen.queryByTestId('input-single-title-quintuple-desc-0')).not.toBeInTheDocument();
        });

        it('should normalize descriptions to 5 items and keep correct order in preview', () => {
            const { container } = render(
                <SingleTitleQuintupleDescription
                    title="T"
                    descriptions={['D0', undefined as any, 'D2', null as any]}
                />,
            );

            const paragraphs = Array.from(container.querySelectorAll('p'));
            expect(paragraphs).toHaveLength(5);

            expect(paragraphs[0].textContent).toBe('D0');
            expect(paragraphs[1].textContent).toBe('');
            expect(paragraphs[2].textContent).toBe('D2');
            expect(paragraphs[3].textContent).toBe('');
            expect(paragraphs[4].textContent).toBe('');
        });

        it('should apply template class when isTemplate is true and isEditable is false', () => {
            const { container } = render(<SingleTitleQuintupleDescription isTemplate={true} />);

            expect(container.firstChild).toHaveClass('template');
        });

        it('should include custom className on root element', () => {
            const { container } = render(<SingleTitleQuintupleDescription className="custom-root" />);

            expect(container.firstChild).toHaveClass('custom-root');
        });
    });

    describe('Editable mode', () => {
        it('should render title input and 5 description textareas when isEditable is true', () => {
            render(<SingleTitleQuintupleDescription isEditable={true} title="Edit Title" descriptions={['A']} />);

            expect(screen.getByTestId('input-single-title-quintuple-title')).toHaveValue('Edit Title');

            const textareas = screen.getAllByTestId(/input-single-title-quintuple-desc-/);
            expect(textareas).toHaveLength(5);

            expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument();
        });

        it('should render description inputs in editable order (1, 2, 0, 3, 4)', () => {
            render(<SingleTitleQuintupleDescription isEditable={true} />);

            const inputs = screen.getAllByTestId(/input-single-title-quintuple-desc-/);
            const ids = inputs.map((el) => el.getAttribute('data-testid'));

            expect(ids).toEqual([
                'input-single-title-quintuple-desc-1',
                'input-single-title-quintuple-desc-2',
                'input-single-title-quintuple-desc-0',
                'input-single-title-quintuple-desc-3',
                'input-single-title-quintuple-desc-4',
            ]);
        });

        it('should normalize descriptions in editable mode and bind values by index', () => {
            render(<SingleTitleQuintupleDescription isEditable={true} descriptions={['D0', 'D1']} />);

            expect(screen.getByTestId('input-single-title-quintuple-desc-0')).toHaveValue('D0');
            expect(screen.getByTestId('input-single-title-quintuple-desc-1')).toHaveValue('D1');
            expect(screen.getByTestId('input-single-title-quintuple-desc-4')).toHaveValue('');
        });

        it('should call onTitleChange when title input changes', () => {
            const onTitleChange = jest.fn();
            render(<SingleTitleQuintupleDescription isEditable={true} onTitleChange={onTitleChange} />);

            fireEvent.change(screen.getByTestId('input-single-title-quintuple-title'), { target: { value: 'New' } });

            expect(onTitleChange).toHaveBeenCalledWith('New');
        });

        it('should call onDescriptionsChange with index and value when a description changes', () => {
            const onDescriptionsChange = jest.fn();
            render(<SingleTitleQuintupleDescription isEditable={true} onDescriptionsChange={onDescriptionsChange} />);

            fireEvent.change(screen.getByTestId('input-single-title-quintuple-desc-0'), { target: { value: 'Desc' } });

            expect(onDescriptionsChange).toHaveBeenCalledWith(0, 'Desc');
        });

        it('should not throw if title/description change handlers are not provided', () => {
            render(<SingleTitleQuintupleDescription isEditable={true} />);

            expect(() =>
                fireEvent.change(screen.getByTestId('input-single-title-quintuple-title'), { target: { value: 'X' } }),
            ).not.toThrow();

            expect(() =>
                fireEvent.change(screen.getByTestId('input-single-title-quintuple-desc-3'), { target: { value: 'Y' } }),
            ).not.toThrow();
        });

        it('should apply editable class and not apply template class when isEditable is true (even if isTemplate is true)', () => {
            const { container } = render(<SingleTitleQuintupleDescription isEditable={true} isTemplate={true} />);

            expect(container.firstChild).toHaveClass('editable');
            expect(container.firstChild).not.toHaveClass('template');
        });
    });
});
