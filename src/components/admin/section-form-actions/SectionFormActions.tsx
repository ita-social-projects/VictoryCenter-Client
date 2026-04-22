import { MouseEvent, ReactNode } from 'react';
import { ReactComponent as ChangeIcon } from '@/assets/icons/change.svg';
import { Button } from '@/components/admin/button/Button';
import { IconButton } from '@/components/admin/icon-button/IconButton';
import { SECTIONS_TEXT } from '@/const/admin/sections';
import { ACTION_ICONS } from '@/const/common/action-icons';
import { SectionMode } from '@/types/common/sections';

interface SectionFormActionsClassNames {
    actionsSection: string;
    orderControls: string;
    iconButton: string;
    upButton: string;
    downButton: string;
    hoverButtons: string;
    editButton: string;
    deleteButton: string;
    changeButton: string;
    content: string;
    actionsContainer: string;
    actions: string;
}

interface SectionFormActionsProps {
    sectionMode: SectionMode;
    isFirstSection: boolean;
    isLastSection: boolean;
    isDisabled: boolean;
    isDirty: boolean;
    isSectionSaveValid: boolean;
    classNames: SectionFormActionsClassNames;
    onMoveUpSection: () => void;
    onMoveDownSection: () => void;
    onEditClick: (event: MouseEvent<HTMLButtonElement>) => void;
    onDeleteClick: (event: MouseEvent<HTMLButtonElement>) => void;
    onReplaceClick: (event: MouseEvent<HTMLButtonElement>) => void;
    onCancelClick: () => void;
    onSaveClick: () => void;
    children: ReactNode;
}

export const SectionFormActions = ({
    sectionMode,
    isFirstSection,
    isLastSection,
    isDisabled,
    isDirty,
    isSectionSaveValid,
    classNames,
    onMoveUpSection,
    onMoveDownSection,
    onEditClick,
    onDeleteClick,
    onReplaceClick,
    onCancelClick,
    onSaveClick,
    children,
}: SectionFormActionsProps) => {
    return (
        <>
            {sectionMode === SectionMode.View && (
                <div className={classNames.actionsSection}>
                    <div className={classNames.orderControls}>
                        {!isFirstSection && (
                            <button
                                type="button"
                                onClick={onMoveUpSection}
                                className={`${classNames.iconButton} ${classNames.upButton}`}
                                aria-label="Move up section"
                            />
                        )}
                        {!isLastSection && (
                            <button
                                type="button"
                                onClick={onMoveDownSection}
                                className={`${classNames.iconButton} ${classNames.downButton}`}
                                aria-label="Move down section"
                            />
                        )}
                    </div>
                    <div className={classNames.hoverButtons}>
                        <IconButton
                            type="button"
                            onClick={onEditClick}
                            className={`${classNames.iconButton} ${classNames.editButton}`}
                            aria-label="Edit section"
                            DefaultIcon={ACTION_ICONS.edit.default}
                            FilledIcon={ACTION_ICONS.edit.hover}
                        />
                        <IconButton
                            type="button"
                            onClick={onDeleteClick}
                            className={`${classNames.iconButton} ${classNames.deleteButton}`}
                            aria-label="Delete section"
                            DefaultIcon={ACTION_ICONS.delete.default}
                            FilledIcon={ACTION_ICONS.delete.hover}
                        />
                        <button
                            type="button"
                            onClick={onReplaceClick}
                            className={`${classNames.iconButton} ${classNames.changeButton}`}
                            aria-label="Replace section"
                        >
                            <ChangeIcon />
                        </button>
                    </div>
                </div>
            )}

            <div className={classNames.content}>{children}</div>

            <div className={classNames.actionsContainer}>
                {sectionMode !== SectionMode.View && (
                    <div className={classNames.actions}>
                        <Button buttonStyle="secondary" onClick={onCancelClick} disabled={isDisabled}>
                            {SECTIONS_TEXT.BUTTON.CANCEL}
                        </Button>
                        <Button
                            buttonStyle="primary"
                            onClick={onSaveClick}
                            disabled={!isDirty || isDisabled || !isSectionSaveValid}
                        >
                            {SECTIONS_TEXT.BUTTON.SAVE}
                        </Button>
                    </div>
                )}
            </div>
        </>
    );
};
