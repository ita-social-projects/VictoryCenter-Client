import introImg from '@/assets/images/public/hippotherapy/intro.jpg';
import quoteImg from '@/assets/images/public/hippotherapy/quote_1.jpg';
import anotherQuoteImg from '@/assets/images/public/hippotherapy/quote_2.jpg';
import ipoventionImg from '@/assets/images/public/programs-page/first.png';
import advantageImage0 from '@/assets/images/public/programs-page/first.png';
import advantageImage1 from '@/assets/images/public/programs-page/first.png';
import advantageImage2 from '@/assets/images/public/programs-page/first.png';
import advantageImage3 from '@/assets/images/public/programs-page/first.png';
import { HippotherapyAbout } from '@/types/public/hippotherapy-page';

export const hippotherapyMock: HippotherapyAbout = {
    introSection: {
        title: '<h3><b>Кінь</b> не питає, він <b>просто поруч</b></h3>',
        imgURL: introImg,
        imgAlternativeText: 'Людина і кінь',
        description:
            'Це про зустріч. Між людиною, яка вчиться знову довіряти, і конем, який відповідає без слів. Тут зцілення йде не з розмови, а з присутності.',
    },
    descriptionSection: {
        title: 'Що таке іпотерапія?',
        text: 'Іпотерапія — це форма терапії з використанням коней, яка поєднує тілесну взаємодію, психологічні практики та емоційний контакт. Фокус не на верховій їзді, а на присутності в моменті.<br /><br />У програмі Victory Center коні — не “інструменти”,  а партнери у процесі відновлення. Їхня чутливість до стану людини допомагає учасникам/цям відчути та пізнати себе — без пояснень, без оцінки, без тиску.',
    },
    quoteSection: {
        text: '“Я не встиг нічого сказати — а кінь уже підійшов.  Як він знав?” <br /><br /><b>Вікторія Яковенко</b>',
        imgURL: quoteImg,
        imgAlternativeText: 'Людина і кінь',
    },
    hippoventionSection: {
        title: 'Що таке іповенція?',
        text: 'Іповенція — це адаптований підхід, який базується на ідеї відновлення через контакт з конем і тілом, але не є терапією в класичному медичному сенсі.',
    },
    hippoventionCenterSection: {
        title: 'В центрі іповенції:',
        imgURL: ipoventionImg,
        props: [
            'Сповільнення',
            'Присутність в моменті',
            'Безпека без примусу',
            'Відкритість до власного стану та відчуттів',
        ],
        text: 'Іповенція для Victory Center - це м’ягка, але глибока взаємодія, яка не обов’язково відбувається в рамках офіційної “терапії”.',
    },
    advantagesSection: {
        title: 'Чому саме цей підхід?',
        advantages: [
            {
                imgURL: advantageImage0,
                text: 'Тіло пам’ятає те, що слова не можуть передати. Робота з конем — це робота на рівні нервової системи.',
            },
            {
                imgURL: advantageImage1,
                text: 'Кінь не питає, що з тобою сталося. Але допомагає щиро відповісти на питання “як ти зараз?”.',
            },
            {
                imgURL: advantageImage2,
                text: 'Нервова система людини й коня синхронізуються — це не метафора, а фізіологічна реальність.',
            },
            {
                imgURL: advantageImage3,
                text: 'Людина часто говорить про те, що “мусить сказати”. Кінь відчуває те, що є насправді.',
            },
        ],
    },
    analysisSection: {
        title: 'Що показує досвід / наука?',
        text: 'Іпотерапія визнана формою допоміжної терапії при ПТСР, тривожних розладах, порушеннях регуляції емоцій. \r\n Взаємодія з конем допомагає повертатися до контролю над власним тілом, відновлювати регулювання дихання і ритму, знижувати тривожність, будувати безпечну прив’язаність до оточення.',
    },
    researchSection: {
        description:
            'Наукові дослідження, що підтверджують ефективність терапії за допомогою коней у роботі з ветеранами та людьми з посттравматичним стресовим розладом.',
        researches: [
            {
                text: 'Lloyd-Richardson E., Sonatore D., Strong J. "Integration Horses into Healing" (EFP.L Research, 2023)',
                url: '',
            },
            {
                text: 'Li J., Sanchez-Garcia R. "Equine-Assisted Interventions for Veterans with Posttraumatic Stress Disorder: A Systematic Review" (2023)',
                url: '',
            },
            {
                text: 'Karol J., Naste T., Price M. and other "Equine Facilitated Therapy for Complex Trauma (EFT-CT)"(2017)',
                url: '',
            },
            {
                text: 'Clarke J. "Using Equine Therapy as Mental Health Treatment" (2024)',
                url: '',
            },
            {
                text: 'Maker H. A. "Equine Assisted Therapy: A Unique and Effective Intervention" (2019)',
                url: '',
            },
        ],
    },
    anotherQuoteSection: {
        text: '“Ми не говорили. Але я нарешті перестав тікати сам від себе.”<br /><br /><b>Ветеран, учасник програми</b>',
        imgURL: anotherQuoteImg,
        imgAlternativeText: 'Людина і кінь',
    },
    participantsSection: {
        title: 'Кому підходять програми?',
        participants: [
            {
                imgURL: advantageImage0,
                text: 'Люди з досвідом війни, втрати, травми, тривалого стресу (військові, ветерани/ки).',
            },
            {
                imgURL: advantageImage1,
                text: 'Діти з гіперзбудливістю або замкненістю, тривожністю, порушенням контакту.',
            },
            {
                imgURL: advantageImage2,
                text: 'Родини, які пережили розрив, переміщення, втрату близьких. ',
            },
            {
                imgURL: advantageImage3,
                text: 'Фахівці екстрених служб та волонтери. ',
            },
        ],
    },
    ethicsSection: {
        title: 'Етичні принципи Victory Center',
        text: 'Ми не змушуємо до дії, а дозволяємо кожному рухатися у власному темпі.',
        principles: [
            'Дбаємо про психологічний комфорт учасників/ць: створюємо безпечний простір для взаємодії, де немає місця тиску чи засудженню.',
            'Співпрацюємо винятково з ранчо, які дбають про добробут коней та дотримуються етичних принципів поводження із тваринами.',
            'Працюємо з кваліфікованими фахівцями, які дотримуються стандартів етичної практики в терапії і соціальній роботі.',
            'Забезпечуємо повну приватність  і конфіденційність особистої інформації учасників/ць.',
        ],
    },
};
