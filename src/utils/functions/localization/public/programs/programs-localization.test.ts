import { getLocalizedProgram } from './programs-localization';
import { DetailedProgram } from '@/types/public/programs-page';
import { HippotherapyProgramLocalization } from '@/types/admin/programs';
import { TranslationStatus } from '@/types/common/language';

const createMockProgram = (overrides?: Partial<DetailedProgram>): DetailedProgram => ({
    id: 1,
    name: 'Програма 1',
    description: 'Програма Програма 123 321',
    location: 'Десь',
    participantsCount: '1',
    meetingsCount: '50',
    slug: 'programa-1',
    previewImage: null,
    backgroundImage: null,
    sections: [{ id: 1, template: 'TextOnly', contents: [], order: 0 } as any],
    localizations: [],
    ...overrides,
});

const createMockLocalization = (
    code: string,
    overrides?: Partial<HippotherapyProgramLocalization>,
): HippotherapyProgramLocalization =>
    ({
        entityId: 1,
        translationStatus: TranslationStatus.Relevant,
        language: { id: 2, code },
        name: 'Program 1',
        description: 'Program Program 123 321',
        location: 'Somewhere',
        participantsCount: '1',
        meetingsCount: '50',
        sections: [],
        ...overrides,
    }) as HippotherapyProgramLocalization;

describe('getLocalizedProgram', () => {
    it('should return original program fields when localization is missing', () => {
        const program = createMockProgram();

        const result = getLocalizedProgram(program, 'en');

        expect(result.name).toBe(program.name);
        expect(result.description).toBe(program.description);
        expect(result.location).toBe(program.location);
        expect(result.participantsCount).toBe(program.participantsCount);
        expect(result.meetingsCount).toBe(program.meetingsCount);
        expect(result.sections).toEqual(program.sections);
    });

    it('should return fully localized fields when translation exists', () => {
        const localization = createMockLocalization('en');
        const program = createMockProgram({ localizations: [localization] });

        const result = getLocalizedProgram(program, 'en');

        expect(result.name).toBe(localization.name);
        expect(result.description).toBe(localization.description);
        expect(result.location).toBe(localization.location);
        expect(result.participantsCount).toBe(localization.participantsCount);
        expect(result.meetingsCount).toBe(localization.meetingsCount);
        expect(result.sections).toEqual(program.sections);
    });

    it('should fallback to original fields for missing or nullish localized fields', () => {
        const partialLocalization = createMockLocalization('en', {
            description: null as unknown as string,
            location: undefined,
            participantsCount: null as unknown as string,
            meetingsCount: undefined,
        });

        const program = createMockProgram({ localizations: [partialLocalization] });

        const result = getLocalizedProgram(program, 'en');

        expect(result.name).toBe(partialLocalization.name);
        expect(result.description).toBe(program.description);
        expect(result.location).toBe(program.location);
        expect(result.participantsCount).toBe(program.participantsCount);
        expect(result.meetingsCount).toBe(program.meetingsCount);
        expect(result.sections).toEqual(program.sections);
    });

    it('should ignore localizations with non-matching language codes', () => {
        const localization = createMockLocalization('fr', { name: 'Programme 1 FR' });
        const program = createMockProgram({ localizations: [localization] });

        const result = getLocalizedProgram(program, 'en');

        expect(result.name).toBe(program.name);
        expect(result.description).toBe(program.description);
    });
});
