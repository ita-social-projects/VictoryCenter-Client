import React, {useState, useEffect} from 'react';
import {programPageDataFetch} from "../../../../services/data-fetch/program-page-data-fetch/programPageDataFetch";
import {ProgramCard} from "./program-card/ProgramCard";
import './ProgramSection.scss'
interface Program{
    image: string;
    title: string;
    subtitle: string;
    description: string;
}
export const ProgramSection: React.FC = () => {
    const [programData, setProgramData] = useState<Program[]>([]);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        (async() => {
            try{
                const response = await programPageDataFetch();
                setProgramData(response.programData);
                setError(null);
            }
            catch{
                setError("Не вдалося завантажити дані програм. Будь-ласка спробуйте пізніше.");
                setProgramData([]);
            }
        })();
    }, []);
    return (
        <div className="program-block">
            <div className="menu-block">
                <h2>Програми</h2>
                <div className="button-block">
                    <button className="white-button">Дитячі</button>
                    <button className="white-button">Ветеранські</button>
                    <button className="black-button">Всі</button>
                </div>
            </div>
            <div className="cards-block">
                {error && (
                    <div className="error-message" role="alert" style={{ color: "red" }}>
                        {error}
                    </div>
                )}
                {programData.map((item, index) => (
                    <ProgramCard
                        key={index}
                        program={item}
                    />
                ))}
            </div>
        </div>
    )
}
