import {logError} from "./logger";

export function getAccountValueByKey(arr: any[], key: string) {
    return arr.map((obj) => {
        const accountObject: { [k: string]: string } = obj.account.reduce((acc: { [k: string]: string }, [k, v]: [string, string]) => {
            acc[k] = v;
            return acc;
        }, {});

        if (accountObject.hasOwnProperty(key)) {
            obj.account = accountObject[key];
        } else {
            obj.account = 'Столбец отсутствует';
        }

        return obj;
    });
}
