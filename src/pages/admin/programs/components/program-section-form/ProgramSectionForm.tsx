import { useState, useCallback, useMemo, useEffect } from 'react';
import { Button } from '@/components/admin/button/Button';
import { ImageValues } from '@/types/common/image';
import { PROGRAMS_TEXT } from '@/const/admin/programs';
import { renderProgramSection } from '@/utils/functions/render-program-section';
import styles from './ProgramSectionForm.module.scss';
import { ProgramSection, ProgramSectionContent } from '@/types/common/program-sections';
import { ContentType } from '@/types/common/programs';

export interface ProgramSectionFormProps {
    section: ProgramSection;
    onSave: () => void;
    onCancel: () => void;
    isDisabled?: boolean;
    onSectionChange?: (updatedSection: ProgramSection) => void;
}

const getContentByType = (contents: ProgramSectionContent[], type: ContentType): ProgramSectionContent | undefined => {
    return contents.find((c) => c.contentType === type);
};

const getDescriptionsInOrder = (contents: ProgramSectionContent[]) => {
    return contents.filter((c) => c.contentType === ContentType.Description).sort((a, b) => a.order - b.order);
};

export const ProgramSectionForm = ({
    section,
    onSave,
    onCancel,
    isDisabled = false,
    onSectionChange,
}: ProgramSectionFormProps) => {
    const [localSection, setLocalSection] = useState<ProgramSection>(section);

    useEffect(() => {
        setLocalSection(section);
    }, [section]);

    const titleContent = useMemo(
        () => getContentByType(localSection.contents, ContentType.Title),
        [localSection.contents],
    );

    const descriptionContents = useMemo(() => getDescriptionsInOrder(localSection.contents), [localSection.contents]);

    const descriptions = useMemo(() => descriptionContents.map((c) => c.description || ''), [descriptionContents]);
    const description = useMemo(() => descriptions[0] || '', [descriptions]);

    const imageContents = useMemo(
        () =>
            localSection.contents
                .filter((c) => c.contentType === ContentType.Image)
                .sort((a, b) => a.order - b.order)
                .map((c) => (c.image && 'url' in c.image ? c.image.url : '') || ''),
        [localSection.contents],
    );

    const handleTitleChange = useCallback(
        (value: string) => {
            setLocalSection((prev) => {
                const updatedContents = prev.contents.map((c) =>
                    c.contentType === ContentType.Title ? { ...c, title: value } : c,
                );
                const updatedSection = { ...prev, contents: updatedContents };
                onSectionChange?.(updatedSection);
                return updatedSection;
            });
        },
        [onSectionChange],
    );

    const handleDescriptionChange = useCallback(
        (value: string) => {
            setLocalSection((prev) => {
                const updatedContents = prev.contents.map((c) =>
                    c.contentType === ContentType.Description ? { ...c, description: value } : c,
                );
                const updatedSection = { ...prev, contents: updatedContents };
                onSectionChange?.(updatedSection);
                return updatedSection;
            });
        },
        [onSectionChange],
    );

    const handleDescriptionsChange = useCallback(
        (index: number, value: string) => {
            setLocalSection((prev) => {
                const ordered = getDescriptionsInOrder(prev.contents);
                if (index < 0 || index >= ordered.length) return prev;

                const targetOrder = ordered[index].order;

                const updatedContents = prev.contents.map((c) =>
                    c.contentType === ContentType.Description && c.order === targetOrder
                        ? { ...c, description: value }
                        : c,
                );

                const updatedSection = { ...prev, contents: updatedContents };
                onSectionChange?.(updatedSection);
                return updatedSection;
            });
        },
        [onSectionChange],
    );

    const handleImagesChange = useCallback(
        (index: number, file: ImageValues | null) => {
            setLocalSection((prev) => {
                const images = prev.contents
                    .filter((c) => c.contentType === ContentType.Image)
                    .sort((a, b) => a.order - b.order);

                const target = images[index];
                if (!target) return prev;

                const updatedContents = prev.contents.map((c) =>
                    c.contentType === ContentType.Image && c.order === target.order ? { ...c, image: file } : c,
                );

                const updatedSection = { ...prev, contents: updatedContents };
                onSectionChange?.(updatedSection);
                return updatedSection;
            });
        },
        [onSectionChange],
    );

    const editableSection = renderProgramSection({
        templateId: localSection.template,
        data: {
            title: titleContent?.title || '',
            description,
            descriptions,
            images: imageContents,
        },
        isEditable: true,
        handlers: {
            onTitleChange: handleTitleChange,
            onDescriptionChange: handleDescriptionChange,
            onDescriptionsChange: handleDescriptionsChange,
            onImagesChange: handleImagesChange,
        },
    });

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                {editableSection || (
                    <p className={styles['template-info']}>
                        Template ID: <strong>{section.template}</strong> (not yet implemented)
                    </p>
                )}
            </div>
            <div className={styles.actions}>
                <Button buttonStyle="secondary" onClick={onCancel} disabled={isDisabled}>
                    {PROGRAMS_TEXT.BUTTON.CANCEL}
                </Button>
                <Button buttonStyle="primary" onClick={onSave} disabled={true}>
                    {PROGRAMS_TEXT.BUTTON.SAVE}
                </Button>
            </div>
        </div>
    );
};
