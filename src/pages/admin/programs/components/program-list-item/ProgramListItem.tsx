import BlankImage from '../../../../../assets/images/admin/blank-image.svg';
import InfoIcon from '../../../../../assets/icons/info.svg';
import { Program } from '../../../../../types/ProgramAdminPage';
import {COMMON_TEXT_ADMIN} from "../../../../../const/admin/common";
import TooltipButton  from '../../../../../components/common/button-tooltip/ButtonTooltip';
import Status from "../../../../../components/common/status/Status";
import './programs-list-item.scss';

export interface ProgramListItemProps {
  program: Program;
  handleOnDeleteProgram: (program: Program) => void;
  handleOnEditProgram: (program: Program) => void;
}

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
          <Status status={program.status} />
        </div>
      </div>

      <div className="program-actions">
        <TooltipButton position="bottom">
          <div className="program-actions-tooltip">
              <b>{program.status == 'Published' ?
                  COMMON_TEXT_ADMIN.TOOLTIP.PUBLISHED_IN :
                  COMMON_TEXT_ADMIN.TOOLTIP.DRAFTED_IN}</b>
              {program.categories.map((c) => (
                <span key={c.id}>{c.name}</span>
              ))}
            </div>
        </TooltipButton>

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

export default ProgramListItem;
