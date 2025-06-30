import background from '../../../assets/about-us-images/images/background.jpg';
import './intro-section.scss'
export const AboutUsIntro = () => {
    return (
        <div className="about-us-block">
            <img src={background} className="background-img" alt=""/>
            <img src={background} className="color-overlay" alt=""/>
            <h1 className="about-us-main-title"><span className="highlighted">Простір</span> довіри, турботи та твоєї <span className="highlighted">внутрішньої сили</span></h1>
            <div className="title-details">Victory Center — це не про терміни чи цифри. <br/>Це про відчуття. Тут ти зупиняєшся в моменті, <br/>де зникає напруга, і починається зцілення. 
                <br/><br/>Через спільноту, природу й контакт із кіньми ти повертаєшся до себе справжнього/ої.
                    Ми не змінюємо людей. Ми допомагаємо їм згадати, <br/>ким вони є.</div>
        </div>
    )
}