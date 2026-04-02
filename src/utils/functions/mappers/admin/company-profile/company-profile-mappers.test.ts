import { mapCompanyProfileToFormValues, mapFormValuesToCompanyProfilePatch } from './company-profile-mappers';
import { COMPANY_PROFILE_FORM_DEFAULTS } from '@/types/admin/company-profile';
import type { LocalizationLanguage } from '@/types/common/language';
import type { CompanyProfile, CompanyProfileFormValues } from '@/types/admin/company-profile';

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
                    localizationInfoDto: { code: 'en' },
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
                    localizationInfoDto: { code: 'en' },
                } as any,
            ],
        } as any,
        socialLinks: [
            { socialPlatform: 7, url: 'viber://chat' } as any, // Viber
            { socialPlatform: 0, url: 'https://instagram.com/a' } as any, // Instagram
        ],
    } as any;

    it('maps CompanyProfile to form values with EN localizations and numeric socialPlatform mapping', () => {
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

            socialContacts: [
                { platform: 'Instagram', url: 'https://instagram.com/a' },
                { platform: 'Viber', url: 'viber://chat' },
            ],
        });
    });

    it('maps form values to backend patch with trimming, fallbacks and numeric socialPlatform', () => {
        const formValues: CompanyProfileFormValues = {
            ...COMPANY_PROFILE_FORM_DEFAULTS,
            phone: '  +38050 111 22 33  ',
            email: '  test@mail.com ',
            correspondenceEmail: '  corr@mail.com ',
            addressUa: '  UA address  ',
            addressEng: '  ',
            mottoUa: '  UA motto ',
            mottoEng: ' ',
            requisitesUa: '  UA recipient ',
            requisitesEn: ' ',
            companyRegistrationNumber: ' 12345678 ',
            addressUa_requisites: ' UA req address ',
            addressEn_requisites: ' ',
            socialContacts: [{ platform: 'Instagram', url: ' https://instagram.com/a ' }],
        };

        const patch = mapFormValuesToCompanyProfilePatch(formValues, languages);

        expect(patch.contacts.phone).toBe('+38050 111 22 33');
        expect(patch.contacts.email).toBe('test@mail.com');
        expect(patch.contacts.correspondenceEmail).toBe('corr@mail.com');
        expect(patch.contacts.address).toBe('UA address');

        const [ukContactLoc, enContactLoc] = patch.contacts.localizations;
        expect(ukContactLoc.languageId).toBe(1);
        expect(enContactLoc.languageId).toBe(2);
        expect(enContactLoc.address).toBe('UA address');
        expect(enContactLoc.motto).toBe('UA motto');

        const [ukReqLoc, enReqLoc] = patch.requisites.localizations;
        expect(ukReqLoc.languageId).toBe(1);
        expect(enReqLoc.languageId).toBe(2);
        expect(enReqLoc.recipient).toBe('UA recipient');
        expect(enReqLoc.address).toBe('UA req address');

        expect(patch.socialLinks).toEqual([{ socialPlatform: 0, url: 'https://instagram.com/a' }]);
    });

    it('handles missing languages without throwing', () => {
        const patch = mapFormValuesToCompanyProfilePatch(COMPANY_PROFILE_FORM_DEFAULTS as any, undefined);

        expect(patch).toBeDefined();
        expect(patch.contacts.localizations).toHaveLength(2);
        expect(patch.requisites.localizations).toHaveLength(2);
        expect(patch.contacts.localizations[0].languageId).toBeUndefined();
    });

    it('resolves EN by languageId when localizationInfoDto/language code is missing', () => {
        const profile: CompanyProfile = {
            contact: {
                phone: '1',
                address: 'UA',
                email: 'a@a.com',
                correspondenceEmail: 'b@b.com',
                motto: 'UA motto',
                localizations: [{ languageId: 2, address: 'EN addr', motto: 'EN motto' } as any],
            } as any,
            requisite: {
                recipient: 'UA rec',
                edrpou: '123',
                address: 'UA req',
                localizations: [{ languageId: 2, recipient: 'EN rec', address: 'EN req' } as any],
            } as any,
            socialLinks: [],
        } as any;

        const result = mapCompanyProfileToFormValues(profile, [
            { id: 1, code: 'uk', name: 'Українська' },
            { id: 2, code: 'en', name: 'English' },
        ]);

        expect(result.addressEng).toBe('EN addr');
        expect(result.mottoEng).toBe('EN motto');
        expect(result.requisitesEn).toBe('EN rec');
        expect(result.addressEn_requisites).toBe('EN req');
    });

    it('filters out unsupported numeric social platform values', () => {
        const profile: CompanyProfile = {
            contact: {
                phone: '',
                address: '',
                email: '',
                correspondenceEmail: '',
                motto: '',
                localizations: [],
            } as any,
            requisite: {
                recipient: '',
                edrpou: '',
                address: '',
                localizations: [],
            } as any,
            socialLinks: [
                { socialPlatform: 999, url: 'https://unknown' } as any,
                { socialPlatform: 1, url: 'https://facebook.com/a' } as any,
            ],
        } as any;

        const result = mapCompanyProfileToFormValues(profile, languages);
        expect(result.socialContacts).toEqual([{ platform: 'Facebook', url: 'https://facebook.com/a' }]);
    });
});
