export const SUMMARY_DATA = {
    collected: {
        uah: 1249854.09,
        usd: 29408.33,
    },
    livesChanged: 205,
    disclaimer:
        'Amounts shown in USD are approximate and provided for informational purposes only. They are converted from UAH using the official NBU exchange rate applicable for the reporting period. The organization\u2019s official accounting and financial records are maintained in UAH.',
};

export const REPORTS_DATA = [
    { year: 2025, fileUrl: '/files/report-2025.pdf' },
    { year: 2024, fileUrl: '/files/report-2024.pdf' },
    { year: 2023, fileUrl: '/files/report-2023.pdf' },
    { year: 2022, fileUrl: '/files/report-2022.pdf' },
    { year: 2021, fileUrl: '/files/report-2021.pdf' },
    { year: 2020, fileUrl: '/files/report-2020.pdf' },
    { year: 2019, fileUrl: '/files/report-2019.pdf' },
    { year: 2018, fileUrl: '/files/report-2018.pdf' },
    { year: 2017, fileUrl: '/files/report-2017.pdf' },
];

export const CTA_DATA = {
    title: 'Разом ми<br />можемо більше',
    description:
        'Ваш внесок — це не просто цифри в звітах. Це — врятовані історії, відновлені серця й нові надії. Долучайтеся до тих, хто змінює життя.',
};

export const EXPENSES_DATA = {
    items: [
        { label: 'Інші', amount: { uah: 2270, usd: 53.41 }, percent: 0.2 },
        { label: 'Комунікація та партнерства', amount: { uah: 103485, usd: 2434.94 }, percent: 9.3 },
        { label: 'Операційні', amount: { uah: 290955, usd: 6846 }, percent: 26.2 },
        { label: 'Програмні', amount: { uah: 443042, usd: 10424.52 }, percent: 64.3 },
    ],
};

export const FUNDING_DATA = {
    items: [
        { amount: { uah: 100000, usd: 2352.94 }, label: 'Підтримка від бізнесу' },
        { amount: { uah: 371964.52, usd: 8752.11 }, label: 'Грантові кошти' },
        { amount: { uah: 267889.57, usd: 6303.28 }, label: 'Благодійні внески' },
        {
            amount: { uah: 700000, usd: 16470.59 },
            label: 'Дуууже дооовга наааааааааааааааааааааааааааааааааааааааазва',
        },
    ],
};

export const PROGRAMS_ALLOCATION_DATA = {
    items: [
        {
            label: 'для ветеранів',
            amount: { uah: 356052, usd: 8377.69 },
        },
        {
            label: 'для жінок',
            amount: { uah: 152737, usd: 3593.81 },
        },
        {
            label: 'для дітей',
            amount: { uah: 205000, usd: 4823.53 },
        },
        {
            label: 'інші',
            amount: { uah: 35000, usd: 823.53 },
        },
    ],
};
