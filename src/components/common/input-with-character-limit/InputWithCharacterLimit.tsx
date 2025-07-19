import React from 'react';
import classNames from 'classnames';
import './input-with-character-limit.scss';

interface InputWithCharacterLimitProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  name: string;
  id: string;
  maxLength: number;
  disabled?: boolean;
  type?: 'text' | 'email' | 'password' | 'number';
  className?: string;
  placeholder?: string;
}

export const InputWithCharacterLimit = ({
  value,
  onChange,
  onBlur,
  name,
  id,
  maxLength,
  disabled = false,
  type = 'text',
  className = 'input',
  placeholder
}: InputWithCharacterLimitProps) => {
  const currentLength = value?.length ?? 0;
  const hasValue = currentLength > 0;

  return (
    <div
      className={classNames('input-line-wrapper', {
        disabled,
        'input-line-wrapper-has-value': hasValue
      })}
    >
      <input
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        maxLength={maxLength}
        className={classNames(className, { 'has-text': hasValue })}
        name={name}
        type={type}
        id={id}
        disabled={disabled}
        placeholder={placeholder}
      />
      <div className="character-limit">
        {currentLength}/{maxLength}
      </div>
    </div>
  );
};
