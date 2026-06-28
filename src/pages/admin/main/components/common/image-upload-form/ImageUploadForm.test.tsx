import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { ImageUploadForm } from './ImageUploadForm';

jest.mock('@/components/admin/image-input/ImageInput', () => ({
    ImageInput: ({ onChange, setError, value, disabled }: any) => (
        <div data-testid="image-input-mock" data-disabled={disabled ? 'true' : 'false'}>
            <button data-testid="trigger-image-error" type="button" onClick={() => setError('Image size error')}>
                Set Error
            </button>
            <button
                data-testid="trigger-image-change"
                type="button"
                onClick={() => onChange({ id: 1, url: 'test.jpg' })}
            >
                Change Image
            </button>
            {value && <span data-testid="current-value">{JSON.stringify(value)}</span>}
        </div>
    ),
}));

type FormValues = { image: any };

const IMAGE_CONFIG = {
    cropWidth: 1440,
    cropHeight: 860,
    minWidth: 1440,
    minHeight: 860,
    label: 'Label',
    subText: 'Subtext',
    style: { width: '100%', aspectRatio: '1440 / 860' },
};

const Wrapper = ({
    imageError = null,
    errors = {},
    setImageError = jest.fn(),
}: {
    imageError?: string | null;
    errors?: any;
    setImageError?: (val: string | null) => void;
}) => {
    const methods = useForm<FormValues>({ defaultValues: { image: null } });

    return (
        <FormProvider {...methods}>
            <ImageUploadForm<FormValues>
                control={methods.control}
                errors={errors}
                imageError={imageError}
                setImageError={setImageError}
                imageConfig={IMAGE_CONFIG}
            />
        </FormProvider>
    );
};

const TestWrapperWithFormAccess = ({
    children,
}: {
    children: (methods: ReturnType<typeof useForm<FormValues>>) => React.ReactNode;
}) => {
    const methods = useForm<FormValues>({ defaultValues: { image: null } });
    return <FormProvider {...methods}>{children(methods)}</FormProvider>;
};

describe('ImageUploadForm', () => {
    it('renders image input', () => {
        render(<Wrapper />);
        expect(screen.getByTestId('image-input-mock')).toBeInTheDocument();
    });

    it('shows error text from imageError', () => {
        render(<Wrapper imageError="Image size error" />);
        expect(screen.getByText('Image size error')).toBeInTheDocument();
    });

    it('shows error text from form errors', () => {
        render(<Wrapper errors={{ image: { message: 'Form error' } }} />);
        expect(screen.getByText('Form error')).toBeInTheDocument();
    });

    it('calls setImageError from ImageInput', () => {
        const setImageError = jest.fn();
        render(<Wrapper setImageError={setImageError} />);
        fireEvent.click(screen.getByTestId('trigger-image-error'));
        expect(setImageError).toHaveBeenCalledWith('Image size error');
    });

    it('updates form value via setValue when image changes', async () => {
        let formMethods: ReturnType<typeof useForm<FormValues>>;

        render(
            <TestWrapperWithFormAccess>
                {(methods) => {
                    formMethods = methods;

                    const _isDirty = methods.formState.isDirty;

                    return (
                        <ImageUploadForm<FormValues>
                            control={methods.control}
                            errors={{}}
                            imageError={null}
                            setImageError={jest.fn()}
                            imageConfig={IMAGE_CONFIG}
                        />
                    );
                }}
            </TestWrapperWithFormAccess>,
        );

        const newImage = { id: 1, url: 'test.jpg' };

        fireEvent.click(screen.getByTestId('trigger-image-change'));

        await waitFor(() => {
            expect(formMethods!.getValues('image')).toEqual(newImage);
            expect(formMethods!.formState.isDirty).toBe(true);
        });
    });

    it('works with custom name prop', async () => {
        let formMethods: ReturnType<typeof useForm<{ customImage: any }>>;

        const CustomWrapper = () => {
            const methods = useForm<{ customImage: any }>({ defaultValues: { customImage: null } });
            formMethods = methods;

            return (
                <FormProvider {...methods}>
                    <ImageUploadForm<{ customImage: any }>
                        control={methods.control}
                        errors={{}}
                        imageError={null}
                        setImageError={jest.fn()}
                        imageConfig={IMAGE_CONFIG}
                        name="customImage"
                    />
                </FormProvider>
            );
        };

        render(<CustomWrapper />);

        fireEvent.click(screen.getByTestId('trigger-image-change'));

        await waitFor(() => {
            expect(formMethods!.getValues('customImage')).toEqual({ id: 1, url: 'test.jpg' });
        });
    });

    it('passes disabled state to ImageInput', () => {
        const DisabledWrapper = () => {
            const methods = useForm<FormValues>({ defaultValues: { image: null } });

            return (
                <FormProvider {...methods}>
                    <ImageUploadForm<FormValues>
                        control={methods.control}
                        errors={{}}
                        imageError={null}
                        setImageError={jest.fn()}
                        imageConfig={IMAGE_CONFIG}
                        disabled
                    />
                </FormProvider>
            );
        };

        render(<DisabledWrapper />);

        expect(screen.getByTestId('image-input-mock')).toHaveAttribute('data-disabled', 'true');
    });
});
