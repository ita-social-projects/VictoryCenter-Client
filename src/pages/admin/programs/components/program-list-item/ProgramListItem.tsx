import { ButtonTooltip } from '../../../../../components/common/button-tooltip/ButtonTooltip';
import { VisibilityStatusLabel } from '../../../../../components/common/visibility-status-label/VisibilityStatusLabel';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import { VisibilityStatus } from '../../../../../types/admin/common';
import { Program } from '../../../../../types/admin/Programs';
import { mapImageToBase64 } from '../../../../../utils/functions/map-image-to-base-64/map-image-to-base-64';
import BlankImage from '../../../../../assets/icons/blank-image.svg';
import './ProgramListItem.scss';

export interface ProgramListItemProps {
    program: Program;
    handleOnDeleteProgram: (program: Program) => void;
    handleOnEditProgram: (program: Program) => void;
}

export const ProgramListItem = ({ program, handleOnDeleteProgram, handleOnEditProgram }: ProgramListItemProps) => {
    const OnEditProgram = () => handleOnEditProgram(program);
    const OnDeleteProgram = () => handleOnDeleteProgram(program);
    return (
        <div className="program-item">
            <div className="program-info">
                <div className="program-info-identity">
                    <img src={mapImageToBase64(program.img) || BlankImage} alt={`${program.name}-img`} />
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
                        onClick={OnEditProgram}
                        className="edit-btn"
                        aria-label={`Edit ${program.name}`}
                    />
                    <button
                        type="button"
                        onClick={OnDeleteProgram}
                        className="delete-btn"
                        aria-label={`Delete ${program.name}`}
                    />
                </div>
            </div>
        </div>
    );
};
