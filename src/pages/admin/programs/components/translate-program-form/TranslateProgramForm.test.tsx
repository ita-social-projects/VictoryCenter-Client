import React, { createRef } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';

import { TranslateProgramForm, TranslateProgramFormRef } from './TranslateProgramForm';
import { PROGRAMS_TEXT } from '@/const/admin/programs';
import { VisibilityStatus } from '@/types/admin/common';
import { CreateHippotherapyProgramSectionLocalizationDto } from '@/types/common/program-sections';
import { ContentType } from '@/types/common/programs';
import { ProgramSectionTemplate } from '@/types/common/program-sections';

const createFormControlMock = (element: 'input' | 'textarea') => {
    return ({ value, onChange, onBlur, disabled, id, error }: any) => {
        const FormControlElement = element;

        return (
            <div data-testid={`${id}-wrapper`}>
                <FormControlElement
                    data-testid={id}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    disabled={disabled}
                />
                {error && <span data-testid={`${id}-error`}>{error}</span>}
            </div>
        );
    };
};

jest.mock('@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup', () => ({
    InputWithCharacterLimitGroup: createFormControlMock('input'),
}));

jest.mock(
    '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup',
    () => ({
        TextAreaWithCharacterLimitGroup: createFormControlMock('textarea'),
    }),
);

jest.mock('@/utils/functions/render-program-section', () => ({
    renderProgramSection: ({ data, handlers }: any) => {
        const React = require('react');
        return React.createElement('div', { 'data-testid': 'section-editor' }, [
            React.createElement('input', {
                key: 'title',
                'data-testid': 'section-0-title',
                value: data.title || '',
                onChange: (e: any) => handlers?.onTitleChange?.(e.target.value),
            }),
            React.createElement('input', {
                key: 'desc',
                'data-testid': 'section-0-description',
                value: data.description || '',
                onChange: (e: any) => handlers?.onDescriptionChange?.(e.target.value),
            }),
            React.createElement(
                'button',
                {
                    key: 'descriptions',
                    type: 'button',
                    'data-testid': 'section-0-descriptions-change',
                    onClick: () => handlers?.onDescriptionsChange?.(0, 'Bulk description value'),
                },
                'descriptions',
            ),
            React.createElement(
                'button',
                {
                    key: 'card-title',
                    type: 'button',
                    'data-testid': 'section-0-card-title-change',
                    onClick: () => handlers?.onCardTitleChange?.(0, 'Card title value'),
                },
                'card-title',
            ),
            React.createElement(
                'button',
                {
                    key: 'card-description',
                    type: 'button',
                    'data-testid': 'section-0-card-description-change',
                    onClick: () => handlers?.onCardDescriptionChange?.(0, 'Card description value'),
                },
                'card-description',
            ),
            React.createElement(
                'button',
                {
                    key: 'card-author',
                    type: 'button',
                    'data-testid': 'section-0-card-author-change',
                    onClick: () => handlers?.onCardAuthorChange?.(0, 'Card author value'),
                },
                'card-author',
            ),
            React.createElement(
                'button',
                {
                    key: 'faq-question',
                    type: 'button',
                    'data-testid': 'section-0-faq-question-change',
                    onClick: () => handlers?.onFaqQuestionChange?.(0, 'Localized FAQ question'),
                },
                'faq-question',
            ),
            React.createElement(
                'button',
                {
                    key: 'faq-answer',
                    type: 'button',
                    'data-testid': 'section-0-faq-answer-change',
                    onClick: () => handlers?.onFaqAnswerChange?.(0, 'Localized FAQ answer'),
                },
                'faq-answer',
            ),
        ]);
    },
}));

jest.mock('@/components/public/background-media', () => ({
    BackgroundMedia: ({ mediaUrl }: { mediaUrl: string }) => <div data-testid="background-media">{mediaUrl}</div>,
}));

const SOURCE_SECTION = {
    id: 42,
    template: ProgramSectionTemplate.TextOnly,
    order: 0,
    contents: [
        {
            id: 100,
            contentType: ContentType.Title,
            order: 0,
            title: 'UA Title',
            description: null,
            image: null,
            author: null,
            faqQuestion: null,
            faqQuestionId: null,
            groupIndex: null,
        },
        {
            id: 101,
            contentType: ContentType.Description,
            order: 1,
            title: null,
            description: 'UA Desc',
            image: null,
            author: null,
            faqQuestion: null,
            faqQuestionId: null,
            groupIndex: null,
        },
    ],
};

const SAMPLE_SECTION = {
    entityId: 42,
    __sourceSection: SOURCE_SECTION,
    contents: [
        { entityId: 100, title: 'Translated title', description: null, languageId: 2 },
        { entityId: 101, title: null, description: 'Translated desc', languageId: 2 },
    ],
} as CreateHippotherapyProgramSectionLocalizationDto & { __sourceSection: any };

const COMPLEX_SOURCE_SECTION = {
    id: 52,
    template: ProgramSectionTemplate.SingleTitleDescriptionAuthorPairs,
    order: 0,
    contents: [
        {
            id: 301,
            contentType: ContentType.Title,
            order: 0,
            title: 'Pair title',
            description: null,
            image: null,
            author: null,
            faqQuestion: null,
            faqQuestionId: null,
            groupIndex: null,
        },
        {
            id: 302,
            contentType: ContentType.Description,
            order: 1,
            title: null,
            description: 'Pair description',
            image: null,
            author: null,
            faqQuestion: null,
            faqQuestionId: null,
            groupIndex: 0,
        },
        {
            id: 303,
            contentType: ContentType.Author,
            order: 2,
            title: null,
            description: null,
            image: null,
            author: 'Author',
            faqQuestion: null,
            faqQuestionId: null,
            groupIndex: 0,
        },
        {
            id: 304,
            contentType: ContentType.FaqQuestion,
            order: 3,
            title: null,
            description: null,
            image: null,
            author: null,
            faqQuestion: { id: 1, question: 'Question', answer: 'Answer' },
            faqQuestionId: 1,
            groupIndex: 0,
        },
    ],
};

const COMPLEX_SECTION = {
    entityId: 52,
    __sourceSection: COMPLEX_SOURCE_SECTION,
    contents: [
        { entityId: 301, title: 'Translated pair title', languageId: 2 },
        { entityId: 302, description: 'Translated pair description', languageId: 2 },
        { entityId: 303, author: 'Translated author', languageId: 2 },
        { entityId: 304, question: 'Translated question', answer: 'Translated answer', languageId: 2 },
    ],
} as CreateHippotherapyProgramSectionLocalizationDto & { __sourceSection: any };

const TEST_DATA = {
    name: 'Test program',
    description: 'A description',
    location: 'Location',
    participants: '5',
    meetings: '10',
};

const FIELD_IDS = {
    form: 'translate-program-form',
    name: 'name',
    description: 'description',
    location: 'location',
    participantsCount: 'participantsCount',
    meetingCount: 'meetingCount',
};

describe('TranslateProgramForm', () => {
    const renderForm = (props: any = {}) => {
        const ref = createRef<TranslateProgramFormRef>();
        render(<TranslateProgramForm ref={ref} onSubmit={jest.fn()} {...props} />);
        return { ref };
    };

    it('renders basic fields and section form with translated values', () => {
        renderForm({
            initialData: {
                name: TEST_DATA.name,
                description: TEST_DATA.description,
                location: TEST_DATA.location,
                participantsCount: TEST_DATA.participants,
                meetingCount: TEST_DATA.meetings,
                sections: [SAMPLE_SECTION],
            },
        });

        expect(screen.getByTestId(FIELD_IDS.form)).toBeInTheDocument();
        expect(screen.getByTestId(FIELD_IDS.name)).toHaveValue(TEST_DATA.name);
        expect(screen.getByTestId(FIELD_IDS.description)).toHaveValue(TEST_DATA.description);
        expect(screen.getByTestId('section-0-title')).toHaveValue('Translated title');
    });

    it('propagates section changes to formState and submit output', async () => {
        const onSubmit = jest.fn();
        const { ref } = renderForm({
            onSubmit,
            initialData: {
                name: TEST_DATA.name,
                description: TEST_DATA.description,
                location: TEST_DATA.location,
                participantsCount: TEST_DATA.participants,
                meetingCount: TEST_DATA.meetings,
                sections: [SAMPLE_SECTION],
            },
        });

        // change the title inside section
        const titleInput = screen.getByTestId('section-0-title');
        fireEvent.change(titleInput, { target: { value: 'Updated' } });

        // submit draft
        await act(async () => {
            await ref.current?.submit(VisibilityStatus.Draft);
        });

        expect(onSubmit).toHaveBeenCalledTimes(1);
        const submitted = onSubmit.mock.calls[0][0];
        expect(submitted.sections[0].contents[0].title).toBe('Updated');
        expect(onSubmit).toHaveBeenCalledWith(expect.any(Object), VisibilityStatus.Draft);
    });

    it('reports dirty state changes and exposes isDirty via ref', () => {
        const onDirtyChange = jest.fn();
        const { ref } = renderForm({
            onDirtyChange,
            initialData: {
                name: TEST_DATA.name,
                description: TEST_DATA.description,
                location: TEST_DATA.location,
                participantsCount: TEST_DATA.participants,
                meetingCount: TEST_DATA.meetings,
                sections: [SAMPLE_SECTION],
            },
        });

        expect(ref.current?.isDirty()).toBe(false);
        expect(onDirtyChange).toHaveBeenCalledWith(false);

        fireEvent.change(screen.getByTestId(FIELD_IDS.name), { target: { value: 'Changed name' } });

        expect(ref.current?.isDirty()).toBe(true);
        expect(onDirtyChange).toHaveBeenLastCalledWith(true);
    });

    it('reports validation state and exposes isValid via ref', () => {
        const onValidationChange = jest.fn();
        const { ref } = renderForm({
            onValidationChange,
            initialData: {
                name: TEST_DATA.name,
                description: TEST_DATA.description,
                location: TEST_DATA.location,
                participantsCount: TEST_DATA.participants,
                meetingCount: TEST_DATA.meetings,
                sections: [],
            },
        });

        expect(onValidationChange).toHaveBeenCalledWith(true);
        expect(ref.current?.isValid()).toBe(true);
    });

    it('disables all form fields when form is disabled', () => {
        renderForm({
            isFormDisabled: true,
            initialData: {
                name: TEST_DATA.name,
                description: TEST_DATA.description,
                location: TEST_DATA.location,
                participantsCount: TEST_DATA.participants,
                meetingCount: TEST_DATA.meetings,
                sections: [],
            },
        });

        expect(screen.getByTestId(FIELD_IDS.name)).toBeDisabled();
        expect(screen.getByTestId(FIELD_IDS.description)).toBeDisabled();
        expect(screen.getByTestId(FIELD_IDS.location)).toBeDisabled();
        expect(screen.getByTestId(FIELD_IDS.participantsCount)).toBeDisabled();
        expect(screen.getByTestId(FIELD_IDS.meetingCount)).toBeDisabled();
    });

    it('renders empty sections state when no sections provided', () => {
        renderForm({
            initialData: {
                name: TEST_DATA.name,
                description: TEST_DATA.description,
                location: TEST_DATA.location,
                participantsCount: TEST_DATA.participants,
                meetingCount: TEST_DATA.meetings,
                sections: [],
            },
        });

        expect(screen.getByText(PROGRAMS_TEXT.MESSAGE.NO_SECTIONS_YET)).toBeInTheDocument();
        expect(screen.queryByTestId('section-editor')).not.toBeInTheDocument();
    });

    it('renders background media and preview image when image data is present', () => {
        renderForm({
            initialData: {
                name: TEST_DATA.name,
                description: TEST_DATA.description,
                location: TEST_DATA.location,
                participantsCount: TEST_DATA.participants,
                meetingCount: TEST_DATA.meetings,
                sections: [SAMPLE_SECTION],
                __backgroundImage: { url: 'https://example.com/background.jpg' },
                __previewImage: { url: 'https://example.com/preview.jpg' },
            },
        });

        expect(screen.getByTestId('background-media')).toHaveTextContent('https://example.com/background.jpg');
        expect(screen.getByAltText(PROGRAMS_TEXT.FORM.LABEL.PREVIEW_IMAGE)).toBeInTheDocument();
    });

    it('runs blur validations and publish validity check', () => {
        const { ref } = renderForm({
            initialData: {
                name: TEST_DATA.name,
                description: TEST_DATA.description,
                location: TEST_DATA.location,
                participantsCount: TEST_DATA.participants,
                meetingCount: TEST_DATA.meetings,
                sections: [SAMPLE_SECTION],
            },
        });

        fireEvent.blur(screen.getByTestId(FIELD_IDS.name));
        fireEvent.blur(screen.getByTestId(FIELD_IDS.description));
        fireEvent.blur(screen.getByTestId(FIELD_IDS.location));
        fireEvent.blur(screen.getByTestId(FIELD_IDS.participantsCount));
        fireEvent.blur(screen.getByTestId(FIELD_IDS.meetingCount));

        expect(ref.current?.isValid(true)).toBe(true);
    });

    it('updates complex section fields through section handlers', async () => {
        const onSubmit = jest.fn();
        const { ref } = renderForm({
            onSubmit,
            initialData: {
                name: TEST_DATA.name,
                description: TEST_DATA.description,
                location: TEST_DATA.location,
                participantsCount: TEST_DATA.participants,
                meetingCount: TEST_DATA.meetings,
                sections: [COMPLEX_SECTION],
            },
        });

        fireEvent.click(screen.getByTestId('section-0-descriptions-change'));
        fireEvent.click(screen.getByTestId('section-0-card-title-change'));
        fireEvent.click(screen.getByTestId('section-0-card-description-change'));
        fireEvent.click(screen.getByTestId('section-0-card-author-change'));
        fireEvent.click(screen.getByTestId('section-0-faq-question-change'));
        fireEvent.click(screen.getByTestId('section-0-faq-answer-change'));

        await act(async () => {
            await ref.current?.submit(VisibilityStatus.Draft);
        });

        const submitted = onSubmit.mock.calls[0][0];
        expect(submitted.sections[0].contents).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ entityId: 301, title: 'Card title value' }),
                expect.objectContaining({ entityId: 302, description: 'Card description value' }),
                expect.objectContaining({ entityId: 303, author: 'Card author value' }),
                expect.objectContaining({ entityId: 304, question: 'Localized FAQ question' }),
                expect.objectContaining({ entityId: 304, answer: 'Localized FAQ answer' }),
            ]),
        );
    });
});
