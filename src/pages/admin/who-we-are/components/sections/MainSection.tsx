import { BaseSection } from '../base-section/BaseSection';
import { SectionType, WhoWeAreSection } from '../../../../../types/admin/who-we-are';
import { ImageInputProps } from "../../../../../components/admin/image-input/ImageInput";
import { WHO_WE_ARE_TEXT } from "../../../../../const/admin/who-we-are";

interface MainSectionProps {
    section: WhoWeAreSection;
}

export const MainSection = ({ section }: MainSectionProps) => {
    const titleLimit = 100;
    const descriptionLimit = 300;

    const commonImageProps: Omit<ImageInputProps, "className"> = {
        value: null,
        onChange: () => {},
        label: WHO_WE_ARE_TEXT.IMAGE.INPUT,
        subText: "1440x860",
    };

    if (!section) return null;

    switch (section.sectionType) {
        case SectionType.Main:
            return (
                <BaseSection
                    section={section}
                    descriptionLimit={descriptionLimit}
                    titleLimit={titleLimit}
                    className=""
                    imageProps={{ ...commonImageProps, className: "who-we-are-image-input-wrapper--main" }}
                />
            );

        case SectionType.Team:
            return (
                <BaseSection
                    section={section}
                    descriptionLimit={descriptionLimit}
                    titleLimit={titleLimit}
                    className=""
                    imageProps={{ ...commonImageProps, className: "who-we-are-image-input-wrapper--team" }}
                />
            );

        default:
            return null;
    }
};
