import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import { ButtonTooltip } from '../../../../../components/admin/button-tooltip/ButtonTooltip';
import { mapImageToBase64 } from '../../../../../utils/functions/map-image-to-base-64/map-image-to-base-64';
import { VisibilityStatusLabel } from '../../../../../components/admin/visibility-status-label/VisibilityStatusLabel';
import { ReactComponent as BlankImage } from '../../../../../assets/icons/blank-image.svg';
import './ProgramListItem.scss';
import { Program } from '../../../../../types/admin/programs';
import { VisibilityStatus } from '../../../../../types/admin/common';

export interface ProgramListItemProps {
    program: Program;
    handleOnDeleteProgram: (program: Program) => void;
    handleOnEditProgram: (program: Program) => void;
}

export const ProgramListItem = ({ program, handleOnDeleteProgram, handleOnEditProgram }: ProgramListItemProps) => {
    const programImage = mapImageToBase64(program.img);
    const isImageValid = !!programImage;

    return (
        <div className="program-item">
            <div className="program-info">
                <div className="program-info-identity">
                    {isImageValid ? (
                        <img src={programImage} alt={`${program.name}-img`} className="program-img" />
                    ) : (
                        <BlankImage className="program-img" />
                    )}
                    <p>{program.name}</p>
                </div>
                <div className="program-info-description">
                    <p>{program.description}</p>
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
