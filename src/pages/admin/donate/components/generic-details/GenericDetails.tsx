import { useState, useCallback, useRef } from 'react';
import { Button } from '../../../../../components/admin/button/Button';
import NotFoundIcon from '../../../../../assets/icons/not-found.svg';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import './GenericDetails.scss';
import { FieldValues } from 'react-hook-form';
import { GenericFormMode, GenericFormProps, GenericFormRef } from '../generic-form/GenericForm';
import { InlineLoader } from '../../../../../components/common/inline-loader/InlineLoader';
import { ReactComponent as PlusIcon } from '../../../../../assets/icons/plus.svg';

export interface GenericDetailsProps<T extends FieldValues> {
    title?: string;
    items: T[];
    isLoading: boolean;
    FormComponent: React.ForwardRefExoticComponent<
        React.PropsWithoutRef<GenericFormProps<T>> & React.RefAttributes<GenericFormRef>
    >;
    primaryAddButton?: boolean;
    initialIsItemsExpanded?: boolean;
    notFoundText?: string;
    addNewText: string;
    isChildForm?: boolean;

    children?: (form: {
        formState: T;
        isItemsExpanded: boolean;
        setFormState: React.Dispatch<React.SetStateAction<T>>;
    }) => React.ReactNode;
    isParentCreating?: boolean;

    isDisabled?: boolean;
    onChangeItems?: React.Dispatch<React.SetStateAction<T[]>>;
    onSubmit?: (data: T) => Promise<void>;
    onUpdate?: (id: number, data: T) => Promise<void>;
    onDelete?: (id: number) => Promise<void>;
    onLocalSubmit?: (data: T) => void;
    onLocalUpdate?: (index: number, data: T) => void;
    onLocalDelete?: (index: number) => void;
    onEditingStateChange?: (isEditing: boolean) => void;
    isAddButtonDisabled?: boolean;
    onAddFormVisibilityChange?: (isVisible: boolean) => void;
    isParentAddFormVisible?: boolean;
}

export function GenericDetails<T extends { id: number } & FieldValues>({
    title,
    items,
    isLoading,
    FormComponent,
    primaryAddButton,
    initialIsItemsExpanded = true,
    notFoundText,
    addNewText,
    isChildForm = false,
    isDisabled = false,
    children,
    isParentCreating = false,
    onSubmit,
    onUpdate,
    onDelete,
    onEditingStateChange,
    isAddButtonDisabled = false,
    onAddFormVisibilityChange,
    isParentAddFormVisible = false,
    onLocalSubmit,
    onLocalUpdate,
    onLocalDelete,
}: Readonly<GenericDetailsProps<T>>) {
    const addformRef = useRef<GenericFormRef>(null);
    const [isAddFormVisible, setIsAddFormVisible] = useState(false);
    const [isItemsExpanded, setIsItemsExpanded] = useState(initialIsItemsExpanded);
    const [editingItemId, setEditingItemId] = useState<number | null>(null);

    const handleItemModeChange = (id: number, mode: GenericFormMode) => {
        if (mode === GenericFormMode.Edit) {
            setEditingItemId(id ?? null);
            onEditingStateChange?.(true);
        } else if (editingItemId === id) {
            setEditingItemId(null);
            onEditingStateChange?.(false);
        }
    };

    const handleAdd = () => {
        setIsAddFormVisible(true);
        onEditingStateChange?.(true);
        onAddFormVisibilityChange?.(true);
    };

    const handleClose = () => {
        setIsAddFormVisible(false);
        onEditingStateChange?.(false);
        onAddFormVisibilityChange?.(false);
    };

    const handleSubmit = useCallback(
        async (data: T) => {
            if (isParentCreating && isChildForm && onLocalSubmit) {
                onLocalSubmit(data);
            } else if (onSubmit) {
                await onSubmit(data);
            } else if (isChildForm) {
                onAddFormVisibilityChange?.(false);
            } else {
                onAddFormVisibilityChange?.(false);
            }
            setIsAddFormVisible(false);
            onEditingStateChange?.(false);
        },
        [onSubmit, isChildForm, onEditingStateChange, onAddFormVisibilityChange, isParentCreating, onLocalSubmit],
    );

    const handleItemUpdate = useCallback(
        async (item: T, updated: T, index?: number) => {
            if (isParentCreating && onLocalUpdate && index != null) {
                onLocalUpdate(index, updated);
            } else if (onUpdate && item.id != null) {
                await onUpdate(item.id, updated);
            }
        },
        [isParentCreating, onUpdate, onLocalUpdate],
    );

    const handleItemDelete = useCallback(
        async (id: number | null, index?: number) => {
            if (isParentCreating && onLocalDelete && index != null) {
                onLocalDelete(index);
            } else if (onDelete && id !== null) {
                await onDelete(id);
            }
        },
        [isParentCreating, onDelete, onLocalDelete],
    );

    const showNotFound = !isLoading && !isAddFormVisible && items.length === 0;
    const shouldShowLoader = isLoading && items.length === 0 && !isAddFormVisible;

    if (shouldShowLoader) {
        return (
            <div className={`generic-details ${isChildForm ? 'child' : ''}`}>
                {title && (
                    <div className="generic-details header">
                        {title}
                        <span className="arrow"></span>
                    </div>
                )}
                <div className="generic-details body">
                    <div className="generic-details-loader">
                        <InlineLoader size={3} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`generic-details ${isChildForm ? 'child' : ''}`}>
            {title && (
                <div
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            setIsItemsExpanded((prev) => !prev);
                        }
                    }}
                    className="generic-details header"
                    onClick={() => setIsItemsExpanded((prev) => !prev)}
                >
                    {title}
                    <span className={`arrow ${isItemsExpanded ? 'expanded' : ''}`}></span>
                </div>
            )}
            {!showNotFound && (
                <div className="generic-details body">
                    {items.length > 0 && isItemsExpanded && (
                        <>
                            {items.map((item, index) => (
                                <div className="generic-details-item" key={item.id || `${item.name}${index}`}>
                                    <FormComponent
                                        initialData={item}
                                        initialMode={GenericFormMode.View}
                                        onSubmit={(updated) => handleItemUpdate(item, updated, index)}
                                        onClose={handleClose}
                                        onDelete={(id, index) => handleItemDelete(id, index)}
                                        itemIndex={index}
                                        isChildForm={isChildForm}
                                        isParentCreating={isParentCreating}
                                        isDisabled={isDisabled}
                                        onModeChange={(mode: GenericFormMode) => handleItemModeChange(item.id, mode)}
                                    >
                                        {(formProps) => <>{children && children(formProps)}</>}
                                    </FormComponent>
                                </div>
                            ))}
                        </>
                    )}

                    {isAddFormVisible && (
                        <FormComponent
                            ref={addformRef}
                            onSubmit={handleSubmit}
                            onClose={handleClose}
                            initialMode={GenericFormMode.Create}
                            isChildForm={isChildForm}
                            isParentCreating={isParentCreating}
                            isDisabled={isDisabled}
                        >
                            {(formProps) => <>{children && children(formProps)}</>}
                        </FormComponent>
                    )}
                    {!showNotFound && (
                        <Button
                            className={`generic-details btn-add-new ${isAddFormVisible || editingItemId !== null ? 'disabled' : ''}`}
                            onClick={handleAdd}
                            buttonStyle="primary"
                            disabled={
                                isAddButtonDisabled ||
                                isParentAddFormVisible ||
                                isAddFormVisible ||
                                editingItemId !== null
                            }
                        >
                            <div>{addNewText}</div>
                            <PlusIcon className="plus-icon" />
                        </Button>
                    )}
                </div>
            )}

            {showNotFound && (
                <div className="generic-details not-found">
                    {
                        <>
                            {!isChildForm && (
                                <div className="empty-state">
                                    <img src={NotFoundIcon} alt={COMMON_TEXT_ADMIN.LIST.NOT_FOUND} />
                                    <p>{notFoundText}</p>
                                </div>
                            )}
                            <Button
                                className="generic-details btn-add"
                                onClick={handleAdd}
                                buttonStyle={primaryAddButton ? 'primary' : 'secondary'}
                            >
                                <div>{addNewText}</div>
                                <PlusIcon className="plus-icon" />
                            </Button>
                        </>
                    }
                </div>
            )}
        </div>
    );
}
