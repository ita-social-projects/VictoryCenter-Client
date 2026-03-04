export interface HippotherapyDefaultSection {
    title: string;
    text: string;
}

export interface Quote {
    text: string;
    imgURL: string;
    imgAlternativeText?: string;
}

export interface HippotherapyIntroData {
    imgURL: string;
    imgAlternativeText?: string;
    title: string;
    description: string;
}

export interface HippotherapyAbout {
    introSection: HippotherapyIntroData;
    descriptionSection: HippotherapyDefaultSection;
    quoteSection: Quote;
    hippoventionSection: HippotherapyDefaultSection;
    hippoventionCenterSection: {
        title: string;
        imgURL: string;
        props: string[];
        text: string;
    };
    advantagesSection: {
        title: string;
        advantages: { imgURL: string; text: string }[];
    };
    analysisSection: HippotherapyDefaultSection;
    researchSection: {
        description: string;
        researches: { text: string; url: string }[];
    };
    anotherQuoteSection: Quote;
    participantsSection: {
        title: string;
        participants: { imgURL: string; text: string }[];
    };
    ethicsSection: {
        title: string;
        text: string;
        principles: string[];
    };
}
