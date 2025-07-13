import BlankImage from '../../../../../assets/images/admin/blank-image.svg';
import InfoIcon from '../../../../../assets/icons/info.svg';
import { Program, ProgramStatus } from '../../../../../types/ProgramAdminPage';
import { Tooltip } from '../../../../../components/common/tooltip/Tooltip';
import classNames from 'classnames';
import './programs-list-item.scss';
import {PROGRAMS_TEXT} from "../../../../../const/admin/programs";

export interface ProgramListItemProps {
  program: Program;
  handleOnDeleteProgram: (program: Program) => void;
  handleOnEditProgram: (program: Program) => void;
}

const statusTypeToText = (status: ProgramStatus): string => {
  return status === 'Published' ? 'Опубліковано' : 'Чернетка';
};

export const ProgramListItem = ({
  program,
  handleOnDeleteProgram,
  handleOnEditProgram,
}: ProgramListItemProps) => {
  return (
    <div className="program-item">
      <div className="program-info">
        <div className="program-info-identity">
          <img src={program.img || BlankImage} alt={`${program.name}-img`} />
          <p>{program.name}</p>
        </div>
        <div className="program-info-description">
          <p>{program.description}</p>
        </div>
        <div className="program-info-status">
          <div
            className={classNames('program-status', {
              'draft': program.status === 'Draft',
              'published': program.status === 'Published',
            })}
          >
            <span>•</span>
            <span>{statusTypeToText(program.status)}</span>
          </div>
        </div>
      </div>

      <div className="program-actions">
        <Tooltip position="bottom">
          <Tooltip.Trigger>
            <img src={InfoIcon} alt="info" className="tooltip-icon" />
          </Tooltip.Trigger>
          <Tooltip.Content>
            <div className="program-actions-tooltip">
              <b>{program.status == 'Published' ?
                  PROGRAMS_TEXT.TOOLTIP.PUBLISHED_IN :
                  PROGRAMS_TEXT.TOOLTIP.DRAFTED_IN}</b>
              {program.categories.map((c) => (
                <span key={c.id}>{c.name}</span>
              ))}
            </div>
          </Tooltip.Content>
        </Tooltip>

        <div className="program-actions-buttons">
          <button
            type="button"
            onClick={() => handleOnEditProgram(program)}
            className="edit-btn"
          />
          <button
            type="button"
            onClick={() => handleOnDeleteProgram(program)}
            className="delete-btn"
          />
        </div>
      </div>
    </div>
  );
};
