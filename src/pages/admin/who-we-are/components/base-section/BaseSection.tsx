import { Content, WhoWeAreSection } from '../../../../../types/admin/who-we-are';
import { BaseContent } from '../base-content/BaseContent';
import { useState } from 'react';
import {ImageInputProps} from "../../../../../components/admin/image-input/ImageInput";

interface BaseProps {
    section: WhoWeAreSection;
    descriptionLimit: number;
    titleLimit: number;
    className: string;
    imageProps?: Partial<ImageInputProps>;
}

export const BaseSection = ({ section, descriptionLimit, titleLimit, className, imageProps = {} }: BaseProps) => {
    // тут зберігаємо тільки змінені елементи
    const [updatedContent, setUpdatedContent] = useState<Content[]>([]);

    const handleContentChange = (id: number, data: Content) => {
        setUpdatedContent((prev) => {
            const exists = prev.find((c) => c.id === id);

            if (exists) {
                // якщо цей контент вже редагувався → оновлюємо його
                return prev.map((c) => (c.id === id ? { ...c, ...data } : c));
            } else {
                // якщо змінюється вперше → додаємо до масиву
                return [...prev, { ...data, id }];
            }
        });
    };

    // допоміжна функція, щоб отримати актуальне значення (оригінал + зміни)
    const getContentWithChanges = (content: Content): Content => {
        const updated = updatedContent.find((c) => c.id === content.id);
        return updated ? { ...content, ...updated } : content;
    };

    return (
        <section>
            <div>
                {section.contents.map((c) => {
                    const current = getContentWithChanges(c);
                    return (
                        <BaseContent
                            key={c.id}
                            content={current}
                            descriptionLimit={descriptionLimit}
                            titleLimit={titleLimit}
                            onChange={(data) => handleContentChange(c.id, data)}
                            className={className}
                            imageProps = {imageProps}
                        />
                    );
                })}
            </div>
        </section>
    );
};
