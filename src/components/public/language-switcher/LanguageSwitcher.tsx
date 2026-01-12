import '@/locales/i18n';
import { Select } from '@/components/common/select/Select';
import { LOCALES } from '@/const/common/locales';
import classNames from 'classnames';
import './LanguageSwitcher.scss';
import { useLocale } from '@/hooks/common/use-locale/useLocale';

export interface LanguageSwitcherProps {
    onValueChange?: () => void;
    className?: string;
}

export const LanguageSwitcher = ({ onValueChange, className }: LanguageSwitcherProps) => {
    const { changeLanguage, currentLanguage } = useLocale();

    const handleChangeLanguage = (lng: string) => {
        changeLanguage(lng);
        onValueChange?.();
    };

    return (
        <Select<string>
            value={currentLanguage}
            onValueChange={handleChangeLanguage}
            placeholder="lng"
            className={classNames('language-switcher', className)}
            headClassName="language-switcher-head"
        >
            {LOCALES.map((lng) => (
                <Select.Option key={lng} value={lng} name={lng.toUpperCase()} />
            ))}
        </Select>
    );
};
