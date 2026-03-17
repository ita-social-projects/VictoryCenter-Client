import { ButtonTooltip } from '@/components/admin/button-tooltip/ButtonTooltip';
import { VisibilityStatusLabel } from '@/components/admin/visibility-status-label/VisibilityStatusLabel';
import { HippotherapyProgram, HippotherapyProgramLocalizableFields } from '@/types/admin/programs';
import { VisibilityStatus } from '@/types/admin/common';
import { ReactComponent as BlankImage } from '@/assets/icons/blank-image.svg';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import './ProgramListItem.scss';
import { LocalizationLanguage } from '@/types/common/language';
import { useEffect, useState } from 'react';
import { returnDisplayedLocalization } from '@/utils/functions/localization/localization';
import { LocalizationStatuses } from '@/components/admin/localization-statuses/LocalizationStatuses';

export interface ProgramListItemProps {
    program: HippotherapyProgram;
    language: LocalizationLanguage;
    translationLanguages: LocalizationLanguage[];
    handleOnDeleteProgram: (program: HippotherapyProgram) => void;
    handleOnEditProgram: (program: HippotherapyProgram) => void;
    handleOnTranslateProgram: (program: HippotherapyProgram) => void;
}

export const ProgramListItem = ({
    program,
    language,
    translationLanguages,
    handleOnDeleteProgram,
    handleOnEditProgram,
    handleOnTranslateProgram,
}: ProgramListItemProps & { handleOnTranslateProgram: (program: HippotherapyProgram) => void }) => {
    const [textFields, setTextFields] = useState<Partial<HippotherapyProgramLocalizableFields>>();
    useEffect(() => {
        const displayedLocalization = returnDisplayedLocalization(program, language.code);
        setTextFields({
            name: displayedLocalization?.name || program.name,
            description: displayedLocalization?.description || program.description,
        });
    }, [language, program]);
    return (
        <div className="program-item">
            <div className="program-info">
                <div className="program-info-identity">
                    {program.previewImage && 'url' in program.previewImage ? (
                        <img src={program.previewImage.url} alt={`${program.name}-img`} />
                    ) : (
                        <BlankImage className="program-info-identity-blank-image" />
                    )}
                    <p>{textFields?.name || program.name}</p>
                    <LocalizationStatuses languages={translationLanguages} localizedEntity={program} />
                </div>
                <div className="program-info-description">
                    <p>{textFields?.description || program.description}</p>
                </div>
                <div className="program-info-status">
                    <VisibilityStatusLabel status={program.status} />
                </div>
            </div>
            <div className="program-actions">
                <ButtonTooltip position="bottom">
                    <div className="program-actions-tooltip">
                        <b>
                            {program.status === VisibilityStatus.Published
                                ? COMMON_TEXT_ADMIN.TOOLTIP.PUBLISHED_IN
                                : COMMON_TEXT_ADMIN.TOOLTIP.DRAFTED_IN}
                        </b>
                        {program.categories.map((c) => (
                            <span key={c.id}>{c.name}</span>
                        ))}
                    </div>
                </ButtonTooltip>
                <div className="program-actions-buttons">
                    <button
                        type="button"
                        onClick={() => handleOnTranslateProgram(program)}
                        className="translate-btn"
                        aria-label="Translate"
                    />
                    <button
                        type="button"
                        onClick={() => handleOnEditProgram(program)}
                        className="edit-btn"
                        aria-label={`Edit ${program.name}`}
                    />
                    <button
                        type="button"
                        onClick={() => handleOnDeleteProgram(program)}
                        className="delete-btn"
                        aria-label={`Delete ${program.name}`}
                    />
                </div>
            </div>
        </div>
    );
};
