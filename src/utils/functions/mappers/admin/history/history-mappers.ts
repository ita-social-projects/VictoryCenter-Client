import {
    HistorySectionContentDto,
    HistorySectionContent,
    HistorySectionContentLocalizationDto,
    HistorySectionContentLocalization,
    HistorySectionDto,
    HistorySection,
} from '@/types/common/history-sections';
import { mapLocalizationDtoToModel } from '@/utils/functions/mappers/common/localization/localization-mappers';

export function mapHistorySectionContentDtoToModel(dto: HistorySectionContentDto): HistorySectionContent {
    const mappedLocalizations = dto.localizations.map((localization) =>
        mapLocalizationDtoToModel<HistorySectionContentLocalizationDto, HistorySectionContentLocalization>(
            localization,
        ),
    );
    return {
        id: dto.id,
        sectionId: dto.sectionId,
        contentType: dto.contentType,
        order: dto.order,
        title: dto.title,
        description: dto.description,
        image: dto.image,
        imageId: dto.imageId,
        localizations: mappedLocalizations,
    };
}

export function mapHistorySectionDtoToModel(dto: HistorySectionDto): HistorySection {
    return {
        id: dto.id,
        programId: dto.programId,
        template: dto.template,
        order: dto.order,
        contents: dto.contents.map(mapHistorySectionContentDtoToModel),
    };
}
