import InfoIcon from '../../../assets/icons/info.svg';
import { COMMON_TEXT_ADMIN } from '../../../const/admin/common';
import './HintBox.scss';

export interface HintBoxProps {
    title: string;
    text?: string;
}

export const HintBox = ({ title, text }: HintBoxProps) => {
    return (
        <div className="hint-box">
            <div className="hint-box-title">
                <img src={InfoIcon} alt={COMMON_TEXT_ADMIN.ALT.HINT} />
                <span>{title}</span>
            </div>
            {text && <span>{text}</span>}
        </div>
    );
};
