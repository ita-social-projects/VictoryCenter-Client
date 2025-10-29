interface SupportCardProps {
    img: string;
    alt: string;
    description: string;
    index: number;
}

export function SupportCard({ img, alt, description, index }: SupportCardProps) {
    return (
        <div className={`support-card card-${index + 1}`}>
            <img src={img} alt={alt} />
            <p className="support-description">{description}</p>
        </div>
    );
}
