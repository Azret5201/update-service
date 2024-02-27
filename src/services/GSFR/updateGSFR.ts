import axios from "axios-https-proxy-fix";
import * as xml2js from "xml2js";
import redisCluster from "../../../config/redis";

const allDataArray: any[] = [];
const pathsToArray = {
  UN: "CONSOLIDATED_LIST.INDIVIDUALS", // Сводный санкционный перечень Совета Безопасности ООН
  SSPKR: "SanctionList.physicPersons", // Сводный санкционный перечень Кыргызской Республики
  PFT: "ArrayOfLegalizationPhysic.LegalizationPhysic", //ПФТ
  PLPD_FIZ: "ArrayOfLegalizationPhysic.LegalizationPhysic", // ПЛПД физ. лица
  PLPD_UR: "ArrayOfLegalization.Legalization", // ПЛПД юр. лица
};

const arrayOfRequiredFields = {
  // Порядок name, surname, patronymic, fio, inn
  UN: ["Name", "Surname", "Patronymic"],
  SSPKR: ["Name", "Surname", "Patronymic"],
  PFT: ["Name", "Surname", "Patronomic"],
  PLPD_FIZ: ["Name", "Surname", "Patronymic"],
  PLPD_UR: ["Name", "Surname", "Patronymic"],
};

const redisSetKey = "{fishy}";

export const updateGSFR = async (UrlPathList: object) => {
  try {
    for (const [typeSanction, url] of Object.entries(UrlPathList)) {
      const endpointSettings = pathsToArray[typeSanction as keyof typeof pathsToArray];
      const data = await fetchData(url);
      const result = await parseXml(data);
      const arrayData = extractArrayData(result, endpointSettings);

      const requredFields = arrayOfRequiredFields[typeSanction as keyof typeof arrayOfRequiredFields];
      // inserToRedis(arrayData, requredFields);
      formationRecords(arrayData, requredFields);
      // console.log("After extract array: ", arrayData);
      return;
    }

    const combinedArray = [].concat(...allDataArray);

    return {
      result: "success",
      data: combinedArray,
    };
  } catch (err) {
    console.error("Ошибка:", err);
    throw err;
  }
};

const fetchData = async (url: string): Promise<string> => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const parseXml = (xmlData: string): Promise<any> => {
  const options = {
    explicitArray: false,
    mergeAttrs: true,
  };

  return new Promise((resolve, reject) => {
    xml2js.parseString(xmlData, { ...options, ...{ explicitArray: false } }, (parseErr, result) => {
      if (parseErr) {
        reject(parseErr);
      } else {
        resolve(result);
      }
    });
  });
};

const extractArrayData = (obj: any, pathToArrayData: string): [{ [key: string]: any }] => {
  // Разбиваем путь на массив ключей
  const keys = pathToArrayData.split(".");
  // Итеративно получаем доступ к вложенному свойству
  let current = obj;

  for (const key of keys) {
    if (current[key] === undefined) {
      throw new Error("Incorect path to array");
    }

    current = current[key];
  }

  return current;
};

const formationRecords = async (arrayData: [{ [key: string]: any }], needFields: string[]) => {

  const instanceRedisCluster = await redisCluster();
  arrayData.forEach((objectPerson) => {
    const surname = objectPerson[needFields[1]];
    const name = objectPerson[needFields[0]];
    const patronomic = objectPerson[needFields[2]];
    const fouthName = objectPerson[needFields[3]];
    const onlyFullName = objectPerson[needFields[4]];
    const inn = objectPerson[needFields[5]];

    if (!onlyFullName) {
      //Если есть фамилия, то формируем комбинации
      const fullName = concatString(surname, name, patronomic).trim();
      const surnameWithName = concatString(surname, name).trim();
      const nameWithSurname = concatString(name, surname).trim();
      const NamePatronomicSurname = concatString(name, patronomic, surname).trim();

      const fullNameWithFourthName = concatString(fullName, fouthName).trim();
      const NamePatronomicSurnameWithFouthName = concatString(NamePatronomicSurname, fouthName).trim();
    
      if (surnameWithName != "") {
        insertToRedisOrToLog(surnameWithName, instanceRedisCluster);
      }
      if (nameWithSurname != "") {
        insertToRedisOrToLog(nameWithSurname, instanceRedisCluster);
      }
      if (fullName != "") {
        insertToRedisOrToLog(fullName, instanceRedisCluster);
      }
      if (NamePatronomicSurname != "") {
        insertToRedisOrToLog(NamePatronomicSurname, instanceRedisCluster);
      }
      if (fullNameWithFourthName != "") {
        insertToRedisOrToLog(fullNameWithFourthName, instanceRedisCluster);
      }
      if (NamePatronomicSurnameWithFouthName != "") {
        insertToRedisOrToLog(NamePatronomicSurnameWithFouthName, instanceRedisCluster);
      }
    } else {
      if (onlyFullName != "") {
        insertToRedisOrToLog(onlyFullName, instanceRedisCluster);
      }
      if (inn != "") {
        insertToRedisOrToLog(inn, instanceRedisCluster);
      }
    }
  });
};

const insertToRedisOrToLog = (text: string, instanceRedisCluster:any, redisKey = "terrorist_fio"): void => {

  if (instanceRedisCluster) {
    instanceRedisCluster?.sAdd(redisSetKey + redisKey, text);
    instanceRedisCluster?.sAdd(redisSetKey + redisKey + "64", btoa(text));
  } else {
    console.log(redisKey, text);
  }
};

const concatString = (...args: string[]): string => {
  let result = "";
  for (let i = 0; i < args.length; i++) {
    if (args[i]) {
      result += (i ? " " : "") + args[i];
    } else {
      return "";
    }
  }
  return result;
};
