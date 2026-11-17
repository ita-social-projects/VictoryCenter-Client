import { HippotherapyPageLocalizationBlock, HippotherapyScientificReference } from '@/types/admin/hippotherapy-page';
import { getEthicsPrincipleFieldName, getGalleryCardDescriptionFieldName } from '@/const/admin/hippotherapy-page';
import {
    mapFormValuesToTextCardSectionDto,
    mapFormValuesToCreateTextCardSectionDto,
    mapFormValuesToQuoteSectionDto,
    mapFormValuesToCreateQuoteSectionDto,
    mapFormValuesToHippoventionCenterSectionDto,
    mapFormValuesToCreateHippoventionCenterSectionDto,
    mapFormValuesToGallerySectionDto,
    mapFormValuesToCreateGallerySectionDto,
    mapFormValuesToEthicsSectionDto,
    mapFormValuesToCreateEthicsSectionDto,
    mapFormValuesToScientificReferencesSectionDto,
    mapFormValuesToCreateScientificReferencesSectionDto,
    mapHippotherapySectionFormValuesToDto,
    SectionMapContext,
    GallerySectionMapContext,
    EthicsSectionMapContext,
    ScientificReferencesSectionMapContext,
} from './hippotherapy-localization-mappers';

describe('hippotherapy-localization-mappers', () => {
    const baseContext: SectionMapContext = {
        entityId: 10,
        languageId: 2,
    };

    describe('TextCard section mappers', () => {
        it('maps form values to update DTO with fallback to empty strings', () => {
            expect(mapFormValuesToTextCardSectionDto({ title: 'Title', description: 'Desc' })).toEqual({
                title: 'Title',
                description: 'Desc',
            });
            expect(mapFormValuesToTextCardSectionDto({})).toEqual({
                title: '',
                description: '',
            });
        });

        it('maps form values to create DTO with entityId and languageId', () => {
            const result = mapFormValuesToCreateTextCardSectionDto(
                { title: 'Title', description: 'Desc' },
                baseContext,
            );
            expect(result).toEqual({
                title: 'Title',
                description: 'Desc',
                entityId: 10,
                languageId: 2,
            });
        });
    });

    describe('Quote section mappers', () => {
        it('maps form values to update DTO and normalizes authorName to null when empty', () => {
            expect(mapFormValuesToQuoteSectionDto({ quoteText: 'Quote', authorName: 'Author' })).toEqual({
                quoteText: 'Quote',
                authorName: 'Author',
            });
            expect(mapFormValuesToQuoteSectionDto({ quoteText: 'Quote', authorName: '' })).toEqual({
                quoteText: 'Quote',
                authorName: null,
            });
            expect(mapFormValuesToQuoteSectionDto({})).toEqual({
                quoteText: '',
                authorName: null,
            });
        });

        it('maps form values to create DTO with context', () => {
            const result = mapFormValuesToCreateQuoteSectionDto(
                { quoteText: 'Quote', authorName: 'Author' },
                baseContext,
            );
            expect(result).toEqual({
                quoteText: 'Quote',
                authorName: 'Author',
                entityId: 10,
                languageId: 2,
            });
        });
    });

    describe('HippoventionCenter section mappers', () => {
        it('maps form values to update DTO', () => {
            expect(
                mapFormValuesToHippoventionCenterSectionDto({
                    title: 'Center Title',
                    description: 'Center Desc',
                    pros: 'Pros text',
                }),
            ).toEqual({
                title: 'Center Title',
                description: 'Center Desc',
                pros: 'Pros text',
            });
        });

        it('maps form values to create DTO with context', () => {
            const result = mapFormValuesToCreateHippoventionCenterSectionDto(
                { title: 'T', description: 'D', pros: 'P' },
                baseContext,
            );
            expect(result).toEqual({
                title: 'T',
                description: 'D',
                pros: 'P',
                entityId: 10,
                languageId: 2,
            });
        });
    });

    describe('Gallery section mappers (Advantages / Participants)', () => {
        const galleryContext: GallerySectionMapContext = {
            ...baseContext,
            cardIds: [101, 102],
        };

        it('maps form values to update DTO using getGalleryCardDescriptionFieldName', () => {
            const values = {
                title: 'Gallery Title',
                [getGalleryCardDescriptionFieldName(101)]: 'Card 1 text',
                [getGalleryCardDescriptionFieldName(102)]: 'Card 2 text',
            };

            const result = mapFormValuesToGallerySectionDto(values, galleryContext);
            expect(result).toEqual({
                title: 'Gallery Title',
                cards: [
                    { cardId: 101, description: 'Card 1 text' },
                    { cardId: 102, description: 'Card 2 text' },
                ],
            });
        });

        it('handles missing card values with empty strings', () => {
            const result = mapFormValuesToGallerySectionDto({ title: 'Gallery' }, galleryContext);
            expect(result.cards).toEqual([
                { cardId: 101, description: '' },
                { cardId: 102, description: '' },
            ]);
        });

        it('maps form values to create DTO with context', () => {
            const result = mapFormValuesToCreateGallerySectionDto({ title: 'G' }, galleryContext);
            expect(result.entityId).toBe(10);
            expect(result.languageId).toBe(2);
            expect(result.cards).toHaveLength(2);
        });
    });

    describe('Ethics section mappers', () => {
        const ethicsContext: EthicsSectionMapContext = {
            ...baseContext,
            principleIds: [201, 202],
        };

        it('maps form values to update DTO using getEthicsPrincipleFieldName', () => {
            const values = {
                title: 'Ethics Title',
                description: 'Ethics Desc',
                [getEthicsPrincipleFieldName(201)]: 'Principle 1',
                [getEthicsPrincipleFieldName(202)]: 'Principle 2',
            };

            const result = mapFormValuesToEthicsSectionDto(values, ethicsContext);
            expect(result).toEqual({
                title: 'Ethics Title',
                description: 'Ethics Desc',
                principles: [
                    { principleId: 201, text: 'Principle 1' },
                    { principleId: 202, text: 'Principle 2' },
                ],
            });
        });

        it('maps form values to create DTO with context', () => {
            const result = mapFormValuesToCreateEthicsSectionDto({ title: 'E' }, ethicsContext);
            expect(result.entityId).toBe(10);
            expect(result.languageId).toBe(2);
        });
    });

    describe('ScientificReferences section mappers', () => {
        const mockReferences: HippotherapyScientificReference[] = [
            { localId: 'local-1', id: 501, name: 'Base Research 1', url: 'https://ex.com/1' },
            { localId: 'local-2', id: 502, name: 'Base Research 2', url: 'https://ex.com/2' },
        ];

        describe('general subBlock', () => {
            it('maps title and description from form and preserves existing translated references', () => {
                const context: ScientificReferencesSectionMapContext = {
                    ...baseContext,
                    subBlock: 'general',
                    scientificReferences: mockReferences,
                    existingSectionLocalization: {
                        title: 'Old General Title',
                        description: 'Old General Description',
                        references: [{ referenceId: 501, name: 'Translated Ref 1' }],
                    },
                };

                const values = {
                    title: 'New General Title',
                    description: 'New General Description',
                };

                const result = mapFormValuesToScientificReferencesSectionDto(values, context);

                expect(result).toEqual({
                    title: 'New General Title',
                    description: 'New General Description',
                    references: [{ referenceId: 501, name: 'Translated Ref 1' }],
                });
            });

            it('returns empty references array if no existing localization exists', () => {
                const context: ScientificReferencesSectionMapContext = {
                    ...baseContext,
                    subBlock: 'general',
                    scientificReferences: mockReferences,
                    existingSectionLocalization: null,
                };

                const result = mapFormValuesToScientificReferencesSectionDto(
                    { title: 'New Title', description: 'New Desc' },
                    context,
                );

                expect(result.references).toEqual([]);
            });

            it('filters out references with whitespace-only or empty names', () => {
                const context: ScientificReferencesSectionMapContext = {
                    ...baseContext,
                    subBlock: 'general',
                    scientificReferences: mockReferences,
                    existingSectionLocalization: {
                        references: [
                            { referenceId: 501, name: 'Valid Ref' },
                            { referenceId: 502, name: '   ' },
                        ],
                    },
                };

                const result = mapFormValuesToScientificReferencesSectionDto({}, context);
                expect(result.references).toEqual([{ referenceId: 501, name: 'Valid Ref' }]);
            });
        });

        describe('research subBlock', () => {
            it('preserves existing title and description, and adds new reference translation', () => {
                const context: ScientificReferencesSectionMapContext = {
                    ...baseContext,
                    subBlock: 'research',
                    targetResearchLocalId: 'local-2',
                    scientificReferences: mockReferences,
                    existingSectionLocalization: {
                        title: 'Saved Title',
                        description: 'Saved Desc',
                        references: [{ referenceId: 501, name: 'Translated Ref 1' }],
                    },
                };

                const values = { name: 'Translated Ref 2' };

                const result = mapFormValuesToScientificReferencesSectionDto(values, context);

                expect(result).toEqual({
                    title: 'Saved Title',
                    description: 'Saved Desc',
                    references: [
                        { referenceId: 501, name: 'Translated Ref 1' },
                        { referenceId: 502, name: 'Translated Ref 2' },
                    ],
                });
            });

            it('preserves existing title and description, and updates existing reference translation', () => {
                const context: ScientificReferencesSectionMapContext = {
                    ...baseContext,
                    subBlock: 'research',
                    targetResearchLocalId: 'local-1',
                    scientificReferences: mockReferences,
                    existingSectionLocalization: {
                        title: 'Saved Title',
                        description: 'Saved Desc',
                        references: [
                            { referenceId: 501, name: 'Old Ref 1 Name' },
                            { referenceId: 502, name: 'Old Ref 2 Name' },
                        ],
                    },
                };

                const values = { name: 'Updated Ref 1 Name' };

                const result = mapFormValuesToScientificReferencesSectionDto(values, context);

                expect(result.references).toEqual([
                    { referenceId: 501, name: 'Updated Ref 1 Name' },
                    { referenceId: 502, name: 'Old Ref 2 Name' },
                ]);
            });

            it('does not modify references list if targetResearchLocalId is not found', () => {
                const context: ScientificReferencesSectionMapContext = {
                    ...baseContext,
                    subBlock: 'research',
                    targetResearchLocalId: 'unknown-local-id',
                    scientificReferences: mockReferences,
                    existingSectionLocalization: {
                        title: 'Saved Title',
                        description: 'Saved Desc',
                        references: [{ referenceId: 501, name: 'Ref 1' }],
                    },
                };

                const result = mapFormValuesToScientificReferencesSectionDto({ name: 'Some Name' }, context);
                expect(result.references).toEqual([{ referenceId: 501, name: 'Ref 1' }]);
            });
        });

        it('maps form values to create DTO with context', () => {
            const context: ScientificReferencesSectionMapContext = {
                ...baseContext,
                subBlock: 'general',
                scientificReferences: mockReferences,
                existingSectionLocalization: null,
            };

            const result = mapFormValuesToCreateScientificReferencesSectionDto(
                { title: 'T', description: 'D' },
                context,
            );
            expect(result.entityId).toBe(10);
            expect(result.languageId).toBe(2);
            expect(result.title).toBe('T');
        });
    });

    describe('mapHippotherapySectionFormValuesToDto dispatcher', () => {
        const galleryContext: GallerySectionMapContext = { ...baseContext, cardIds: [1] };
        const ethicsContext: EthicsSectionMapContext = { ...baseContext, principleIds: [1] };
        const scientificContext: ScientificReferencesSectionMapContext = {
            ...baseContext,
            subBlock: 'general',
            scientificReferences: [],
            existingSectionLocalization: null,
        };

        const testCases = [
            [HippotherapyPageLocalizationBlock.Intro, baseContext, { title: 'T', description: 'D' }],
            [HippotherapyPageLocalizationBlock.Description, baseContext, { title: 'T', description: 'D' }],
            [HippotherapyPageLocalizationBlock.Hippovention, baseContext, { title: 'T', description: 'D' }],
            [HippotherapyPageLocalizationBlock.Analysis, baseContext, { title: 'T', description: 'D' }],
            [HippotherapyPageLocalizationBlock.Quote, baseContext, { quoteText: 'Q', authorName: 'A' }],
            [HippotherapyPageLocalizationBlock.AnotherQuote, baseContext, { quoteText: 'Q', authorName: 'A' }],
            [
                HippotherapyPageLocalizationBlock.HippoventionCenter,
                baseContext,
                { title: 'T', description: 'D', pros: 'P' },
            ],
            [HippotherapyPageLocalizationBlock.Advantages, galleryContext, { title: 'T' }],
            [HippotherapyPageLocalizationBlock.Participants, galleryContext, { title: 'T' }],
            [HippotherapyPageLocalizationBlock.Ethics, ethicsContext, { title: 'E' }],
            [HippotherapyPageLocalizationBlock.ScientificReferences, scientificContext, { title: 'S' }],
        ] as const;

        it.each(testCases)('correctly dispatches update for block %s', (block, context, values) => {
            const result = mapHippotherapySectionFormValuesToDto(block, values, context, true);
            expect(result).toBeDefined();
            expect(result).not.toBeNull();
            expect(result).not.toHaveProperty('entityId');
        });

        it.each(testCases)('correctly dispatches create for block %s', (block, context, values) => {
            const result = mapHippotherapySectionFormValuesToDto(block, values, context, false);
            expect(result).toBeDefined();
            expect(result).not.toBeNull();
            expect(result).toHaveProperty('entityId', 10);
            expect(result).toHaveProperty('languageId', 2);
        });

        it('returns null for an unsupported block', () => {
            const result = mapHippotherapySectionFormValuesToDto(
                999 as HippotherapyPageLocalizationBlock,
                {},
                baseContext,
                false,
            );
            expect(result).toBeNull();
        });
    });
});
