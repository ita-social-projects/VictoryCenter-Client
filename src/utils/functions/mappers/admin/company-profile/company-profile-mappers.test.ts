import { mapCompanyProfileToFormValues, mapFormValuesToCompanyProfilePatch } from './company-profile-mappers';
import { COMPANY_PROFILE_FORM_DEFAULTS } from '@/types/admin/company-profile';
import type { CompanyProfile, CompanyProfileFormValues, LocalizationLanguage } from '@/types/admin/company-profile';

describe('company-profile-mappers', () => {
    const languages: LocalizationLanguage[] = [
        { id: 1, code: 'uk', name: 'Українська' },
        { id: 2, code: 'en', name: 'English' },
    ];

    const baseProfile: CompanyProfile = {
        contact: {
            phone: '+380501112233',
            address: 'UA address',
            email: 'test@mail.com',
            correspondenceEmail: 'corr@mail.com',
            motto: 'UA motto',
            localizations: [
                {
                    languageId: 2,
                    address: 'EN address',
                    motto: 'EN motto',
                    language: { code: 'en' },
                } as any,
            ],
        } as any,
        requisite: {
            recipient: 'UA recipient',
            edrpou: '12345678',
            address: 'UA req address',
            localizations: [
                {
                    languageId: 2,
                    recipient: 'EN recipient',
                    address: 'EN req address',
                    language: { code: 'en' },
                } as any,
            ],
        } as any,
        socialLinks: [
            { socialPlatform: 'Viber', url: 'viber://chat' } as any,
            { socialPlatform: 'Instagram', url: 'https://instagram.com/a' } as any,
        ],
    } as any;

    it('maps CompanyProfile to form values with EN fallbacks and sorted social links', () => {
        const result = mapCompanyProfileToFormValues(baseProfile, languages);

        expect(result).toEqual({
            ...COMPANY_PROFILE_FORM_DEFAULTS,
            phone: '+380501112233',
            addressUa: 'UA address',
            addressEng: 'EN address',
            email: 'test@mail.com',
            correspondenceEmail: 'corr@mail.com',
            mottoUa: 'UA motto',
            mottoEng: 'EN motto',

            requisitesUa: 'UA recipient',
            requisitesEn: 'EN recipient',
            companyRegistrationNumber: '12345678',
            addressUa_requisites: 'UA req address',
            addressEn_requisites: 'EN req address',

            // sorted: Instagram should be before Viber
            socialContacts: [
                { platform: 'Instagram', url: 'https://instagram.com/a' },
                { platform: 'Viber', url: 'viber://chat' },
            ],
        });
    });

    it('maps form values to patch with trimming and EN fallback', () => {
        const formValues: CompanyProfileFormValues = {
            ...COMPANY_PROFILE_FORM_DEFAULTS,
            phone: '  +38050 111 22 33  ',
            email: '  test@mail.com ',
            correspondenceEmail: '  corr@mail.com ',
            addressUa: '  UA address  ',
            addressEng: '  ', // empty -> fallback to UA
            mottoUa: '  UA motto ',
            mottoEng: ' ', // empty -> fallback to UA motto
            requisitesUa: '  UA recipient ',
            requisitesEn: ' ', // fallback to UA recipient
            companyRegistrationNumber: ' 12345678 ',
            addressUa_requisites: ' UA req address ',
            addressEn_requisites: ' ', // fallback to UA req address
            socialContacts: [{ platform: 'Instagram', url: ' https://instagram.com/a ' }],
        };

        const patch = mapFormValuesToCompanyProfilePatch(formValues, languages);

        expect(patch.contact.phone).toBe('+38050 111 22 33');
        expect(patch.contact.email).toBe('test@mail.com');
        expect(patch.contact.correspondenceEmail).toBe('corr@mail.com');
        expect(patch.contact.address).toBe('UA address');

        const enContactLoc = patch.contact.localizations.find((l) => l.languageCode === 'en')!;
        expect(enContactLoc.address).toBe('UA address');
        expect(enContactLoc.motto).toBe('UA motto');

        const enReqLoc = patch.requisite.localizations.find((l) => l.languageCode === 'en')!;
        expect(enReqLoc.recipient).toBe('UA recipient');
        expect(enReqLoc.address).toBe('UA req address');

        expect(patch.socialLinks).toEqual([{ socialPlatform: 'Instagram', url: 'https://instagram.com/a' }]);
    });

    it('handles missing languages without throwing', () => {
        const patch = mapFormValuesToCompanyProfilePatch(COMPANY_PROFILE_FORM_DEFAULTS as any, undefined);
        expect(patch).toBeDefined();
        expect(patch.contact.localizations).toHaveLength(2);
        expect(patch.requisite.localizations).toHaveLength(2);
    });
});
