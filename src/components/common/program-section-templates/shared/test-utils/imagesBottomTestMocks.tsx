import React from 'react';

// Shared mock implementations for ImagesBottomSection tests
// These are used by DualImagesBottom, QuadImagesBottom, and TripleImagesBottom tests
// NOTE: These mocks must be imported using require() inside jest.mock() factory functions
// due to Jest's hoisting behavior

export const mockTitleDescriptionSection = React.memo(({
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
));

mockTitleDescriptionSection.displayName = 'MockTitleDescriptionSection';

export const mockImagesBottomSection = React.memo(({
    variant,
    title,
    description,
    images,
    imageHandlers,
    config,
    isTemplate,
    isEditable,
}: any) => (
    <div data-testid="images-bottom-section">
        <div data-testid="variant">{variant}</div>
        <div data-testid="title">{title}</div>
        <div data-testid="description">{description}</div>
        <div data-testid="images-count">{images.length}</div>
        <div data-testid="image-handlers-count">{imageHandlers.length}</div>
        <div data-testid="image-config">{JSON.stringify(config)}</div>
        {isTemplate && <span data-testid="template-flag">template</span>}
        {isEditable && <span data-testid="editable-flag">editable</span>}
    </div>
));

mockImagesBottomSection.displayName = 'MockImagesBottomSection';

