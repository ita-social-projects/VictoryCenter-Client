import {Content, ContentType} from "../../../../../types/admin/who-we-are";
import {
    TextAreaWithCharacterLimit
} from "../../../../../components/admin/textarea-with-character-limit/TextAreaWithCharacterLimit";
import {COMMON_TEXT_ADMIN} from "../../../../../const/admin/common";

interface BaseContentProps{
    content: Content
    descriptionLimit: number
    titleLimit: number
}
export const BaseContent = ({content, titleLimit, descriptionLimit}: BaseContentProps) => {

    switch (content.contentType) {
        case ContentType.Card:
            return <img src={content.image.url} alt={''} />;
        case (ContentType.Title):
            return <TextAreaWithCharacterLimit value = {content.title} maxLength={titleLimit} name={COMMON_TEXT_ADMIN.TYPE.TITLE} id={content.id.toString()}></TextAreaWithCharacterLimit>;
        default:
            return null;
    }
}