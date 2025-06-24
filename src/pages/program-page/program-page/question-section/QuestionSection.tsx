import React, {useEffect, useState} from 'react';
import { COMMON_QUESTIONS } from "../../../../const/program-page/program-page";
import { Question } from '../../../../types/ProgramPage';
import { QuestionCard } from './question-card/QuestionCard';
import { questionDataFetch } from '../../../../services/data-fetch/program-page-data-fetch/program-page-data-fetch';
import './question-section.scss';

export const QuestionSection: React.FC = () => {
    
    const [questions, setQuestions] = useState<Question[]>([]);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        (async() => {
            try{
                const response = await questionDataFetch();
                setQuestions(response.questions);
                setError(null);
            }
            catch{
                setError("Не вдалося завантажити дані програм. Будь-ласка спробуйте пізніше.");
                setQuestions([]);
            }
        })();
    }, []);
    
    return (
        <div className="qa-section">
            <div className="question-block">
                <h2>{COMMON_QUESTIONS}</h2>
                <div className="qa-block">
                    {error && (
                        <div className="error-message" role="alert" style={{ color: "red" }}>
                            {error}
                        </div>
                    )}
                    {questions.map((item, index) => (
                        <QuestionCard
                            key={index}
                            questionCard={item}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
