interface SummaryCardProps {
    title: string;
    uah?: number;
    usd?: number;
    count?: number;
    blueTheme?: boolean;
}

export const SummaryCard = ({ title, uah, usd, count, blueTheme }: SummaryCardProps) => {
    return (
        <div>
            <div>{title}</div>
            {count !== undefined ? (
                <div>{count} категорії</div>
            ) : (
                <>
                    <div>{uah?.toLocaleString('uk-UA')} UA</div>
                    <div>{usd?.toLocaleString('uk-UA')} USD</div>
                </>
            )}
        </div>
    );
};
