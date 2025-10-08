import Papa from "papaparse";
import fs from "fs";
import path from "path";
import {
  organizationUnitsMetaData,
  dataElementsMetaData,
} from "../utils/dhis2MetaData.js";
import {
  ClimateDataRecord,
  EntomologyDataRecord,
  OrgUnit,
} from "#types/index.js";
import { getForecastedAbundance } from "./fetchForecastedData.js";
const makeBaseRecord = (
  ou: { name: string; District_ID: number; ouId?: string } | undefined,
  period: string
) => ({
  District: ou?.name || "",
  District_ID: ou?.District_ID || 0,
  year: parseInt(period.slice(0, 4)),
  month: parseInt(period.slice(4, 6)),
});

export const formatDhis2Data = async (data: {
  orgUnits: OrgUnit[];
  data: any;
}) => {
  //Define the Required Json Format
  const formattedClimateData: Record<string, ClimateDataRecord> = {};
  const formattedEntomologyData: Record<string, EntomologyDataRecord> = {};
  data.data.rows.map((row: any, index: number) => {
    const dataElement = row[0];
    const period = row[1];
    const orgUnit = row[2];
    const value = row[3];
    const org = data?.orgUnits?.find((ou) => ou.id === orgUnit);
    const ou = organizationUnitsMetaData
      ?.flatMap((item) => item.children)
      .find((ou) => ou.code === org?.code);
    const key = `${ou?.name}-${period}`;
    if (!formattedClimateData[key]) {
      formattedClimateData[key] = { ...makeBaseRecord(ou, period) };
    } else if (!formattedEntomologyData[key]) {
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
  const jsonEntData_queried = Object.values(formattedEntomologyData);

  // Call the readClimateData and readHisEntData function to get the data and append the jsonFormatteCliData
  const histCliData = readClimateData(data.orgUnits) || [];
  const histEntData = readHistEntData(data.orgUnits) || [];

  const cliData = [...histCliData, ...jsonCliData_queried];
  const entData = [...histEntData, ...jsonEntData_queried];

  const csvOutput_cliData = Papa.unparse(cliData);
  const csvOutput_entData = Papa.unparse(entData);

  return { csvOutput_cliData, csvOutput_entData, orgUnit: data?.orgUnits };
};

// create a fn that reads data from Data/climate_data.csv and returns it as json
const readCsv = <T>(filePath: string): T[] => {
  const fileContent = fs.readFileSync(filePath, "utf8");
  return Papa.parse<T>(fileContent, { header: true, skipEmptyLines: true })
    .data;
};

const readClimateData = (orgUnits: OrgUnit[]) => {
  return orgUnits?.map((orgUnit) => {
    if (orgUnit.parent) {
      const data = readCsv<ClimateDataRecord>(
        path.join(
          process.cwd(),
          "src",
          "Data",
          `${orgUnit.parent.name.toLowerCase()}_climate.csv`
        )
      );
      return {
        parent: orgUnit?.parent,
        data,
      };
    } else {
      const data = readCsv<ClimateDataRecord>(
        path.join(
          process.cwd(),
          "src",
          "Data",
          `${orgUnit.name.toLowerCase()}_climate.csv`
        )
      );
      return {
        parent: orgUnit,
        data,
      };
    }
  });
};

const readHistEntData = (orgUnits: OrgUnit[]) => {
  return orgUnits?.map((orgUnit) => {
    if (orgUnit.parent) {
      const data = readCsv<EntomologyDataRecord>(
        path.join(
          process.cwd(),
          "src",
          "Data",
          `${orgUnit.parent.name.toLowerCase()}_ent.csv`
        )
      );
      return {
        parent: orgUnit?.parent,
        data,
      };
    } else {
      const data = readCsv<EntomologyDataRecord>(
        path.join(
          process.cwd(),
          "src",
          "Data",
          `${orgUnit.name.toLowerCase()}_ent.csv`
        )
      );
      return {
        parent: orgUnit,
        data,
      };
    }
  });
};
