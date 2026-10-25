export const LocalizationStatuses = ({ languages, localizedEntity }: any) => (
    <div
        data-testid="localization-statuses"
        data-languages-count={languages?.length ?? 0}
        data-localizations-count={localizedEntity?.localizations?.length ?? 0}
    />
);
