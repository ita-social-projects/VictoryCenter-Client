import React from 'react';
import { SloganSection } from './components/slogan/SloganSection';
import { LoadableContent } from '@/components/common/loadable-content/LoadableContent';
import { ReviewsSection } from './components/reviews/ReviewsSection';
import { ReviewArticlesSection } from './components/review-articles/ReviewArticlesSection';
import { StoriesOfVictoryReview, StoriesOfVictoryReviewArticle } from '@/types/public/stories-of-victory';
import girlHugHorse from '@/assets/images/girl-hug-horse.webp';

interface StoriesOfVictoryPageProps {
    // Add props here as needed
}

const reviews: StoriesOfVictoryReview[] = [
    {
        id: 1,
        name: 'Лео Лео',
        review: 'Я була на цій програмі і дуже раджу вам її.🫠Я пишаюсь тим, що в мене є такі друзі.❤️🫂Колишня військовополонена, Морська Піхотинка- ваша Інга🙏🇺🇦',
    },
    {
        id: 2,
        name: 'Світлана, мама Святослава',
        review: 'Мій син дуже задоволений, каже, «що Болівія найкраща конячка, слухала його і не наступала йому на ноги розповідав друзям у дворі, хвалився, питає чи буде ще така можливість побути з нею. Дякуємо вам за вашу працю та таку можливість',
    },
    {
        id: 3,
        name: 'Світлана, мама Поліни',
        review: 'Полінка дуже задоволена. Спочатку соромилась але далі вже все пройшло чудово) Вже дуже чекає наступної зустрічі з кониками, постійно питає чи поїдемо ще) Дуже дякуємо за гарні емоції доньки',
    },
    {
        id: 4,
        name: 'Ольга Кітура',
        review: 'Хочу щиро подякувати всім, хто організував і провів цей чудовий проєкт з іпотерапії. Для моєї дитини це було справжнє свято — спокій, радість, нові відчуття та море позитиву. Ми дуже вдячні за вашу турботу, увагу й доброту. Це справді безцінно!',
    },
];

const reviewArticles: StoriesOfVictoryReviewArticle[] = [
    {
        id: 1,
        title: 'Вітаю! Моя «трійка» в повному захваті, і сьогодні розмови про Раду і Болівію не вщухають, емоції переповнюють, хочуть ще, оскільки час промайнув дуже швидко, а їм завжди мало)))! Особливо хочу подякувати тренеру, яка працювала з моїми дітьми, Ріті - вона настільки легко, доступно і з любов ю розповідала про все (правила безпеки, вподобання Ради, як її доглядати, як відчувати її, як розуміти її, для чого діти роблять ті чи інші вправи ...), що не лише мої діти, а і я слухала і не могла відірватись. Щиро дякуємо Вам за таку чудову можливість в такий нелегкий час забутись на кілька годин і просто насолодитись моментом!',
        image: girlHugHorse,
    },
    {
        id: 2,
        title: 'Як же довго я його шукала ... Моє місце сили... Моє залишилось на окупованій території 💔 І ось нарешті я його знайшла😍 моє місце сили ! Величезне дякую  За такий неймовірний відпочинок♥️♥️♥️ Ваше ранчо тепер точно наше улюблене сімейне місце, місце де неймовірна природа, неймовірні коні та суперова команда дякуємо всім Вам ♥️♥️♥️',
        image: girlHugHorse,
    },
    {
        id: 3,
        title: 'Дуже рекомендую. Сподобалось місце, команда і тваринки. Відчувається, що вони в комфорті, у них багато площі і в любові 🩵💛🙏 приємно спостерігати за кіньми та взаємодіяти з ними. Отримала кілька цінних інсайтів. Дякую!',
        image: girlHugHorse,
    },
    {
        id: 4,
        title: 'Класна реабілітація для військовослужбовців, особливо для тих, хто був звільнений з полону!! Єднання природи з людиною це завжди прекрасно і добре впливає на психоемоційний стан. Повернення до джерел існування людини змушує забувати про стрес і виключає наявність негативних думок! Рекомендую) Окрема вдячність команді за плідну працю, бо вони вкладають в роботу не тільки сили а і всю душу!!!',
        image: girlHugHorse,
    },
];

// const reviewVideos: StoriesOfVictoryReviewVideo[] = [
//     { id: 1, title: 'Коні лікують 2025', link: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
//     { id: 2, title: 'Коні лікують 2025', link: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
//     { id: 3, title: 'Коні лікують 2025', link: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
//     { id: 4, title: 'Коні лікують 2025', link: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
//     { id: 5, title: 'Коні лікують 2025', link: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
// ];

export const StoriesOfVictoryPage: React.FC<StoriesOfVictoryPageProps> = () => {
    return (
        <LoadableContent isLoading={false} error={false}>
            {
                <>
                    <SloganSection />
                    <ReviewArticlesSection content={reviewArticles} />
                    {/* <VideoReviewsSection content={reviewVideos} /> */}
                    <ReviewsSection content={reviews} />
                </>
            }
        </LoadableContent>
    );
};
