import React from 'react';
import { useParams } from 'react-router-dom';
import './DetailedProgramPageContent.module.scss';

export const DetailedProgramPageContent: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();

    return (
        <div className="detailed-program-page-content">
            <h1>Program: {slug}</h1>
        </div>
    );
};
