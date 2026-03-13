import React, { createRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import { TranslateProgramForm, TranslateProgramFormRef } from './TranslateProgramForm';
import { PROGRAM_VALIDATION } from '@/const/admin/programs';
import { VisibilityStatus } from '@/types/admin/common';
import { CreateHippotherapyProgramSectionLocalizationDto } from '@/types/common/program-sections';
import { ContentType } from '@/types/common/programs';
import { ProgramSectionTemplate } from '@/types/common/program-sections';

jest.mock('@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup', () => ({
    InputWithCharacterLimitGroup: ({ value, onChange, onBlur, disabled, id, error }: any) => (
        <div data-testid={`${id}-wrapper`}>
            <input data-testid={id} value={value} onChange={onChange} onBlur={onBlur} disabled={disabled} />
            {error && <span data-testid={`${id}-error`}>{error}</span>}
        </div>
    ),
}));

jest.mock(
    '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup',
    () => ({
        TextAreaWithCharacterLimitGroup: ({ value, onChange, onBlur, disabled, id, error }: any) => (
            <div data-testid={`${id}-wrapper`}>
                <textarea data-testid={id} value={value} onChange={onChange} onBlur={onBlur} disabled={disabled} />
                {error && <span data-testid={`${id}-error`}>{error}</span>}
            </div>
        ),
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
        await ref.current?.submit(VisibilityStatus.Draft);

        expect(onSubmit).toHaveBeenCalledTimes(1);
        const submitted = onSubmit.mock.calls[0][0];
        expect(submitted.sections[0].contents[0].title).toBe('Updated');
    });
});
