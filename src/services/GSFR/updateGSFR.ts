import axios from "axios-https-proxy-fix";
import * as xml2js from "xml2js";
import redisCluster from "../../../config/redis";
import crypto from 'crypto';
import https from 'https';

const allDataArray: any[] = [];
const pathsToArray = {
  UN: "CONSOLIDATED_LIST.INDIVIDUALS.INDIVIDUAL",
  PFT: "ArrayOfPersonServedSentence.PersonServedSentence",
  SSPKR: "SanctionList.physicPersons.KyrgyzPhysicPerson", // Сводный санкционный перечень Кыргызской Республики
  PLPD_FIZ: "ArrayOfLegalizationPhysic.LegalizationPhysic", // ПЛПД физ. лица
  PLPD_UR: "ArrayOfLegalization.Legalization", // ПЛПД юр. лица
};

const arrayOfRequiredFields = {
  // Порядок name, surname, patronymic, fio, inn
  UN: ["FIRST_NAME", "SECOND_NAME", "THIRD_NAME", "FOURTH_NAME"],
  SSPKR: ["Name", "Surname", "Patronomic"],
  PFT: ["Name", "Surname", "Patronomic"],
  PLPD_FIZ: ["Name", "Surname", "Patronomic"],
  PLPD_UR: ["", "", "", "", "FounderDetails", "INN"],
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
      formationRecords(arrayData, requredFields);
    }

    return {
      result: "success",
    };
  } catch (err) {
    console.error("Ошибка:", err);
    throw err;
  }
};

const fetchData = async (url: string): Promise<string> => {
  try {
    const response = await axios.get(url, {
        httpsAgent: new https.Agent({
          secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
        }),
    });
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
  if(instanceRedisCluster){
    instanceRedisCluster?.unlink(redisSetKey + "terrorist_fio");
    instanceRedisCluster?.unlink(redisSetKey + "terrorist_inn"); 
  }

  arrayData.forEach((objectPerson) => {
    const surname = filterData(objectPerson[needFields[1]]);
    const name = filterData(objectPerson[needFields[0]]);
    const patronomic = filterData(objectPerson[needFields[2]]);
    const fouthName = filterData(objectPerson[needFields[3]]);
    const onlyFullName = filterData(objectPerson[needFields[4]]);
    const inn = filterData(objectPerson[needFields[5]]);

    if (!onlyFullName) {
      //Если есть фамилия, то формируем комбинации
      const fullName = concatString(surname, name, patronomic);
      const surnameWithName = concatString(surname, name);
      const nameWithSurname = concatString(name, surname);
      const NamePatronomicSurname = concatString(name, patronomic, surname);

      const fullNameWithFourthName = concatString(fullName, fouthName);
      const NamePatronomicSurnameWithFouthName = concatString(NamePatronomicSurname, fouthName);

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
        insertToRedisOrToLog(inn, instanceRedisCluster, 'terrorist_inn');
      }
    }
  });
};

const insertToRedisOrToLog = (text: string, instanceRedisCluster: any, redisKey = "terrorist_fio"): void => {
  if (instanceRedisCluster) {
    instanceRedisCluster?.sAdd(redisSetKey + redisKey, text);
    instanceRedisCluster?.sAdd(redisSetKey + redisKey + "64", Buffer.from(text).toString("base64"));
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

const filterData = (element: string) => {
  if (element && typeof element === "string") {
    return element
      .replace(/[«»()\n'"--–+.,]|нет данных|na|n\/a/gi, "")
      .trim()
      .toUpperCase();
  }

  return "";
};
