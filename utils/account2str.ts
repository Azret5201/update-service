export function getAccountValueByKey(arr: any[], key: string) {
    return arr.map((obj) => {
        const accountObject: { [k: string]: string } = obj.account.reduce((acc: { [k: string]: string }, [k, v]: [string, string]) => {
            acc[k] = v;
            return acc;
        }, {});
        obj.account = accountObject[key] || obj.account;
        return obj;
    });
}
