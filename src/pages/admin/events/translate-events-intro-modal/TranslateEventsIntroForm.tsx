import { ChangeEvent } from 'react';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { EVENTS_TEXT } from '@/const/admin/events';

export type EventsIntroTranslationField = 'pageDescription' | 'eventsBlockTitle';

const translationFieldConfig: Record<EventsIntroTranslationField, { id: string; label: string; maxLength: number }> = {
    pageDescription: {
        id: 'events-intro-translation-page-description',
        label: EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.TITLE,
        maxLength: EVENTS_TEXT.PAGE_CONTENT.CHARACTER_LIMIT.PAGE_DESCRIPTION,
    },
    eventsBlockTitle: {
        id: 'events-intro-translation-events-block-title',
        label: EVENTS_TEXT.PAGE_CONTENT.SECTION.EVENTS_BLOCK_TITLE.TITLE,
        maxLength: EVENTS_TEXT.PAGE_CONTENT.CHARACTER_LIMIT.EVENTS_BLOCK_TITLE,
    },
};

interface TranslateEventsIntroFormProps {
    field: EventsIntroTranslationField;
    value: string;
    onChange: (value: string) => void;
}

export const TranslateEventsIntroForm = ({ field, value, onChange }: TranslateEventsIntroFormProps) => {
    const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => onChange(event.target.value);
    const { id, label, maxLength } = translationFieldConfig[field];

    return (
        <TextAreaWithCharacterLimitGroup
            id={id}
            name={id}
            label={label}
            isRequired
            value={value}
            onChange={handleChange}
            maxLength={maxLength}
            rows={4}
        />
    );
};
