import { useState, useCallback, useRef } from 'react';
import { Button } from '../../../../../components/admin/button/Button';
import NotFoundIcon from '../../../../../assets/icons/not-found.svg';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import './GenericDetails.scss';
import { FieldValues } from 'react-hook-form';
import { GenericFormMode, GenericFormProps, GenericFormRef } from '../generic-form/GenericForm';
import { DONATE_TEXT } from '../../../../../const/admin/donate';

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
    createEmptyItem: (data: any) => T;
    isChildForm?: boolean;
    children?: (form: { formState: T; isItemsExpanded: boolean }) => React.ReactNode;
    onChangeItems?: React.Dispatch<React.SetStateAction<T[]>>;
    onSubmit?: (data: T) => Promise<void>;
    onUpdate?: (id: number, data: T) => Promise<void>;
    onDelete?: (id: number) => Promise<void>;
}

export function GenericDetails<T extends { id?: number } & FieldValues>({
    title,
    items,
    isLoading,
    FormComponent,
    primaryAddButton,
    initialIsItemsExpanded = true,
    notFoundText,
    addNewText,
    createEmptyItem,
    isChildForm = false,
    children,
    onChangeItems,
    onSubmit,
    onUpdate,
    onDelete,
}: GenericDetailsProps<T>) {
    const addformRef = useRef<GenericFormRef>(null);
    const [isAddFormVisible, setIsAddFormVisible] = useState(false);
    const [isItemsExpanded, setIsItemsExpanded] = useState(initialIsItemsExpanded);

    const updateItems = useCallback(
        (newItems: T[]) => {
            onChangeItems?.(newItems);
        },
        [onChangeItems],
    );

    const handleDelete = useCallback(
        (id?: number) => {
            updateItems(items.filter((i) => i.id !== id));
        },
        [items, updateItems],
    );

    const handleAdd = () => {
        setIsAddFormVisible(true);
    };

    const handleClose = () => {
        setIsAddFormVisible(false);
    };

    const handleSubmit = useCallback(
        async (data: T) => {
            if (onSubmit) {
                await onSubmit(data);
                setIsAddFormVisible(false);
            } else if (isChildForm) {
                updateItems([...items, data]);
                setIsAddFormVisible(false);
            } else {
                const newItem = createEmptyItem({
                    ...data,
                    id: data.id || Date.now(),
                    correspondentBanks: data.correspondentBanks || [],
                } as any);

                updateItems([...items, newItem]);
                setIsAddFormVisible(false);
            }
        },
        [onSubmit, createEmptyItem, items, isChildForm, updateItems],
    );

    const handleItemUpdate = useCallback(
        async (item: T, updated: T) => {
            if (onUpdate && item.id) {
                await onUpdate(item.id, updated);
            } else {
                updateItems(items.map((i) => (i.id === item.id ? { ...i, ...updated } : i)));
            }
        },
        [onUpdate, items, updateItems],
    );

    const handleItemDelete = useCallback(
        async (id?: number) => {
            if (onDelete && id) {
                await onDelete(id);
            } else {
                handleDelete(id);
            }
        },
        [onDelete, handleDelete],
    );

    const showNotFound = !isLoading && !isAddFormVisible && items.length === 0;

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
                                        ref={addformRef}
                                        initialData={item}
                                        initialMode={GenericFormMode.View}
                                        onSubmit={(updated) => handleItemUpdate(item, updated)}
                                        onClose={handleClose}
                                        onDelete={() => handleItemDelete(item.id)}
                                        isChildForm={isChildForm}
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
                            className={`generic-details btn-add-new ${isAddFormVisible ? 'disabled' : ''}`}
                            onClick={handleAdd}
                            buttonStyle="primary"
                        >
                            <>
                                {isChildForm
                                    ? DONATE_TEXT.CORRESPONDENT_BANKS.ADD_NEW
                                    : DONATE_TEXT.BANK_DETAILS.ADD_NEW}
                            </>
                            <div className="plus-icon"></div>
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
                                    <img src={NotFoundIcon} alt={COMMON_TEXT_ADMIN.ALT.NOT_FOUND} />
                                    <p>{notFoundText}</p>
                                </div>
                            )}
                            <Button
                                className="generic-details btn-add"
                                onClick={handleAdd}
                                buttonStyle={primaryAddButton ? 'primary' : 'secondary'}
                            >
                                <div>{addNewText}</div>
                                <div className="plus-icon"></div>
                            </Button>
                        </>
                    }
                </div>
            )}
        </div>
    );
}
