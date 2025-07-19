import React from 'react';
import InfoIcon from '../../../assets/icons/info.svg';
import './hint-container.scss';

interface HintContainerProps {
  title: string;
  text?: string;
}

const HintContainer = ({ title, text }: HintContainerProps) => {
  return (
    <div className='hint-container'>
      <div className='hint-container-title'>
        <img src={InfoIcon} alt="hint-icon" />
        <span>{title}</span>
      </div>
      {text && <span>{text}</span>}
    </div>
  );
};

export default HintContainer;
