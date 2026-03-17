import { DetailedProgram } from '@/types/public/programs-page';
import { returnDisplayedLocalization } from '@/utils/functions/localization/localization';
import { HippotherapyProgramSectionDto } from '@/types/common/program-sections';

export const getLocalizedProgram = (
    program: DetailedProgram,
    langCode: string,
): {
    name: string;
    description: string;
    location: string;
    participantsCount: string;
    meetingsCount: string;
    sections: HippotherapyProgramSectionDto[];
} => {
    const localization = returnDisplayedLocalization(program, langCode);

    if (!localization) {
        return {
            name: program.name,
            description: program.description,
            location: program.location,
            participantsCount: program.participantsCount,
            meetingsCount: program.meetingsCount,
            sections: program.sections,
        };
    }

    return {
        name: localization.name,
        description: localization.description ?? program.description,
        location: localization.location ?? program.location,
        participantsCount: localization.participantsCount ?? program.participantsCount,
        meetingsCount: localization.meetingsCount ?? program.meetingsCount,
        sections: program.sections,
    };
};
