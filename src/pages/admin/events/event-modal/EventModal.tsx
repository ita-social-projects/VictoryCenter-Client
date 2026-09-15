import { useCallback, useState, useEffect } from 'react';
import { Modal } from '@/components/common/modal/Modal';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { Button } from '@/components/admin/button/Button';
import { ConfirmationModal } from '@/components/admin/confirmation-modal/ConfirmationModal';
import { Image, ImageValues } from '@/types/common/image';
import { EventCategoryDto } from '@/types/admin/event-category';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { EVENTS_TEXT, EVENT_VALIDATION } from '@/const/admin/events';
import styles from './EventModal.module.scss';
import { ImageInput, getImageSrc } from '@/components/admin/image-input/ImageInput';
import { InputError } from '@/components/admin/input-error/InputError';
import { InputLabel } from '@/components/admin/input-label/InputLabel';
import { ReactComponent as CropIcon } from '@/assets/icons/crop.svg';
import { ReactComponent as DeleteIcon } from '@/assets/icons/delete.svg';
import { ReactComponent as CalendarIcon } from '@/assets/icons/calendar.svg';
import { ReactComponent as ChevronRightIcon } from '@/assets/icons/chevron-right.svg';
import { ReactComponent as CrossIcon } from '@/assets/icons/cross.svg';
import { IMAGE_VALIDATION as BASE_IMAGE_VALIDATION } from '@/const/admin/image';

interface EventFormValues {
    title: string;
    description: string;
    additionalDescription: string;
    publishDate: string | null;
    image: Image | ImageValues | null;
    linkUkr: string;
    linkEng: string;
}

type EventFormErrorState = Partial<Record<keyof EventFormValues, string>>;
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

    const [formState, setFormState] = useState<EventFormValues>(defaultFormState);
    const [errors, setErrors] = useState<EventFormErrorState>({});
    const [showCloseConfirmModal, setShowCloseConfirmModal] = useState(false);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [activePickerLayer, setActivePickerLayer] = useState<PickerLayer>('date-picker');
    const [visibleMonth, setVisibleMonth] = useState(() => new Date());
    const [pendingDate, setPendingDate] = useState<Date | null>(null);
    const [initialPickerDate, setInitialPickerDate] = useState<Date | null>(null);
    const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

    const isDirty = JSON.stringify(formState) !== JSON.stringify(defaultFormState);
    const calendarDays = getCalendarDays(visibleMonth);
    const todayValue = formatDateValue(new Date());
    const currentDate = new Date();
    const selectableYears = [currentDate.getFullYear() - 1, currentDate.getFullYear()];

    const handleFieldChange = useCallback(
        (name: keyof EventFormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setFormState((prev) => ({
                ...prev,
                [name]: e.target.value,
            }));
        },
        [],
    );

    const handleImageChange = (image: ImageValues | null) => {
        setErrors((prev) => ({ ...prev, image: undefined }));
        setFormState((prev) => ({ ...prev, image }));
    };

    const handleImageError = useCallback((error: string | null) => {
        setErrors((prev) => ({
            ...prev,
            image: mapEventImageError(error),
        }));
    }, []);

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

    const handleDatePickerOpen = () => {
        const selectedDate = formState.publishDate ? parseDateValue(formState.publishDate) : new Date();
        setPendingDate(selectedDate);
        setInitialPickerDate(selectedDate);
        setVisibleMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
        setSelectedMonth(selectedDate.getMonth());
        setActivePickerLayer('date-picker');
        setIsDatePickerOpen(true);
    };

    const handleDatePickerCancel = () => {
        setIsDatePickerOpen(false);
        setActivePickerLayer('date-picker');
        setPendingDate(null);
        setInitialPickerDate(null);
    };

    const handleDatePickerConfirm = () => {
        if (!pendingDate) return;

        setFormState((prev) => ({ ...prev, publishDate: formatDateValue(pendingDate) }));
        setActivePickerLayer('date-picker');
    };

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

    useEffect(() => {
        if (isOpen) {
            return;
        }
        setFormState(defaultFormState);
        setErrors({});
        setShowCloseConfirmModal(false);
        setIsDatePickerOpen(false);
        setActivePickerLayer('date-picker');
        setPendingDate(null);
        setInitialPickerDate(null);
        setSelectedMonth(null);
    }, [isOpen]);

    return (
        <>
            <Modal isOpen={isOpen} onClose={handleClose} maxWidth="665px" className={styles['modal']}>
                <Modal.Title>
                    <h2 className={styles['modal-title']}>{EVENTS_TEXT.FORM.MODAL_TITLE}</h2>
                </Modal.Title>

                <Modal.Content>
                    <form onSubmit={(e) => e.preventDefault()} className={styles['container']}>
                        {currentCategory && <span className={styles['category-chip']}>{currentCategory.name}</span>}

                        <InputWithCharacterLimitGroup
                            label={EVENTS_TEXT.FORM.LABEL.TITLE}
                            id="event-title"
                            name="title"
                            value={formState.title}
                            onChange={handleFieldChange('title')}
                            maxLength={EVENT_VALIDATION.title.max}
                            error={errors.title}
                            isRequired
                            showCounterBelow
                        />

                        <TextAreaWithCharacterLimitGroup
                            label={EVENTS_TEXT.FORM.LABEL.DESCRIPTION}
                            id="event-description"
                            name="description"
                            value={formState.description}
                            onChange={handleFieldChange('description')}
                            maxLength={EVENT_VALIDATION.description.max}
                            error={errors.description}
                            isRequired
                            rows={4}
                        />

                        <div className={styles['two-column-container']}>
                            <div className={styles['left-column']}>
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
                                        onClick={handleDatePickerOpen}
                                        aria-haspopup="dialog"
                                        aria-expanded={isDatePickerOpen}
                                        aria-label={
                                            formState.publishDate
                                                ? `Вибір дати: ${formatDateLabel(parseDateValue(formState.publishDate))}`
                                                : 'Вибір дати'
                                        }
                                    >
                                        <span>
                                            {formState.publishDate
                                                ? formatDateLabel(parseDateValue(formState.publishDate))
                                                : ''}
                                        </span>
                                        <CalendarIcon aria-hidden="true" />
                                    </button>

                                    {isDatePickerOpen && (
                                        <div className={styles['date-picker']} role="dialog" aria-label="Вибір дати">
                                            <div className={styles['date-picker-header']}>
                                                {activePickerLayer === 'calendar' ? (
                                                    <span className={styles['month-year-title']}>
                                                        {formatMonthLabel(visibleMonth)}
                                                    </span>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        className={styles['month-year-trigger']}
                                                        onClick={() => setActivePickerLayer('month-year-selector')}
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
                                                                aria-pressed={year === visibleMonth.getFullYear()}
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
                                                                    <span key={`empty-${index}`} aria-hidden="true" />
                                                                );
                                                            }

                                                            const dateValue = formatDateValue(date);
                                                            const classNames = [styles['calendar-day']];
                                                            if (dateValue === todayValue)
                                                                classNames.push(styles['today']);
                                                            if (
                                                                dateValue ===
                                                                (pendingDate ? formatDateValue(pendingDate) : '')
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
                                                            onClick={handleDatePickerConfirm}
                                                            disabled={!pendingDate}
                                                        >
                                                            {COMMON_TEXT_ADMIN.BUTTON.OK}
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className={styles['image-section']}>
                                    <InputLabel htmlFor="event-image" text={EVENTS_TEXT.FORM.LABEL.IMAGE} isRequired />
                                    <div className={styles['image-wrapper']}>
                                        {formState.image ? (
                                            <div className={styles['image-preview']}>
                                                <img
                                                    src={getImageSrc(formState.image)}
                                                    alt={COMMON_TEXT_ADMIN.ALT.IMAGE_PREVIEW}
                                                    className={styles['preview-image']}
                                                    data-testid="event-image-preview"
                                                />
                                                <div className={styles['preview-overlay']}>
                                                    <button
                                                        type="button"
                                                        disabled
                                                        className={styles['disabled-action-icon']}
                                                        aria-label="Delete image"
                                                    >
                                                        <DeleteIcon />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        disabled
                                                        className={styles['disabled-action-icon']}
                                                        aria-label="Crop image"
                                                    >
                                                        <CropIcon />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <ImageInput
                                                value={formState.image}
                                                onChange={handleImageChange}
                                                setError={handleImageError}
                                                id="event-image"
                                                name="image"
                                                variant="whoWeAre"
                                                enableCrop={false}
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
                                        )}
                                    </div>
                                    <InputError error={errors.image} />
                                </div>
                            </div>

                            <div>
                                <TextAreaWithCharacterLimitGroup
                                    label={EVENTS_TEXT.FORM.LABEL.ADDITIONAL_DESCRIPTION}
                                    id="event-additional-description"
                                    name="additional-description"
                                    value={formState.additionalDescription}
                                    onChange={handleFieldChange('additionalDescription')}
                                    maxLength={EVENT_VALIDATION.additionalDescription.max}
                                    error={errors.additionalDescription}
                                    rows={2}
                                />
                            </div>
                        </div>

                        <div className={styles['divider']} />

                        <h4 className={styles['link-section-title']}>{EVENTS_TEXT.FORM.LINKS_SECTION_TITLE}</h4>

                        <InputWithCharacterLimitGroup
                            label={EVENTS_TEXT.FORM.LABEL.LINK_UKR}
                            id="event-link-ukr"
                            name="linkUkr"
                            value={formState.linkUkr}
                            onChange={handleFieldChange('linkUkr')}
                            maxLength={EVENT_VALIDATION.link.max}
                            error={errors.linkUkr}
                            isRequired
                            showCounter={false}
                            className={styles['link-ukr']}
                        />

                        <InputWithCharacterLimitGroup
                            label={EVENTS_TEXT.FORM.LABEL.LINK_ENG}
                            id="event-link-eng"
                            name="linkEng"
                            value={formState.linkEng}
                            onChange={handleFieldChange('linkEng')}
                            maxLength={EVENT_VALIDATION.link.max}
                            error={errors.linkEng}
                            showCounter={false}
                            className={styles['link-eng']}
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
                        >
                            {COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_DRAFT}
                        </Button>
                        <Button type="button" buttonStyle="primary" disabled={true} className={styles['action-button']}>
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
