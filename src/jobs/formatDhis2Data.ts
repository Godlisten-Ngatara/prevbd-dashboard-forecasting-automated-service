import Papa from "papaparse";
import fs from "fs";
import path from "path";
import {
  organizationUnitsMetaData,
  dataElementsMetaData,
} from "../utils/dhis2MetaData.js";
import { ClimateDataRecord, EntomologyDataRecord } from "#types/index.js";
import { getForecastedAbundance } from "./fetchForecastedData.js";
const makeBaseRecord = (
  ou: { displayName: string; District_ID: number; ouId: string } | undefined,
  period: string
) => ({
  District: ou?.displayName || "",
  District_ID: ou?.District_ID || 0,
  year: parseInt(period.slice(0, 4)),
  month: parseInt(period.slice(4, 6)),
});

export const formatDhis2Data = async (data: any) => {
  //Define the Required Json Format
  const formattedClimateData: Record<string, ClimateDataRecord> = {};
  const formattedEntomologyData: Record<string, EntomologyDataRecord> = {};
  data.rows.map((row: any, index: number) => {
    const dataElement = row[0];
    const period = row[1];
    const orgUnit = row[2];
    const value = row[3];
    const ou = organizationUnitsMetaData.find((ou) => ou.ouId === orgUnit);
    const key = `${ou?.displayName}-${period}`;
    if (!formattedClimateData[key]) {
      formattedClimateData[key] = { ...makeBaseRecord(ou, period) };
      
    }
    else if(!formattedEntomologyData[key]) {
      formattedEntomologyData[key] = {
        ...makeBaseRecord(ou, period),
        all_ano: "NA",
      };
    }
    const dx =
      dataElementsMetaData?.find((dx) => dx.id === dataElement)?.displayName ||
      dataElement;
    formattedClimateData[key][dx] = parseFloat(value);
  });

  // convert into csv and save the file
  const jsonCliData_queried = Object.values(formattedClimateData);
  const jsonEntData_queried = Object.values(formattedEntomologyData)

  // Call the readClimateData and readHisEntData function to get the data and append the jsonFormatteCliData 
  const histCliData = readClimateData();
  const histEntData = readHistEntData();

  
  const cliData = [...histCliData, ...jsonCliData_queried];
  const entData = [...histEntData, ...jsonEntData_queried]

  const csvOutput_cliData = Papa.unparse(cliData);
  const csvOutput_entData = Papa.unparse(entData);

  
  return { csvOutput_cliData, csvOutput_entData };
};


// create a fn that reads data from Data/climate_data.csv and returns it as json
const readCsv = <T>(filePath: string): T[] => {
  const fileContent = fs.readFileSync(filePath, "utf8");
  return Papa.parse<T>(fileContent, { header: true, skipEmptyLines: true })
    .data;
};

const readClimateData = () =>
  readCsv<ClimateDataRecord>(path.join(
    process.cwd(),
    "src",
    "Data",
    "climate_data.csv"
  ));
const readHistEntData = () =>
  readCsv<EntomologyDataRecord>(path.join(
    process.cwd(),
    "src",
    "Data",
    "tanga_data.csv"
  ));
