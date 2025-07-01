import supportVeterans from '../../../assets/about-us-images/images/support-veterans.jpg';
import supportVolunteers from '../../../assets/about-us-images/images/support-volunteers.jpg';
import supportChildren from '../../../assets/about-us-images/images/support-children.jpg';
import './support-section.scss'
export const SupportSection = () => {
    
    return (
        <div className="support-block">
            <h2 className="support-title">Кого ми можемо підтримати&nbsp;</h2>
            <div className="support-card">
                <img src={supportVeterans} alt=""/>
                <p className="support-description">Ветеранів/ок, що повернулися із фронту/полону та прагнуть відновити контакт із собою, 
                    своїм тілом та близькими.&nbsp;</p>
            </div>
            <div className="support-card">
                <img src={supportVolunteers} alt=""/>
                <p className="support-description">Волонтерів/ок та цивільних, які відчувають потребу в емоційному відновленні
                    і&nbsp; прагнуть продовжувати підтримувати інших.&nbsp;</p>
            </div>
            <div className="support-card">
                <img src={supportChildren} alt=""/>
                <p className="support-description">Дітей, що постраждали від війни та пройшли через втрату, страх, вимушений переїзд.
                    Через ігрову терапію, взаємодію у групах та контакт із тваринами, ми допомагаємо
                    сформувати довіру маленьких українців/ок до оточуючих та повернути відчуття безпеки.&nbsp;</p>
            </div>
        </div>
    )
}