import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EditableImagesBottomSection } from './EditableImagesBottomSection';
import { SectionMode } from '@/types/common/sections';
import { getImageSrc } from '@/utils/functions/image-helper/image-helper';

const photoCalls: any[] = [];

jest.mock('@/components/admin/input-groups/photo-input-group/PhotoInputGroup', () => ({
    PhotoInputGroup: (props: any) => {
        photoCalls.push(props);
        return (
            <div data-testid={`photo-${props.id}`}>
                <button
                    data-testid={`photo-change-${props.id}`}
                    type="button"
                    onClick={() => props.onChange('v')}
                    aria-label="Change photo"
                />
                <button
                    data-testid={`photo-error-${props.id}`}
                    type="button"
                    onClick={() => props.setError('ERR')}
                    aria-label="Set error"
                />
            </div>
        );
    },
}));

jest.mock('@/const/admin/common', () => ({
    COMMON_TEXT_ADMIN: {
        INPUT: {
            getImageSizeSubText: jest.fn((h: number, w: number) => `size-${h}x${w}`),
        },
    },
}));

jest.mock('@/const/admin/programs', () => ({
    PROGRAM_VALIDATION: {
        images: { maxSizeMB: 5 },
    },
}));

jest.mock('@/utils/functions/image-helper/image-helper', () => ({
    getImageSrc: jest.fn(),
}));

jest.mock('./ImagesBottomSection.module.scss', () => ({
    'bottom-section': 'bottom-section',
    'images-grid': 'images-grid',
    'image-wrapper': 'image-wrapper',
    image: 'image',
}));

describe('EditableImagesBottomSection', () => {
    const config = {
        elevatedIndices: [1],
        imageLabel: 'label',
        imageConfig: {
            cropWidth: 10,
            cropHeight: 20,
            minWidth: 30,
            minHeight: 40,
        },
    } as any;

    const renderComponent = (override: Partial<React.ComponentProps<typeof EditableImagesBottomSection>> = {}) => {
        photoCalls.length = 0;

        const props: React.ComponentProps<typeof EditableImagesBottomSection> = {
            images: [null, null],
            imageHandlers: [
                { key: 'k0', value: null, handler: jest.fn() },
                { key: 'k1', value: null, handler: undefined },
            ],
            imageKeys: ['i0', 'i1'],
            config,
            mode: SectionMode.Edit,
            errors: ['', 'E1'],
            onSetError: jest.fn(),
            ...override,
        };

        return { ...render(<EditableImagesBottomSection {...props} />), props };
    };

    it('renders PhotoInputGroup list in edit mode', () => {
        renderComponent({ mode: SectionMode.Edit });

        expect(screen.getByTestId('photo-section-image-1')).toBeInTheDocument();
        expect(screen.getByTestId('photo-section-image-2')).toBeInTheDocument();
    });

    it('sets data-elevated for elevated indices in edit mode', () => {
        renderComponent({ mode: SectionMode.Edit });

        const wrappers = screen.getAllByTestId('image-wrapper');
        expect(wrappers[1]).toHaveAttribute('data-elevated', 'true');
        expect(wrappers[0]).not.toHaveAttribute('data-elevated');
    });

    it('uses handler when provided and no-op when missing', () => {
        const handler0 = jest.fn();
        renderComponent({
            mode: SectionMode.Edit,
            imageHandlers: [
                { key: 'k0', value: null, handler: handler0 },
                { key: 'k1', value: null, handler: undefined },
            ],
        });

        fireEvent.click(screen.getByTestId('photo-change-section-image-1'));
        expect(handler0).toHaveBeenCalledTimes(1);

        expect(() => fireEvent.click(screen.getByTestId('photo-change-section-image-2'))).not.toThrow();
    });

    it('maps PhotoInputGroup setError into onSetError with index', () => {
        const onSetError = jest.fn();
        renderComponent({ mode: SectionMode.Edit, onSetError });

        fireEvent.click(screen.getByTestId('photo-error-section-image-2'));
        expect(onSetError).toHaveBeenCalledWith(1, 'ERR');
    });

    it('disables PhotoInputGroup in view mode', () => {
        renderComponent({ mode: SectionMode.View });

        expect(photoCalls[0].disabled).toBe(true);
        expect(photoCalls[1].disabled).toBe(true);
    });

    it('renders images with src in Template mode', () => {
        (getImageSrc as jest.Mock).mockReturnValueOnce('src-1').mockReturnValueOnce('');

        renderComponent({
            mode: SectionMode.Template,
            images: [{ url: 'u', mimeType: 'image/png', id: 1 } as any, null],
            imageKeys: ['a', 'b'],
        });

        expect(getImageSrc).toHaveBeenCalledTimes(2);

        const imgs = screen.getAllByRole('img');
        expect(imgs).toHaveLength(1);
        expect(imgs[0]).toHaveAttribute('src', 'src-1');
        expect(imgs[0]).toHaveAttribute('alt', 'Program section 1');
    });

    it('applies provided wrapper class names', () => {
        const { container } = renderComponent({
            bottomSectionClassName: 'bottom-extra',
            imageWrapperClassName: 'wrap-extra',
            mode: SectionMode.Edit,
        });

        expect(container.firstChild).toHaveClass('bottom-extra');

        const wrappers = screen.getAllByTestId('image-wrapper');
        expect(wrappers[0]).toHaveClass('wrap-extra');
    });
});
