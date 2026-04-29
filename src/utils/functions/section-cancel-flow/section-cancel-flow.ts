import { SectionCancelActionType } from '@/types/admin/programs';

export type SectionCancelRequestHandler = (request: { type: SectionCancelActionType; onDiscard: () => void }) => void;

interface SectionCancelRequestParams {
    shouldRemove: boolean;
    isDirty: boolean;
    isTemplateReplacement?: boolean;
    onDiscard: () => void;
    onRequestCancelSection?: SectionCancelRequestHandler;
}

interface SectionDeleteRequestParams {
    onDiscard: () => void;
    onRequestCancelSection?: SectionCancelRequestHandler;
}

interface SectionDiscardActionParams<TSection> {
    shouldRemove: boolean;
    revertTo: TSection;
    onRemove: () => void;
    onRevert: (section: TSection) => void;
    onAfterDiscard: () => void;
}

interface BuildSectionCancelOptionsParams<TSection> {
    isDirty: boolean;
    isNewSection: boolean;
    originalSection: TSection;
    isReplacingTemplate: boolean;
    onRevert: (section: TSection) => void;
}

export interface SectionCancelOptionsPayload<TSection> {
    isDirty: boolean;
    shouldRemove: boolean;
    revertTo: TSection;
    onAfterDiscard: () => void;
    isTemplateReplacement: boolean;
}

const resolveSectionCancelActionType = (
    shouldRemove: boolean,
    isTemplateReplacement: boolean,
): SectionCancelActionType => {
    if (shouldRemove) {
        return SectionCancelActionType.DiscardNewSection;
    }

    if (isTemplateReplacement) {
        return SectionCancelActionType.RevertAfterReplace;
    }

    return SectionCancelActionType.RevertSection;
};

export const createSectionDiscardAction = <TSection>({
    shouldRemove,
    revertTo,
    onRemove,
    onRevert,
    onAfterDiscard,
}: SectionDiscardActionParams<TSection>): (() => void) => {
    return () => {
        if (shouldRemove) {
            onRemove();
        } else {
            onRevert(revertTo);
        }

        onAfterDiscard();
    };
};

export const requestSectionCancel = ({
    shouldRemove,
    isDirty,
    isTemplateReplacement = false,
    onDiscard,
    onRequestCancelSection,
}: SectionCancelRequestParams): void => {
    const shouldAskForConfirmation = shouldRemove || isDirty || isTemplateReplacement;

    if (!shouldAskForConfirmation || !onRequestCancelSection) {
        onDiscard();
        return;
    }

    onRequestCancelSection({
        type: resolveSectionCancelActionType(shouldRemove, isTemplateReplacement),
        onDiscard,
    });
};

export const requestSectionDelete = ({ onDiscard, onRequestCancelSection }: SectionDeleteRequestParams): void => {
    if (!onRequestCancelSection) {
        onDiscard();
        return;
    }

    onRequestCancelSection({
        type: SectionCancelActionType.RemoveSection,
        onDiscard,
    });
};

export const buildSectionCancelOptions = <TSection>({
    isDirty,
    isNewSection,
    originalSection,
    isReplacingTemplate,
    onRevert,
}: BuildSectionCancelOptionsParams<TSection>): SectionCancelOptionsPayload<TSection> => {
    const shouldRemove = isNewSection;
    const revertTo = originalSection;

    return {
        isDirty,
        shouldRemove,
        revertTo,
        isTemplateReplacement: isReplacingTemplate,
        onAfterDiscard: () => {
            if (!shouldRemove) {
                onRevert(revertTo);
            }
        },
    };
};
