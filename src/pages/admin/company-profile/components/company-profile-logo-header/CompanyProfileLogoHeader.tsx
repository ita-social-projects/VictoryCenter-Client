import { ReactComponent as Logo } from '@/assets/icons/logo.svg';
import { COMPANY_PROFILE_TEXT } from '@/const/admin/company-profile';
import './CompanyProfileLogoHeader.scss';

interface CompanyProfileLogoHeaderProps {
    isEditMode: boolean;
}

export const CompanyProfileLogoHeader = ({ isEditMode }: CompanyProfileLogoHeaderProps) => {
    return (
        <div className={`company-header${isEditMode ? ' company-header--editing' : ''}`}>
            <div className="company-logo-section">
                <div className="company-logo-wrapper">
                    <Logo className="company-logo-icon" />
                </div>
            </div>
            <div className="company-text-block">
                <h1 className="company-title">{COMPANY_PROFILE_TEXT.HEADER.TITLE}</h1>
                <p className="company-subtitle">{COMPANY_PROFILE_TEXT.HEADER.SUBTITLE}</p>
            </div>
        </div>
    );
};
