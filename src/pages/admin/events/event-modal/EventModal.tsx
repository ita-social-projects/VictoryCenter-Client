import React, { useCallback, useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { Modal } from '@/components/common/modal/Modal';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { Button } from '@/components/admin/button/Button';
import { ConfirmationModal } from '@/components/admin/confirmation-modal/ConfirmationModal';
import { ImageInput } from '@/components/admin/image-input/ImageInput';
import { InputError } from '@/components/admin/input-error/InputError';
import { InputLabel } from '@/components/admin/input-label/InputLabel';
import { EventCategoryDto } from '@/types/admin/event-category';
import { EventValidationSchema, EventFormValues } from '@/validation/admin/event-schema/event-schema';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { EVENTS_TEXT, EVENT_VALIDATION } from '@/const/admin/events';
import { IMAGE_VALIDATION as BASE_IMAGE_VALIDATION } from '@/const/admin/image';
import {
    getNormalizedInputText,
    getNormalizedInputTextWhileTyping,
} from '@/utils/functions/formatters/text-formatters';
import styles from './EventModal.module.scss';
import { ReactComponent as CalendarIcon } from '@/assets/icons/calendar.svg';
import { ReactComponent as ChevronRightIcon } from '@/assets/icons/chevron-right.svg';
import { ReactComponent as CrossIcon } from '@/assets/icons/cross.svg';

type PickerLayer = 'date-picker' | 'month-year-selector' | 'calendar';

export type EventModalProps = {
    isOpen: boolean;
    onClose: () => void;
    currentCategory: EventCategoryDto | null;
};

const defaultFormState: EventFormValues = {
    title: '',
    description: '',
    additionalDescription: '',
    publishDate: null,
    image: null,
    linkUkr: '',
    linkEng: '',
};

const WEEKDAY_LABELS = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'НД'];
const MONTH_LABELS = ['Січ', 'Лют', 'Бер', 'Кві', 'Тра', 'Чер', 'Лип', 'Сер', 'Вер', 'Жов', 'Лис', 'Гру'];

const formatDateValue = (date: Date) => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${date.getFullYear()}-${month}-${day}`;
};

const parseDateValue = (value: string) => {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
};

const formatDateLabel = (date: Date) => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${day}/${month}/${date.getFullYear()}`;
};

const formatMonthLabel = (date: Date) => {
    const label = new Intl.DateTimeFormat('uk-UA', { month: 'long', year: 'numeric' }).format(date);
    return label.charAt(0).toUpperCase() + label.slice(1);
};

const getCalendarDays = (date: Date): Array<Date | null> => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayOffset = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    return Array.from({ length: firstDayOffset + daysInMonth }, (_, index) =>
        index < firstDayOffset ? null : new Date(year, month, index - firstDayOffset + 1),
    );
};

const mapEventImageError = (error: string | null): string | undefined => {
    if (!error) return undefined;

    if (error === BASE_IMAGE_VALIDATION.getFormatError()) {
        return EVENT_VALIDATION.image.getFormatError();
    }

    if (error === BASE_IMAGE_VALIDATION.getSizeError(EVENT_VALIDATION.image.maxSizeMB)) {
        return EVENT_VALIDATION.image.getSizeError(EVENT_VALIDATION.image.maxSizeMB);
    }

    if (error === BASE_IMAGE_VALIDATION.ImageDimensionsTooSmallError) {
        return EVENT_VALIDATION.image.getDimensionTooSmallError
            ? EVENT_VALIDATION.image.getDimensionTooSmallError()
            : error;
    }

    return error;
};

export const EventModal = (props: EventModalProps) => {
    const { isOpen, onClose, currentCategory } = props;

    const [showCloseConfirmModal, setShowCloseConfirmModal] = useState(false);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [activePickerLayer, setActivePickerLayer] = useState<PickerLayer>('date-picker');
    const [visibleMonth, setVisibleMonth] = useState(() => new Date());
    const [pendingDate, setPendingDate] = useState<Date | null>(null);
    const [initialPickerDate, setInitialPickerDate] = useState<Date | null>(null);
    const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
    const calendarDays = getCalendarDays(visibleMonth);
    const todayValue = formatDateValue(new Date());
    const currentDate = new Date();
    const isInitialPickerMonth =
        initialPickerDate !== null &&
        visibleMonth.getFullYear() === initialPickerDate.getFullYear() &&
        visibleMonth.getMonth() === initialPickerDate.getMonth();
    const selectableYears = [currentDate.getFullYear() - 1, currentDate.getFullYear()];

    const [isPublishing, setIsPublishing] = useState(false);

    const {
        control,
        formState: { errors, isDirty },
        reset,
        setError,
        clearErrors,
    } = useForm<EventFormValues>({
        resolver: yupResolver(EventValidationSchema as Yup.ObjectSchema<EventFormValues>),
        defaultValues: defaultFormState,
        mode: 'onTouched',
        context: { isPublishing },
    });

    const handleTextFieldChange = useCallback(
        (field: any) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            field.onChange(getNormalizedInputTextWhileTyping(e.target.value));
        },
        [],
    );

    const handleTextFieldBlur = useCallback(
        (field: any) => () => {
            if (field.value) {
                field.onChange(getNormalizedInputText(field.value));
            }
            field.onBlur();
        },
        [],
    );

    const handleImageError = useCallback(
        (error: string | null) => {
            const mappedError = mapEventImageError(error);

            if (mappedError) {
                setError('image', {
                    type: 'manual',
                    message: mappedError,
                });
            } else {
                clearErrors('image');
            }
        },
        [setError, clearErrors],
    );

    const handleClose = useCallback(() => {
        if (isDirty) {
            setShowCloseConfirmModal(true);
            return;
        }

        onClose();
    }, [isDirty, onClose]);

    const handleConfirmClose = useCallback(() => {
        setShowCloseConfirmModal(false);
        onClose();
    }, [onClose]);

    const handleCloseConfirmModalClose = useCallback(() => {
        setShowCloseConfirmModal(false);
    }, []);

    const handleDatePickerOpen = useCallback(
        (value: string | null | undefined) => () => {
            const selectedDate = value ? parseDateValue(value) : new Date();
            setPendingDate(selectedDate);
            setInitialPickerDate(selectedDate);
            setVisibleMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
            setSelectedMonth(selectedDate.getMonth());
            setActivePickerLayer('date-picker');
            setIsDatePickerOpen(true);
        },
        [],
    );

    const handleDatePickerCancel = () => {
        setIsDatePickerOpen(false);
        setActivePickerLayer('date-picker');
        setPendingDate(null);
        setInitialPickerDate(null);
    };

    const handleDatePickerConfirm = useCallback(
        (onChange: (value: string) => void) => () => {
            onChange(formatDateValue(pendingDate ?? initialPickerDate ?? new Date()));
            setIsDatePickerOpen(false);
            setActivePickerLayer('date-picker');
        },
        [initialPickerDate, pendingDate],
    );

    const handleDateSelect = (date: Date) => {
        setPendingDate((prev) => (prev && formatDateValue(prev) === formatDateValue(date) ? null : date));
    };

    const handleYearSelect = (year: number) => {
        const isCurrentYear = year === currentDate.getFullYear();
        const month = isCurrentYear ? currentDate.getMonth() : visibleMonth.getMonth();

        setVisibleMonth(new Date(year, month, 1));
        setSelectedMonth(isCurrentYear ? currentDate.getMonth() : null);
        setPendingDate(null);
    };

    const handleMonthSelect = (month: number) => {
        setVisibleMonth((prev) => new Date(prev.getFullYear(), month, 1));
        setSelectedMonth(month);
        setPendingDate(null);
        setActivePickerLayer('calendar');
    };

    const handleMonthYearPickerClose = () => {
        const initialDate = initialPickerDate ?? new Date();
        setVisibleMonth(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
        setSelectedMonth(initialDate.getMonth());
        setPendingDate(initialDate);
        setActivePickerLayer('date-picker');
    };

    const handleSaveAsDraft = () => {
        setIsPublishing(false);
    };

    const handlePublish = () => {
        setIsPublishing(true);
    };

    useEffect(() => {
        if (isOpen) {
            return;
        }
        reset(defaultFormState);
        setShowCloseConfirmModal(false);
        setIsDatePickerOpen(false);
        setActivePickerLayer('date-picker');
        setPendingDate(null);
        setInitialPickerDate(null);
        setSelectedMonth(null);
    }, [isOpen, reset]);

    return (
        <>
            <Modal isOpen={isOpen} onClose={handleClose} maxWidth="665px" className={styles['modal']}>
                <Modal.Title>
                    <h2 className={styles['modal-title']}>{EVENTS_TEXT.FORM.MODAL_TITLE}</h2>
                </Modal.Title>

                <Modal.Content>
                    <form onSubmit={(e) => e.preventDefault()} className={styles['container']}>
                        {currentCategory && <span className={styles['category-chip']}>{currentCategory.name}</span>}

                        <Controller
                            name="title"
                            control={control}
                            render={({ field }) => (
                                <InputWithCharacterLimitGroup
                                    name={field.name}
                                    value={field.value}
                                    onChange={handleTextFieldChange(field)}
                                    onBlur={handleTextFieldBlur(field)}
                                    label={EVENTS_TEXT.FORM.LABEL.TITLE}
                                    id="event-title"
                                    maxLength={EVENT_VALIDATION.title.max}
                                    error={errors.title?.message}
                                    isRequired
                                    showCounterBelow
                                />
                            )}
                        />

                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) => (
                                <TextAreaWithCharacterLimitGroup
                                    name={field.name}
                                    value={field.value ?? ''}
                                    onChange={field.onChange}
                                    onBlur={handleTextFieldBlur(field)}
                                    label={EVENTS_TEXT.FORM.LABEL.DESCRIPTION}
                                    id="event-description"
                                    maxLength={EVENT_VALIDATION.description.max}
                                    error={errors.description?.message}
                                    isRequired
                                    rows={4}
                                    normalizeValue={getNormalizedInputTextWhileTyping}
                                />
                            )}
                        />

                        <div className={styles['two-column-container']}>
                            <div className={styles['left-column']}>
                                <Controller
                                    name="publishDate"
                                    control={control}
                                    render={({ field }) => (
                                        <div className={styles['date-section']}>
                                            <InputLabel
                                                htmlFor="event-date"
                                                text={EVENTS_TEXT.FORM.LABEL.PUBLISH_DATE}
                                                isRequired
                                            />
                                            <button
                                                id="event-date"
                                                type="button"
                                                className={styles['date-trigger']}
                                                onClick={handleDatePickerOpen(field.value)}
                                                aria-haspopup="dialog"
                                                aria-expanded={isDatePickerOpen}
                                                aria-label={
                                                    field.value
                                                        ? `Вибір дати: ${formatDateLabel(parseDateValue(field.value))}`
                                                        : 'Вибір дати'
                                                }
                                            >
                                                <span>
                                                    {field.value ? formatDateLabel(parseDateValue(field.value)) : ''}
                                                </span>
                                                <CalendarIcon aria-hidden="true" />
                                            </button>

                                            {isDatePickerOpen && (
                                                <div
                                                    className={styles['date-picker']}
                                                    role="dialog"
                                                    aria-label="Вибір дати"
                                                >
                                                    <div className={styles['date-picker-header']}>
                                                        {activePickerLayer === 'calendar' ? (
                                                            <span className={styles['month-year-title']}>
                                                                {formatMonthLabel(visibleMonth)}
                                                            </span>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                className={styles['month-year-trigger']}
                                                                onClick={() =>
                                                                    setActivePickerLayer('month-year-selector')
                                                                }
                                                                aria-label="Вибрати місяць і рік"
                                                            >
                                                                <span>{formatMonthLabel(visibleMonth)}</span>
                                                                <ChevronRightIcon aria-hidden="true" />
                                                            </button>
                                                        )}
                                                        {activePickerLayer !== 'date-picker' && (
                                                            <button
                                                                type="button"
                                                                className={styles['month-year-close-button']}
                                                                onClick={handleMonthYearPickerClose}
                                                                aria-label="Закрити вибір місяця і року"
                                                            >
                                                                <CrossIcon aria-hidden="true" />
                                                            </button>
                                                        )}
                                                    </div>

                                                    {activePickerLayer === 'month-year-selector' ? (
                                                        <div className={styles['month-year-picker']}>
                                                            <div className={styles['year-grid']}>
                                                                {selectableYears.map((year) => (
                                                                    <button
                                                                        key={year}
                                                                        type="button"
                                                                        className={`${styles['month-year-option']} ${
                                                                            year === currentDate.getFullYear()
                                                                                ? styles['today-month-year-option']
                                                                                : ''
                                                                        } ${
                                                                            year === visibleMonth.getFullYear()
                                                                                ? styles['selected-month-year-option']
                                                                                : ''
                                                                        }`}
                                                                        onClick={() => handleYearSelect(year)}
                                                                        aria-pressed={
                                                                            year === visibleMonth.getFullYear()
                                                                        }
                                                                    >
                                                                        {year}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                            <div className={styles['month-grid']}>
                                                                {MONTH_LABELS.map((month, index) => (
                                                                    <button
                                                                        key={month}
                                                                        type="button"
                                                                        className={`${styles['month-year-option']} ${
                                                                            index === currentDate.getMonth()
                                                                                ? styles['today-month-year-option']
                                                                                : ''
                                                                        } ${
                                                                            selectedMonth === index
                                                                                ? styles['selected-month-year-option']
                                                                                : ''
                                                                        }`}
                                                                        onClick={() => handleMonthSelect(index)}
                                                                        aria-pressed={index === visibleMonth.getMonth()}
                                                                    >
                                                                        {month}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className={styles['calendar-grid']}>
                                                                {WEEKDAY_LABELS.map((weekday) => (
                                                                    <span key={weekday} className={styles['weekday']}>
                                                                        {weekday}
                                                                    </span>
                                                                ))}
                                                                {calendarDays.map((date, index) => {
                                                                    if (!date) {
                                                                        return (
                                                                            <span
                                                                                key={`empty-${index}`}
                                                                                aria-hidden="true"
                                                                            />
                                                                        );
                                                                    }

                                                                    const dateValue = formatDateValue(date);
                                                                    const classNames = [styles['calendar-day']];
                                                                    if (dateValue === todayValue)
                                                                        classNames.push(styles['today']);
                                                                    if (
                                                                        dateValue ===
                                                                        (pendingDate
                                                                            ? formatDateValue(pendingDate)
                                                                            : '')
                                                                    ) {
                                                                        classNames.push(styles['selected-day']);
                                                                    }

                                                                    return (
                                                                        <button
                                                                            key={dateValue}
                                                                            type="button"
                                                                            className={classNames.join(' ')}
                                                                            onClick={() => handleDateSelect(date)}
                                                                            aria-label={formatDateLabel(date)}
                                                                            aria-pressed={
                                                                                dateValue ===
                                                                                (pendingDate
                                                                                    ? formatDateValue(pendingDate)
                                                                                    : '')
                                                                            }
                                                                        >
                                                                            {date.getDate()}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>

                                                            <div className={styles['date-picker-actions']}>
                                                                {activePickerLayer === 'date-picker' && (
                                                                    <button
                                                                        type="button"
                                                                        className={styles['date-picker-action']}
                                                                        onClick={handleDatePickerCancel}
                                                                    >
                                                                        {COMMON_TEXT_ADMIN.BUTTON.CANCEL}
                                                                    </button>
                                                                )}
                                                                <button
                                                                    type="button"
                                                                    className={styles['date-picker-action']}
                                                                    onClick={handleDatePickerConfirm(field.onChange)}
                                                                    disabled={!pendingDate && !isInitialPickerMonth}
                                                                >
                                                                    {COMMON_TEXT_ADMIN.BUTTON.OK}
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                />

                                <Controller
                                    name="image"
                                    control={control}
                                    render={({ field }) => (
                                        <div className={styles['image-section']}>
                                            <InputLabel
                                                htmlFor="event-image"
                                                text={EVENTS_TEXT.FORM.LABEL.IMAGE}
                                                isRequired
                                            />
                                            <ImageInput
                                                value={field.value ?? null}
                                                onChange={(image) => field.onChange(image)}
                                                setError={handleImageError}
                                                id="event-image"
                                                name="image"
                                                variant="event"
                                                cropWidth={EVENT_VALIDATION.image.cropWidth}
                                                cropHeight={EVENT_VALIDATION.image.cropHeight}
                                                minWidth={EVENT_VALIDATION.image.minWidth}
                                                minHeight={EVENT_VALIDATION.image.minHeight}
                                                maxSizeMB={EVENT_VALIDATION.image.maxSizeMB}
                                                label={COMMON_TEXT_ADMIN.INPUT.ADD_FILE_HERE}
                                                subText={COMMON_TEXT_ADMIN.INPUT.getImageSizeSubText(
                                                    EVENT_VALIDATION.image.cropHeight,
                                                    EVENT_VALIDATION.image.cropWidth,
                                                )}
                                            />
                                            <InputError error={errors.image?.message} />
                                        </div>
                                    )}
                                />
                            </div>

                            <div>
                                <Controller
                                    name="additionalDescription"
                                    control={control}
                                    render={({ field }) => (
                                        <TextAreaWithCharacterLimitGroup
                                            name={field.name}
                                            value={field.value ?? ''}
                                            onChange={field.onChange}
                                            onBlur={handleTextFieldBlur(field)}
                                            label={EVENTS_TEXT.FORM.LABEL.ADDITIONAL_DESCRIPTION}
                                            id="event-additional-description"
                                            maxLength={EVENT_VALIDATION.additionalDescription.max}
                                            error={errors.additionalDescription?.message}
                                            rows={2}
                                            normalizeValue={getNormalizedInputTextWhileTyping}
                                        />
                                    )}
                                />
                            </div>
                        </div>

                        <div className={styles['divider']} />

                        <h4 className={styles['link-section-title']}>{EVENTS_TEXT.FORM.LINKS_SECTION_TITLE}</h4>

                        <Controller
                            name="linkUkr"
                            control={control}
                            render={({ field }) => (
                                <InputWithCharacterLimitGroup
                                    name={field.name}
                                    value={field.value}
                                    onChange={handleTextFieldChange(field)}
                                    onBlur={handleTextFieldBlur(field)}
                                    label={EVENTS_TEXT.FORM.LABEL.LINK_UKR}
                                    id="event-link-ukr"
                                    maxLength={EVENT_VALIDATION.linkUkr.max}
                                    error={errors.linkUkr?.message}
                                    isRequired
                                    showCounter={false}
                                    className={styles['link-ukr']}
                                />
                            )}
                        />

                        <Controller
                            name="linkEng"
                            control={control}
                            render={({ field }) => (
                                <InputWithCharacterLimitGroup
                                    name={field.name}
                                    value={field.value ?? ''}
                                    onChange={handleTextFieldChange(field)}
                                    onBlur={handleTextFieldBlur(field)}
                                    label={EVENTS_TEXT.FORM.LABEL.LINK_ENG}
                                    id="event-link-eng"
                                    maxLength={EVENT_VALIDATION.linkEng.max}
                                    error={errors.linkEng?.message}
                                    showCounter={false}
                                    className={styles['link-eng']}
                                />
                            )}
                        />
                    </form>
                </Modal.Content>

                <Modal.Actions>
                    <div className={styles['buttons-wrapper']}>
                        <Button
                            type="button"
                            buttonStyle="secondary"
                            disabled={true}
                            className={styles['action-button']}
                            onClick={handleSaveAsDraft}
                        >
                            {COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_DRAFT}
                        </Button>
                        <Button
                            type="button"
                            buttonStyle="primary"
                            disabled={true}
                            className={styles['action-button']}
                            onClick={handlePublish}
                        >
                            {COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED}
                        </Button>
                    </div>
                </Modal.Actions>
            </Modal>

            <ConfirmationModal
                isOpen={showCloseConfirmModal}
                title={COMMON_TEXT_ADMIN.QUESTION.CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE}
                onClose={handleCloseConfirmModalClose}
                onCancel={handleCloseConfirmModalClose}
                onConfirm={handleConfirmClose}
            />
        </>
    );
};
