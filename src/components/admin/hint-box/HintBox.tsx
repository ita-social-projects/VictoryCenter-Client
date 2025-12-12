import { ReactComponent as InfoIcon } from '@/assets/icons/info.svg';
import './HintBox.scss';

export interface HintBoxProps {
    title: string;
    text?: string;
}

export const HintBox = ({ title, text }: HintBoxProps) => {
    return (
        <div className="hint-box">
            <div className="hint-box-title">
                <InfoIcon className="info-icon" />
                <span>{title}</span>
            </div>
            {text && <span>{text}</span>}
        </div>
    );
};
