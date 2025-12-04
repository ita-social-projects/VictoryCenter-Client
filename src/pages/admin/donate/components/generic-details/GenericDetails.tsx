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
    children?: (form: { formState: T; isItemsExpanded: boolean }) => React.ReactNode;
    onChangeItems?: React.Dispatch<React.SetStateAction<T[]>>;
    onSubmit?: (data: T) => Promise<void>;
    onUpdate?: (id: number, data: T) => Promise<void>;
    onDelete?: (id: number) => Promise<void>;
    onEditingStateChange?: (isEditing: boolean) => void;
    isAddButtonDisabled?: boolean;
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
    children,
    onChangeItems,
    onSubmit,
    onUpdate,
    onDelete,
    onEditingStateChange,
    isAddButtonDisabled = false,
}: GenericDetailsProps<T>) {
    const addformRef = useRef<GenericFormRef>(null);
    const [isAddFormVisible, setIsAddFormVisible] = useState(false);
    const [isItemsExpanded, setIsItemsExpanded] = useState(initialIsItemsExpanded);
    const [editingItemId, setEditingItemId] = useState<number | null>(null);

    const handleItemModeChange = (id: number, mode: GenericFormMode) => {
        if (mode === GenericFormMode.Edit) {
            setEditingItemId(id);
            onEditingStateChange?.(true);
        } else if (editingItemId === id) {
            setEditingItemId(null);
            onEditingStateChange?.(false);
        }
    };

    const updateItems = useCallback(
        (updater: React.SetStateAction<T[]>) => {
            onChangeItems?.(updater);
        },
        [onChangeItems],
    );

    const handleAdd = () => {
        setIsAddFormVisible(true);
        onEditingStateChange?.(true);
    };

    const handleClose = () => {
        setIsAddFormVisible(false);
        onEditingStateChange?.(false);
    };

    const handleSubmit = useCallback(
        async (data: T) => {
            if (onSubmit) {
                await onSubmit(data);
            } else if (isChildForm) {
                onChangeItems?.((prevItems) => [...prevItems, data]);
            } else {
                const newItemWithId = { ...data, id: data.id || Date.now() };

                onChangeItems?.((prevItems) => [...prevItems, newItemWithId]);
            }
            setIsAddFormVisible(false);
            onEditingStateChange?.(false);
        },
        [onSubmit, isChildForm, onChangeItems, onEditingStateChange],
    );

    const handleItemUpdate = useCallback(
        async (item: T, updated: T) => {
            if (onUpdate) {
                await onUpdate(item.id, updated);
            } else {
                updateItems((prevItems) => prevItems.map((i) => (i.id === item.id ? { ...i, ...updated } : i)));
            }
        },
        [onUpdate, updateItems],
    );

    const handleItemDelete = useCallback(
        async (id: number) => {
            if (onDelete && id) {
                await onDelete(id);
            } else {
                updateItems((prevItems) => prevItems.filter((i) => i.id !== id));
            }
        },
        [onDelete, updateItems],
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
                            {items.map((item) => (
                                <div className="generic-details-item" key={item.id}>
                                    <FormComponent
                                        initialData={item}
                                        initialMode={GenericFormMode.View}
                                        onSubmit={(updated) => handleItemUpdate(item, updated)}
                                        onClose={handleClose}
                                        onDelete={() => handleItemDelete(item.id)}
                                        isChildForm={isChildForm}
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
                        >
                            {(formProps) => <>{children && children(formProps)}</>}
                        </FormComponent>
                    )}
                    {!showNotFound && (
                        <Button
                            className={`generic-details btn-add-new ${isAddFormVisible || editingItemId !== null ? 'disabled' : ''}`}
                            onClick={handleAdd}
                            buttonStyle="primary"
                            disabled={isAddButtonDisabled}
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
