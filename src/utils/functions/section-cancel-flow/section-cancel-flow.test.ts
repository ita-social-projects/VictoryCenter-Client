import { SectionCancelActionType } from '@/types/admin/programs';
import {
    buildSectionCancelOptions,
    createSectionDiscardAction,
    requestSectionCancel,
    requestSectionDelete,
} from './section-cancel-flow';

describe('section-cancel-flow', () => {
    it('createSectionDiscardAction removes section when shouldRemove is true', () => {
        const onRemove = jest.fn();
        const onRevert = jest.fn();
        const onAfterDiscard = jest.fn();

        createSectionDiscardAction({
            shouldRemove: true,
            revertTo: { id: 1 },
            onRemove,
            onRevert,
            onAfterDiscard,
        })();

        expect(onRemove).toHaveBeenCalledTimes(1);
        expect(onRevert).not.toHaveBeenCalled();
        expect(onAfterDiscard).toHaveBeenCalledTimes(1);
    });

    it('createSectionDiscardAction reverts section when shouldRemove is false', () => {
        const onRemove = jest.fn();
        const onRevert = jest.fn();
        const onAfterDiscard = jest.fn();

        createSectionDiscardAction({
            shouldRemove: false,
            revertTo: { id: 7 },
            onRemove,
            onRevert,
            onAfterDiscard,
        })();

        expect(onRemove).not.toHaveBeenCalled();
        expect(onRevert).toHaveBeenCalledWith({ id: 7 });
        expect(onAfterDiscard).toHaveBeenCalledTimes(1);
    });

    it('requestSectionCancel discards immediately when confirmation is not required', () => {
        const onDiscard = jest.fn();
        const onRequestCancelSection = jest.fn();

        requestSectionCancel({
            shouldRemove: false,
            isDirty: false,
            isTemplateReplacement: false,
            onDiscard,
            onRequestCancelSection,
        });

        expect(onDiscard).toHaveBeenCalledTimes(1);
        expect(onRequestCancelSection).not.toHaveBeenCalled();
    });

    it('requestSectionCancel requests discard-new confirmation when section should be removed', () => {
        const onDiscard = jest.fn();
        const onRequestCancelSection = jest.fn();

        requestSectionCancel({
            shouldRemove: true,
            isDirty: false,
            isTemplateReplacement: false,
            onDiscard,
            onRequestCancelSection,
        });

        expect(onRequestCancelSection).toHaveBeenCalledWith({
            type: SectionCancelActionType.DiscardNewSection,
            onDiscard,
        });
        expect(onDiscard).not.toHaveBeenCalled();
    });

    it('requestSectionCancel requests revert-after-replace confirmation for template replacement', () => {
        const onDiscard = jest.fn();
        const onRequestCancelSection = jest.fn();

        requestSectionCancel({
            shouldRemove: false,
            isDirty: false,
            isTemplateReplacement: true,
            onDiscard,
            onRequestCancelSection,
        });

        expect(onRequestCancelSection).toHaveBeenCalledWith({
            type: SectionCancelActionType.RevertAfterReplace,
            onDiscard,
        });
        expect(onDiscard).not.toHaveBeenCalled();
    });

    it('requestSectionDelete asks for remove confirmation when callback is provided', () => {
        const onDiscard = jest.fn();
        const onRequestCancelSection = jest.fn();

        requestSectionDelete({ onDiscard, onRequestCancelSection });

        expect(onRequestCancelSection).toHaveBeenCalledWith({
            type: SectionCancelActionType.RemoveSection,
            onDiscard,
        });
        expect(onDiscard).not.toHaveBeenCalled();
    });

    it('requestSectionDelete discards immediately without confirmation callback', () => {
        const onDiscard = jest.fn();

        requestSectionDelete({ onDiscard });

        expect(onDiscard).toHaveBeenCalledTimes(1);
    });

    it('buildSectionCancelOptions returns remove payload for new sections', () => {
        const onRevert = jest.fn();

        const options = buildSectionCancelOptions({
            isDirty: true,
            isNewSection: true,
            originalSection: { id: 3 },
            isReplacingTemplate: false,
            onRevert,
        });

        expect(options).toEqual(
            expect.objectContaining({
                isDirty: true,
                shouldRemove: true,
                revertTo: { id: 3 },
                isTemplateReplacement: false,
            }),
        );

        options.onAfterDiscard();
        expect(onRevert).not.toHaveBeenCalled();
    });

    it('buildSectionCancelOptions reverts existing sections on discard', () => {
        const onRevert = jest.fn();

        const options = buildSectionCancelOptions({
            isDirty: false,
            isNewSection: false,
            originalSection: { id: 9 },
            isReplacingTemplate: true,
            onRevert,
        });

        expect(options).toEqual(
            expect.objectContaining({
                shouldRemove: false,
                revertTo: { id: 9 },
                isTemplateReplacement: true,
            }),
        );

        options.onAfterDiscard();
        expect(onRevert).toHaveBeenCalledWith({ id: 9 });
    });
});
