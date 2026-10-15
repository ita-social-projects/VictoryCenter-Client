import { ChangeEvent } from 'react';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { EVENTS_TEXT } from '@/const/admin/events';

export type EventsIntroTranslationField = 'pageDescription' | 'eventsBlockTitle';

interface TranslateEventsIntroFormProps {
    field: EventsIntroTranslationField;
    value: string;
    onChange: (value: string) => void;
}

export const TranslateEventsIntroForm = ({ field, value, onChange }: TranslateEventsIntroFormProps) => {
    const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(event.target.value);

    if (field === 'pageDescription') {
        return (
            <TextAreaWithCharacterLimitGroup
                id="events-intro-translation-page-description"
                name="events-intro-translation-page-description"
                label={EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.TITLE}
                isRequired
                value={value}
                onChange={handleChange}
                maxLength={EVENTS_TEXT.PAGE_CONTENT.CHARACTER_LIMIT.PAGE_DESCRIPTION}
                rows={4}
            />
        );
    }

    return (
        <InputWithCharacterLimitGroup
            id="events-intro-translation-events-block-title"
            name="events-intro-translation-events-block-title"
            label={EVENTS_TEXT.PAGE_CONTENT.SECTION.EVENTS_BLOCK_TITLE.TITLE}
            isRequired
            value={value}
            onChange={handleChange}
            maxLength={EVENTS_TEXT.PAGE_CONTENT.CHARACTER_LIMIT.EVENTS_BLOCK_TITLE}
            showCounterBelow
        />
    );
};
