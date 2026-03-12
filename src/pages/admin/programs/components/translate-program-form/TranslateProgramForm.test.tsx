import React, { createRef } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';

import { TranslateProgramForm, TranslateProgramFormRef } from './TranslateProgramForm';
import { VisibilityStatus } from '@/types/admin/common';
import { CreateHippotherapyProgramSectionLocalizationDto } from '@/types/common/program-sections';
import { ContentType } from '@/types/common/programs';
import { ProgramSectionTemplate } from '@/types/common/program-sections';
import { PROGRAMS_TEXT } from '@/const/admin/programs';

const makeMockGroup =
    (element: 'input' | 'textarea') =>
    ({ value, onChange, onBlur, disabled, id, error }: any) => (
        <div data-testid={`${id}-wrapper`}>
            {element === 'input' ? (
                <input data-testid={id} value={value} onChange={onChange} onBlur={onBlur} disabled={disabled} />
            ) : (
                <textarea data-testid={id} value={value} onChange={onChange} onBlur={onBlur} disabled={disabled} />
            )}
            {error && <span data-testid={`${id}-error`}>{error}</span>}
        </div>
    );

jest.mock('@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup', () => ({
    InputWithCharacterLimitGroup: makeMockGroup('input'),
}));

jest.mock(
    '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup',
    () => ({
        TextAreaWithCharacterLimitGroup: makeMockGroup('textarea'),
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
            React.createElement('input', {
                key: 'descriptions-0',
                'data-testid': 'section-descriptions-0',
                value: data.descriptions?.[0] || '',
                onChange: (e: any) => handlers?.onDescriptionsChange?.(0, e.target.value),
            }),
            React.createElement('input', {
                key: 'card-title-0',
                'data-testid': 'section-card-title-0',
                value: data.cards?.[0]?.title || '',
                onChange: (e: any) => handlers?.onCardTitleChange?.(0, e.target.value),
            }),
            React.createElement('input', {
                key: 'card-desc-0',
                'data-testid': 'section-card-description-0',
                value: data.cards?.[0]?.description || '',
                onChange: (e: any) => handlers?.onCardDescriptionChange?.(0, e.target.value),
            }),
            React.createElement('input', {
                key: 'card-author-0',
                'data-testid': 'section-card-author-0',
                value: data.descriptionAuthorPairs?.[0]?.author || '',
                onChange: (e: any) => handlers?.onCardAuthorChange?.(0, e.target.value),
            }),
            React.createElement('input', {
                key: 'faq-question-0',
                'data-testid': 'section-faq-question-0',
                value: data.faqPairs?.[0]?.questionText || '',
                onChange: (e: any) => handlers?.onFaqQuestionChange?.(0, e.target.value),
            }),
            React.createElement('input', {
                key: 'faq-answer-0',
                'data-testid': 'section-faq-answer-0',
                value: data.faqPairs?.[0]?.answerText || '',
                onChange: (e: any) => handlers?.onFaqAnswerChange?.(0, e.target.value),
            }),
        ]);
    },
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

const SOURCE_SECTION_WITH_PAIRS = {
    id: 77,
    template: ProgramSectionTemplate.SingleTitleDescriptionAuthorPairs,
    order: 1,
    contents: [
        {
            id: 200,
            contentType: ContentType.Title,
            order: 0,
            title: 'Pair title',
            description: null,
            image: null,
            author: null,
            faqQuestion: null,
            faqQuestionId: null,
            groupIndex: 0,
        },
        {
            id: 201,
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
            id: 202,
            contentType: ContentType.Author,
            order: 2,
            title: null,
            description: null,
            image: null,
            author: 'Pair author',
            faqQuestion: null,
            faqQuestionId: null,
            groupIndex: 0,
        },
        {
            id: 203,
            contentType: ContentType.FaqQuestion,
            order: 3,
            title: null,
            description: null,
            image: null,
            author: null,
            faqQuestion: { id: 501, question: 'Q', answer: 'A' },
            faqQuestionId: 501,
            groupIndex: 0,
        },
    ],
};

const SAMPLE_SECTION_WITH_PAIRS = {
    entityId: 77,
    __sourceSection: SOURCE_SECTION_WITH_PAIRS,
    contents: [
        { entityId: 200, title: 'Title tr', description: null, languageId: 2 },
        { entityId: 201, title: null, description: 'Desc tr', languageId: 2 },
        { entityId: 202, title: null, author: 'Author tr', languageId: 2 },
        { entityId: 203, title: null, question: 'Question tr', answer: 'Answer tr', languageId: 2 },
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
    });

    it('shows empty state when there are no sections', () => {
        renderForm({
            initialData: {
                name: '',
                description: '',
                location: '',
                participantsCount: '',
                meetingCount: '',
                sections: [],
            },
        });

        expect(screen.getByAltText('No sections')).toBeInTheDocument();
        expect(screen.getByText(PROGRAMS_TEXT.MESSAGE.NO_SECTIONS_YET)).toBeInTheDocument();
        expect(screen.getByText(PROGRAMS_TEXT.FORM.LABEL.PREVIEW_IMAGE)).toBeInTheDocument();
        expect(screen.getByText(PROGRAMS_TEXT.FORM.LABEL.DESCRIPTION)).toBeInTheDocument();
    });

    it('renders media from initialData overrides before props', () => {
        renderForm({
            previewImage: { url: 'https://example.com/from-prop-preview.jpg' },
            backgroundImage: { url: 'https://example.com/from-prop-bg.jpg' },
            initialData: {
                name: TEST_DATA.name,
                description: TEST_DATA.description,
                location: TEST_DATA.location,
                participantsCount: TEST_DATA.participants,
                meetingCount: TEST_DATA.meetings,
                sections: [SAMPLE_SECTION],
                __previewImage: { url: 'https://example.com/from-initial-preview.jpg' },
                __backgroundImage: { url: 'https://example.com/from-initial-bg.jpg' },
            },
        });

        expect(screen.getByAltText(PROGRAMS_TEXT.FORM.LABEL.DESCRIPTION)).toHaveAttribute(
            'src',
            'https://example.com/from-initial-bg.jpg',
        );
        expect(screen.getByAltText(PROGRAMS_TEXT.FORM.LABEL.PREVIEW_IMAGE)).toHaveAttribute(
            'src',
            'https://example.com/from-initial-preview.jpg',
        );
    });

    it('disables fields when form is disabled', () => {
        renderForm({
            isFormDisabled: true,
            initialData: {
                name: TEST_DATA.name,
                description: TEST_DATA.description,
                location: TEST_DATA.location,
                participantsCount: TEST_DATA.participants,
                meetingCount: TEST_DATA.meetings,
                sections: [SAMPLE_SECTION],
            },
        });

        expect(screen.getByTestId(FIELD_IDS.name)).toBeDisabled();
        expect(screen.getByTestId(FIELD_IDS.description)).toBeDisabled();
        expect(screen.getByTestId(FIELD_IDS.location)).toBeDisabled();
        expect(screen.getByTestId(FIELD_IDS.participantsCount)).toBeDisabled();
        expect(screen.getByTestId(FIELD_IDS.meetingCount)).toBeDisabled();
    });

    it('calls onDirtyChange when form becomes dirty', () => {
        const onDirtyChange = jest.fn();

        renderForm({
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

        fireEvent.change(screen.getByTestId(FIELD_IDS.name), { target: { value: 'Updated name' } });

        expect(onDirtyChange).toHaveBeenCalledWith(true);
    });

    it('exposes imperative validity API', () => {
        const { ref } = renderForm({
            initialData: {
                name: '',
                description: '',
                location: '',
                participantsCount: '',
                meetingCount: '',
                sections: [],
            },
        });

        expect(ref.current?.isValid(false)).toBe(false);
        expect(ref.current?.isValid(true)).toBe(false);
    });

    it('skips section editor when __sourceSection is absent', () => {
        renderForm({
            initialData: {
                name: TEST_DATA.name,
                description: TEST_DATA.description,
                location: TEST_DATA.location,
                participantsCount: TEST_DATA.participants,
                meetingCount: TEST_DATA.meetings,
                sections: [
                    {
                        entityId: 777,
                        contents: [{ entityId: 778, title: 'x', description: null, languageId: 2 }],
                    },
                ],
            },
        });

        expect(screen.queryByTestId('section-editor')).not.toBeInTheDocument();
    });

    it('updates pair/faq handlers and submits mapped section content', async () => {
        const onSubmit = jest.fn();
        const { ref } = renderForm({
            onSubmit,
            initialData: {
                name: TEST_DATA.name,
                description: TEST_DATA.description,
                location: TEST_DATA.location,
                participantsCount: TEST_DATA.participants,
                meetingCount: TEST_DATA.meetings,
                sections: [SAMPLE_SECTION_WITH_PAIRS],
            },
        });

        fireEvent.change(screen.getByTestId('section-descriptions-0'), { target: { value: 'Descriptions updated' } });
        fireEvent.change(screen.getByTestId('section-card-title-0'), { target: { value: 'Card title updated' } });
        fireEvent.change(screen.getByTestId('section-card-description-0'), {
            target: { value: 'Card description updated' },
        });
        fireEvent.change(screen.getByTestId('section-card-author-0'), { target: { value: 'Card author updated' } });
        fireEvent.change(screen.getByTestId('section-faq-question-0'), { target: { value: 'FAQ question updated' } });
        fireEvent.change(screen.getByTestId('section-faq-answer-0'), { target: { value: 'FAQ answer updated' } });

        await act(async () => {
            await ref.current?.submit(VisibilityStatus.Draft);
        });

        const submitted = onSubmit.mock.calls[0][0];
        const submittedContents = submitted.sections[0].contents;

        expect(submittedContents.find((c: any) => c.entityId === 200)?.title).toBe('Card title updated');
        expect(submittedContents.find((c: any) => c.entityId === 201)?.description).toBe('Card description updated');
        expect(submittedContents.find((c: any) => c.entityId === 202)?.author).toBe('Card author updated');
        expect(submittedContents.find((c: any) => c.entityId === 203)?.question).toBe('FAQ question updated');
        expect(submittedContents.find((c: any) => c.entityId === 203)?.answer).toBe('FAQ answer updated');
    });

    it('updates all base fields on change and blur and reports dirty state', async () => {
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

        fireEvent.change(screen.getByTestId(FIELD_IDS.name), { target: { value: 'Name 2' } });
        fireEvent.blur(screen.getByTestId(FIELD_IDS.name));

        fireEvent.change(screen.getByTestId(FIELD_IDS.description), { target: { value: 'Description 2' } });
        fireEvent.blur(screen.getByTestId(FIELD_IDS.description));

        fireEvent.change(screen.getByTestId(FIELD_IDS.location), { target: { value: 'Location 2' } });
        fireEvent.blur(screen.getByTestId(FIELD_IDS.location));

        fireEvent.change(screen.getByTestId(FIELD_IDS.participantsCount), { target: { value: '99' } });
        fireEvent.blur(screen.getByTestId(FIELD_IDS.participantsCount));

        fireEvent.change(screen.getByTestId(FIELD_IDS.meetingCount), { target: { value: '42' } });
        fireEvent.blur(screen.getByTestId(FIELD_IDS.meetingCount));

        expect(ref.current?.isDirty()).toBe(true);

        await act(async () => {
            await ref.current?.submit(VisibilityStatus.Draft);
        });

        const submitted = onSubmit.mock.calls[0][0];
        expect(submitted.name).toBe('Name 2');
        expect(submitted.description).toBe('Description 2');
        expect(submitted.location).toBe('Location 2');
        expect(submitted.participantsCount).toBe('99');
        expect(submitted.meetingCount).toBe('42');
    });

    it('updates card description for non-pairs template branch', async () => {
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

        fireEvent.change(screen.getByTestId('section-card-description-0'), {
            target: { value: 'Card description non-pairs' },
        });

        await act(async () => {
            await ref.current?.submit(VisibilityStatus.Draft);
        });

        const submitted = onSubmit.mock.calls[0][0];
        expect(submitted.sections[0].contents.find((c: any) => c.entityId === 101)?.description).toBe(
            'Card description non-pairs',
        );
    });

    it('does not render section editor when source section id is missing', () => {
        renderForm({
            initialData: {
                name: TEST_DATA.name,
                description: TEST_DATA.description,
                location: TEST_DATA.location,
                participantsCount: TEST_DATA.participants,
                meetingCount: TEST_DATA.meetings,
                sections: [
                    {
                        entityId: 55,
                        __sourceSection: {
                            template: ProgramSectionTemplate.TextOnly,
                            contents: [],
                        },
                        contents: [],
                    } as any,
                ],
            },
        });

        expect(screen.queryByTestId('section-editor')).not.toBeInTheDocument();
    });
});
