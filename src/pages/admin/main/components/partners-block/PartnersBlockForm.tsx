import { MAIN_PAGE_TEXT, MAIN_PAGE_VALIDATION } from '@/const/admin/main-page';
import { MainPageTextBlockForm } from '@/pages/admin/main/components/common/main-page-text-block-form/MainPageTextBlockForm';
import { MainPageFormValues } from '@/types/admin/main-page';
import { useFormContext } from 'react-hook-form';

interface PartnersBlockFormProps {
    isPublishDisabled: boolean;
    onPublish: () => void;
    isReadOnly?: boolean;
}

export const PartnersBlockForm = ({ isPublishDisabled, onPublish, isReadOnly = false }: PartnersBlockFormProps) => {
    const {
        control,
        formState: { errors },
    } = useFormContext<MainPageFormValues>();

    const titleName = isReadOnly ? 'partnersTitleEn' : 'partnersTitleUa';
    const descriptionName = isReadOnly ? 'partnersDescriptionEn' : 'partnersDescriptionUa';

    return (
        <MainPageTextBlockForm
            control={control}
            titleName={titleName}
            descriptionName={descriptionName}
            titleId="partners-block-title"
            descriptionId="partners-block-description"
            titleLabel={MAIN_PAGE_TEXT.BLOCKS.PARTNERS.TITLE_LABEL}
            descriptionLabel={MAIN_PAGE_TEXT.BLOCKS.PARTNERS.DESCRIPTION_LABEL}
            titleMaxLength={MAIN_PAGE_VALIDATION.partnersBlock.title.max}
            descriptionMaxLength={MAIN_PAGE_VALIDATION.partnersBlock.description.max}
            titleError={isReadOnly ? undefined : errors.partnersTitleUa?.message}
            descriptionError={isReadOnly ? undefined : errors.partnersDescriptionUa?.message}
            isReadOnly={isReadOnly}
            isPublishDisabled={isPublishDisabled}
            onPublish={onPublish}
        />
    );
};
