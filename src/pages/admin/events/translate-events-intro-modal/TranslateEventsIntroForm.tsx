import { ChangeEvent } from 'react';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { EVENTS_PAGE_VALIDATION, EVENTS_TEXT } from '@/const/admin/events';
import { EventsIntroSectionUpdateField } from '@/types/admin/events';
import { getNormalizedInputTextWhileTyping } from '@/utils/functions/formatters/text-formatters';
import { EventsPageTextValidationRule } from '@/validation/admin/events-page-schema/events-page-schema';

export type EventsIntroTranslationField = EventsIntroSectionUpdateField;

const translationFieldConfig: Record<
    EventsIntroTranslationField,
    {
        id: string;
        label: string;
        maxLength: number;
        validationRule: EventsPageTextValidationRule;
    }
> = {
    pageDescription: {
        id: 'events-intro-translation-page-description',
        label: EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.TITLE,
        maxLength: EVENTS_TEXT.PAGE_CONTENT.CHARACTER_LIMIT.PAGE_DESCRIPTION,
        validationRule: EVENTS_PAGE_VALIDATION.PAGE_DESCRIPTION,
    },
    eventsBlockTitle: {
        id: 'events-intro-translation-events-block-title',
        label: EVENTS_TEXT.PAGE_CONTENT.SECTION.EVENTS_BLOCK_TITLE.TITLE,
        maxLength: EVENTS_TEXT.PAGE_CONTENT.CHARACTER_LIMIT.EVENTS_BLOCK_TITLE,
        validationRule: EVENTS_PAGE_VALIDATION.EVENTS_BLOCK_TITLE,
    },
};

interface TranslateEventsIntroFormProps {
    field: EventsIntroTranslationField;
    value: string;
    onChange: (value: string) => void;
    onBlur: () => void;
    error?: string;
    disabled?: boolean;
}

export const getEventsIntroTranslationFieldConfig = (field: EventsIntroTranslationField) =>
    translationFieldConfig[field];

export const TranslateEventsIntroForm = ({
    field,
    value,
    onChange,
    onBlur,
    error,
    disabled = false,
}: TranslateEventsIntroFormProps) => {
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
            onBlur={onBlur}
            maxLength={maxLength}
            error={error}
            disabled={disabled}
            rows={4}
            normalizeValue={getNormalizedInputTextWhileTyping}
        />
    );
};
