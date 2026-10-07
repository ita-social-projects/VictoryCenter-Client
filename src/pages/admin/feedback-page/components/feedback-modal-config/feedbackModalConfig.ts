import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { FEEDBACK_TEXT } from '@/const/admin/feedback';
import { ModalMode } from '@/types/admin/common';

export const getFeedbackConfirmTitle = (mode: ModalMode): string =>
    mode === ModalMode.Edit ? COMMON_TEXT_ADMIN.QUESTION.PUBLISH_CHANGES : FEEDBACK_TEXT.PUBLISH_MODAL.TITLE_NEW;

export const getFeedbackErrorMessage = (mode: ModalMode): string =>
    mode === ModalMode.Edit ? FEEDBACK_TEXT.MESSAGE.FAIL_TO_UPDATE : FEEDBACK_TEXT.MESSAGE.FAIL_TO_PUBLISH;

export const getFeedbackFormKey = (mode: ModalMode, entity?: { id: number }): string | number =>
    mode === ModalMode.Edit && entity ? entity.id : 'add';
