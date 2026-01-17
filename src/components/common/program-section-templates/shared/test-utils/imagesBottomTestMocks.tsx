import React from 'react';

export const mockTitleDescriptionSection = React.memo(
    ({
        title,
        description,
        isTemplate,
        isEditable,
    }: {
        title?: string;
        description?: string;
        isTemplate?: boolean;
        isEditable?: boolean;
    }) => (
        <div data-testid="title-description-section" data-title={title} data-description={description}>
            {isTemplate && <span data-testid="template-flag">template</span>}
            {isEditable && <span data-testid="editable-flag">editable</span>}
        </div>
    ),
);

mockTitleDescriptionSection.displayName = 'MockTitleDescriptionSection';

export const mockImagesBottomSection = React.memo(
    ({
        variant,
        title,
        description,
        images,
        imageHandlers,
        config,
        isTemplate,
        isEditable,
        onTitleChange,
        onDescriptionChange,
    }: any) => {
        const safeImages: unknown[] = Array.isArray(images) ? images : [];
        const nonEmptyCount = safeImages.filter(Boolean).length;
        const safeImageHandlers: any[] = Array.isArray(imageHandlers) ? imageHandlers : [];
        const imageHandlersSummary = safeImageHandlers.map((h) => ({
            key: h?.key,
            value: h?.value,
            hasHandler: typeof h?.handler === 'function',
        }));

        return (
            <div data-testid="images-bottom-section">
                <div data-testid="variant">{variant}</div>
                <div data-testid="title">{title}</div>
                <div data-testid="description">{description}</div>
                <div data-testid="images-count">{safeImages.length}</div>
                <div data-testid="non-empty-images-count">{nonEmptyCount}</div>
                <div data-testid="images-json">{JSON.stringify(safeImages)}</div>
                <div data-testid="image-handlers-count">{imageHandlers.length}</div>
                <div data-testid="image-handlers-summary">{JSON.stringify(imageHandlersSummary)}</div>
                <div data-testid="image-config">{JSON.stringify(config)}</div>
                <div data-testid="has-onTitleChange">{String(typeof onTitleChange === 'function')}</div>
                <div data-testid="has-onDescriptionChange">{String(typeof onDescriptionChange === 'function')}</div>
                {isTemplate && <span data-testid="template-flag">template</span>}
                {isEditable && <span data-testid="editable-flag">editable</span>}
            </div>
        );
    },
);

mockImagesBottomSection.displayName = 'MockImagesBottomSection';
