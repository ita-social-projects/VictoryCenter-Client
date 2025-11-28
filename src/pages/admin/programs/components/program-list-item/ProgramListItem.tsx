import { ButtonTooltip } from '../../../../../components/admin/button-tooltip/ButtonTooltip';
import { VisibilityStatusLabel } from '../../../../../components/admin/visibility-status-label/VisibilityStatusLabel';
import styles from './ProgramListItem.module.scss';
import { Program } from '../../../../../types/admin/programs';
import { VisibilityStatus } from '../../../../../types/admin/common';
import { ReactComponent as BlankImage } from '../../../../../assets/icons/blank-image.svg';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';

export interface ProgramListItemProps {
    program: Program;
    handleOnDeleteProgram: (program: Program) => void;
    handleOnEditProgram: (program: Program) => void;
}

export const ProgramListItem = ({ program, handleOnDeleteProgram, handleOnEditProgram }: ProgramListItemProps) => {
    return (
        <div className={styles['program-item']}>
            <div className={styles['program-info']}>
                <div className={styles['program-info-identity']}>
                    {program.image && 'url' in program.image ? (
                        <img src={program.image.url} alt={`${program.name}-img`} />
                    ) : (
                        <BlankImage className={styles['program-info-identity-blank-image']} />
                    )}
                    <p>{program.name}</p>
                </div>
                <div className={styles['program-info-description']}>
                    <p>{program.description}</p>
                </div>
                <div className={styles['program-info-status']}>
                    <VisibilityStatusLabel status={program.status} />
                </div>
            </div>
            <div className={styles['program-actions']}>
                <ButtonTooltip position="bottom">
                    <div className={styles['program-actions-tooltip']}>
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
                <div className={styles['program-actions-buttons']}>
                    <button
                        type="button"
                        onClick={() => handleOnEditProgram(program)}
                        className={styles['edit-btn']}
                        aria-label={`Edit ${program.name}`}
                    />
                    <button
                        type="button"
                        onClick={() => handleOnDeleteProgram(program)}
                        className={styles['delete-btn']}
                        aria-label={`Delete ${program.name}`}
                    />
                </div>
            </div>
        </div>
    );
};
