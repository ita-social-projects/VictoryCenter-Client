import { MAIN_PAGE_TEXT, MAIN_PAGE_VALIDATION } from '@/const/admin/main-page';
import { MainPageTextBlockForm } from '@/pages/admin/main/components/common/main-page-text-block-form/MainPageTextBlockForm';
import { MainPageFormValues } from '@/types/admin/main-page';
import { useFormContext } from 'react-hook-form';

interface AboutUsBlockFormProps {
    isPublishDisabled: boolean;
    onPublish: () => void;
    isReadOnly?: boolean;
}

export const AboutUsBlockForm = ({ isPublishDisabled, onPublish, isReadOnly = false }: AboutUsBlockFormProps) => {
    const {
        control,
        formState: { errors },
    } = useFormContext<MainPageFormValues>();

    const titleName = isReadOnly ? 'aboutUsTitleEn' : 'aboutUsTitleUa';
    const descriptionName = isReadOnly ? 'aboutUsDescriptionEn' : 'aboutUsDescriptionUa';

    return (
        <MainPageTextBlockForm
            control={control}
            titleName={titleName}
            descriptionName={descriptionName}
            titleId="about-us-block-title"
            descriptionId="about-us-block-description"
            titleLabel={MAIN_PAGE_TEXT.BLOCKS.ABOUT_US.TITLE_LABEL}
            descriptionLabel={MAIN_PAGE_TEXT.BLOCKS.ABOUT_US.DESCRIPTION_LABEL}
            titleMaxLength={MAIN_PAGE_VALIDATION.aboutUsBlock.title.max}
            descriptionMaxLength={MAIN_PAGE_VALIDATION.aboutUsBlock.description.max}
            titleError={isReadOnly ? undefined : errors.aboutUsTitleUa?.message}
            descriptionError={isReadOnly ? undefined : errors.aboutUsDescriptionUa?.message}
            isReadOnly={isReadOnly}
            isPublishDisabled={isPublishDisabled}
            onPublish={onPublish}
        />
    );
};
