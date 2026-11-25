import { getHippotherapyTranslationConfig } from './hippotherapy-page';
import { HippotherapyPageLocalizationBlock } from '@/types/admin/hippotherapy-page';

describe('getHippotherapyTranslationConfig', () => {
    it('uses the US #2688 rules for the hippovention center section fields', () => {
        const config = getHippotherapyTranslationConfig(HippotherapyPageLocalizationBlock.HippoventionCenter);

        expect(config?.fields.map(({ name, isRequired, maxLength }) => ({ name, isRequired, maxLength }))).toEqual([
            { name: 'title', isRequired: true, maxLength: 50 },
            { name: 'pros', isRequired: true, maxLength: 300 },
            { name: 'description', isRequired: false, maxLength: 300 },
        ]);
    });
});
