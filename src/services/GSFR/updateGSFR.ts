import axios from 'axios-https-proxy-fix';
import * as xml2js from 'xml2js';

const allDataArray: any[] = [];

const urls = [
    // 'https://scsanctions.un.org/resources/xml/en/consolidated.xml',
    'https://fiu.gov.kg/uploads/65afad57b900d.xml',
    'https://fiu.gov.kg/uploads/657ae4a6152b5.xml',
    'https://fiu.gov.kg/uploads/65a51ca583341.xml',
    'https://fiu.gov.kg/uploads/65b39e65cbc8a.xml'
];

export const updateGSFR = async () => {
    try {
        for (const url of urls) {
            const data = await fetchData(url);
            // console.log(data);
            const result = await parseXml(data);

            const values = extractValuesDynamically(result);
            const mappedValues = applyMapping(values);

            // console.log(`Массив объектов для ${url}:`, [mappedValues]);

            allDataArray.push(mappedValues);
        }

        const combinedArray = [].concat(...allDataArray);

        console.log('Общий массив объектов:', combinedArray);
    } catch (err) {
        console.error('Ошибка:', err);
    }
};

const fetchData = async (url: string): Promise<string> => {
    try {

        const response = await axios.get(url, {
            headers: {
                'Accept-Charset': 'application/xml',
                'Accept': 'application/xml', // Добавлено
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};



const parseXml = (xmlData: string): Promise<any> => {
    const options = {
        explicitArray: false,
        mergeAttrs: true,
    };

    return new Promise((resolve, reject) => {
        xml2js.parseString(xmlData, {...options, ...{explicitArray: false}}, (parseErr, result) => {
            if (parseErr) {
                reject(parseErr);
            } else {
                resolve(result);
            }
        });
    });
};

const extractValuesDynamically = (obj: any): any[] => {
    const values: any[] = [];

    const traverse = (node: any, path: string[] = []) => {
        if (typeof node === 'object') {
            for (const key in node) {
                traverse(node[key], [...path, key]);
            }
        } else {
            const joinedPath = path.join('.');
            values.push({ [joinedPath]: node });
        }
    };

    traverse(obj);
    return values;
};

const applyMapping = (values: any[]): any[] => {
    const mapping: any = {
        'Name': 'name',
        'FIRST_NAME': 'firstName',
        'SECOND_NAME': 'secondName',
        'THIRD_NAME': 'thirdName',
        'FOURTH_NAME': 'fourthName',
    };

    const result: any[] = [];

    values.forEach((field) => {
        for (const key in field) {
            if (field.hasOwnProperty(key)) {
                const lastWord: any = key.split('.').pop();
                const mappedKey = mapping[lastWord];
                if (mappedKey) {
                    result.push({ [mappedKey]: field[key] !== undefined ? field[key] : null });
                }
            }
        }
    });

    return result;
};
