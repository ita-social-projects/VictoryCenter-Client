import { useState, useCallback, useRef, useEffect } from 'react';
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
}: GenericDetailsProps<T>) {
    const addformRef = useRef<GenericFormRef>(null);
    const [isAddFormVisible, setIsAddFormVisible] = useState(false);
    const [isItemsExpanded, setIsItemsExpanded] = useState(initialIsItemsExpanded);
    const [showNotFound, setShowNotFound] = useState(false);

    const updateItems = useCallback(
        (newItems: T[]) => {
            onChangeItems?.(newItems);
        },
        [onChangeItems],
    );

    const handleDelete = (id?: number) => {
        updateItems(items.filter((i) => i.id !== id));
    };

    const handleAdd = () => {
        setIsAddFormVisible(true);
    };

    const handleClose = () => {
        setIsAddFormVisible(false);
    };

    useEffect(() => {
        setShowNotFound(items.length === 0 && !isAddFormVisible && !isLoading);
    }, [items, isAddFormVisible, isLoading]);

    const handleSubmit = useCallback(
        async (data: T) => {
            if (isChildForm) {
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
        [createEmptyItem, items, isChildForm, updateItems],
    );

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
                                        onSubmit={(updated) =>
                                            updateItems(items.map((i) => (i.id === item.id ? { ...i, ...updated } : i)))
                                        }
                                        onClose={handleClose}
                                        onDelete={handleDelete}
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
