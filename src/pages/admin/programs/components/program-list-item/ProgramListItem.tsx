import BlankImage from '../../../../../assets/images/admin/blank-image.svg'
import InfoIcon from '../../../../../assets/icons/info.svg';
import {Program, ProgramStatus} from '../../../../../types/ProgramAdminPage';
import {Tooltip} from '../../../../../components/common/tooltip/Tooltip';
import classNames from 'classnames';
import './programs-list-item.scss';

export interface ProgramListItemProps {
    program: Program;
    handleOnDeleteProgram: (program: Program) => void;
    handleOnEditProgram: (program: Program) => void;
}

const statusTypeToText = (status: ProgramStatus) => {
    return status === "Published" ? "Опубліковано" : "Чернетка";
}

export const ProgramListItem = ({
                                    program,
                                    handleOnDeleteProgram,
                                    handleOnEditProgram
                                }: ProgramListItemProps) => {
    return (
        <div className="programs-wrapper">
            <div className="programs-identity">
                <img src={program.img || BlankImage} alt={`${program.name}-img`}/>
                <p>{program.name}</p>
            </div>
            <div className="programs-description">
                <p>{program.description}</p>
            </div>
            <div className="programs-controls">
                <div className="programs-status-container">
                    <div className={classNames('programs-status', {
                        'programs-status-draft': program.status === 'Draft',
                        'programs-status-published': program.status === 'Published',
                    })}>
                        <span>•</span>
                        <span>{statusTypeToText(program.status)}</span>
                    </div>
                </div>
                <div className="programs-actions">
                    <div className="programs-actions-spacer"/>
                    <Tooltip position="bottom">
                        <Tooltip.Trigger>
                            <img src={InfoIcon} alt="info" className="tooltip-icon"/>
                        </Tooltip.Trigger>
                        <Tooltip.Content>
                            <div className="programs-actions-tooltip-container">
                                <b>Опубліковано в:</b>
                                {program.categories.map(c => <span key={c.id}>{c.name}</span>)}
                            </div>
                        </Tooltip.Content>
                    </Tooltip>
                    <div className="programs-actions-spacer"/>
                    <button type="button" onClick={() => handleOnEditProgram(program)} className="programs-actions-edit" />
                    <button type="button" onClick={() => handleOnDeleteProgram(program)} className="programs-actions-delete" />
                </div>
            </div>
        </div>
    );
}
