import '../../../locales/i18n';
import { useTranslation } from 'react-i18next';
import { Select } from '../../common/select/Select';
import { LOCALES } from '../../../const/common/locales';
import classNames from 'classnames';
import './LanguageSwitcher.scss';

export interface LanguageSwitcherProps {
    onValueChange?: () => void;
    className?: string;
}

export const LanguageSwitcher = ({ onValueChange, className }: LanguageSwitcherProps) => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
        onValueChange?.();
    };

    return (
        <Select<string>
            value={i18n.language}
            onValueChange={changeLanguage}
            placeholder="lng"
            className={classNames('language-switcher', className)}
            headClassName="language-switcher-head"
            data-testid="language-switcher"
        >
            {LOCALES.map((lng) => (
                <Select.Option key={lng} value={lng} name={lng.toUpperCase()} />
            ))}
        </Select>
    );
};
