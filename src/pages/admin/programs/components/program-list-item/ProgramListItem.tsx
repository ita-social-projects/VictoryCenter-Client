import { ButtonTooltip } from '@components/admin/button-tooltip/ButtonTooltip';
import { VisibilityStatusLabel } from '@components/admin/visibility-status-label/VisibilityStatusLabel';
import { Program } from '@app-types/admin/programs';
import { VisibilityStatus } from '@app-types/admin/common';
import { ReactComponent as BlankImage } from '@assets/icons/blank-image.svg';
import { COMMON_TEXT_ADMIN } from '@const/admin/common';
import './ProgramListItem.scss';

export interface ProgramListItemProps {
    program: Program;
    handleOnDeleteProgram: (program: Program) => void;
    handleOnEditProgram: (program: Program) => void;
}

export const ProgramListItem = ({ program, handleOnDeleteProgram, handleOnEditProgram }: ProgramListItemProps) => {
    return (
        <div className="program-item">
            <div className="program-info">
                <div className="program-info-identity">
                    {program.image && 'url' in program.image ? (
                        <img src={program.image.url} alt={`${program.name}-img`} />
                    ) : (
                        <BlankImage className="program-info-identity-blank-image" />
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
