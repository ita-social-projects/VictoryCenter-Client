interface SupportCardProps {
    IMG: string;
    ALT: string;
    DESCRIPTION: string;
    index: number;
}

export function SupportCard({ IMG, ALT, DESCRIPTION, index }: SupportCardProps) {
    return (
        <div key={index} className={`support-card card-${index + 1}`}>
            <img src={IMG} alt={ALT} />
            <p className="support-description">{DESCRIPTION}</p>
        </div>
    );
}
