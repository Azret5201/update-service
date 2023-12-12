export function getAccountValueByKey(account: any[], key: string) {
    if (Array.isArray(account)) {
        const accountValues: { [key: string]: any } = {};

        account.forEach(([k, v]: [string, any]) => {
            accountValues[k] = v;
        });

        return accountValues;
    } else {
        console.error('Ошибка: переданный объект не является массивом.');
        return {};
    }
}