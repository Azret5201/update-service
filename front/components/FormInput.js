import React from 'react';

const FormInput = ({ type, id, name, value, onChange, accept, required }) => {
    return (
        <input
            type={type}
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            accept={accept}
            required={required}
        />
    );
};

export default FormInput;
