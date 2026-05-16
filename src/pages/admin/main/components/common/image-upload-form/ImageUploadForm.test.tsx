import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { ImageUploadForm } from './ImageUploadForm';

jest.mock('@/components/admin/image-input/ImageInput', () => ({
    ImageInput: ({ setError }: any) => (
        <div data-testid="image-input-mock">
            <button data-testid="trigger-image-error" type="button" onClick={() => setError('Image size error')}>
                Set Error
            </button>
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
});
