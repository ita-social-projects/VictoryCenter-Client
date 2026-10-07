import { ModalMode } from '@/types/admin/common';

interface MockFeedbackModalConfig {
    testIdPrefix: string;
    entityProp: string;
    addTitle: string;
    editTitle: string;
    payload: object;
}

export const createMockFeedbackModal = ({
    testIdPrefix,
    entityProp,
    addTitle,
    editTitle,
    payload,
}: MockFeedbackModalConfig) => {
    const MockFeedbackModal = (props: any) => {
        if (!props.isOpen) return null;

        const entity = props[entityProp];

        const handleSubmit = () =>
            props
                .onSubmit(payload, entity)
                .then((savedItem: unknown) => props.onSuccess(savedItem, props.mode))
                .catch(() => undefined);

        return (
            <div data-testid={`${testIdPrefix}-modal`}>
                <span>{props.mode === ModalMode.Edit ? editTitle : addTitle}</span>
                {entity && (
                    <span data-testid={`${testIdPrefix}-initial-title`}>{entity.title ?? entity.authorName}</span>
                )}
                <button data-testid={`${testIdPrefix}-close`} onClick={props.onClose}>
                    Close
                </button>
                <button data-testid={`${testIdPrefix}-submit`} onClick={handleSubmit}>
                    Submit
                </button>
            </div>
        );
    };

    return MockFeedbackModal;
};
