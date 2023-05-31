import React, {useState, useEffect} from 'react';
import Select from 'react-select';

const SelectWithSearch = ({apiUrl, required, name, onSelectChange}) => {
    const [options, setOptions] = useState([]);
    const [selectedOption, setSelectedOption] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const authToken = JSON.parse(localStorage.getItem('authToken')).value;
                const response = await fetch(apiUrl, {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch options');
                }
                const data = await response.json();

                const options = data.map((item) => ({
                    value: item.id,
                    label: item.name + '   ' + item.id,
                }));


                setOptions(options);
            } catch (error) {
                setError(error.message);
            }
        };

        fetchOptions();
    }, [apiUrl]);

    const handleSelectChange = (selectedOption) => {
        setSelectedOption(selectedOption);
        onSelectChange(selectedOption ? selectedOption.value : '');
    };


    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <Select
            value={selectedOption}
            onChange={handleSelectChange}
            options={options}
            isSearchable={true}
            placeholder="Выберите опцию"
            required={required}
            name={name}
        />
    );
};

export default SelectWithSearch;
