import ourTeam from '../../../assets/about-us-images/images/our-team.jpg';
import {Link} from 'react-router-dom';
import './our-team.scss';

export const OurTeam = () => {
    return (
        <div className="our-team-block">
            <img src={ourTeam} alt="Our Team" className="our-team-image" />
            <div className="team-info">
                <p className="team-description">Victory Center — це спільна робота психологів, фасилітаторів,
                    координаторів, волонтерів, а також партнерських локацій (ранчо), об’єднаних
                    прагненням створити безпечне середовище для відновлення.<br/><br/>
                    Наша команда працює з військовими/ветеранами, дітьми та їхніми родинами,
                    проходить регулярне навчання, дотримується етичного кодексу, не знецінює, а цінує та підтримує</p>
                <Link to="/" className="link-ro-team">Переглянути команду</Link>
            </div>
        </div>
    );
};
