import Papa from "papaparse";
import fs from "fs";
import path from "path";
import isEqual from "lodash/isEqual";

import {
  organizationUnitsMetaData,
  dataElementsMetaData,
} from "../utils/dhis2MetaData.js";
import {
  ClimateDataRecord,
  EntomologyDataRecord,
  OrgUnit,
} from "#types/index.js";

const makeBaseRecord = (
  ou: { name: string; District_ID: string; ouId?: string } | undefined,
  period: string
) => ({
  District: ou?.name.split(" ")[0] || "",
  District_ID: ou?.District_ID || "0",
  year: period.slice(0, 4),
  month: period.slice(4, 6),
});

export const formatDhis2Data = async (data: {
  data: {
    orgUnits: OrgUnit[];
    climate: any;
  };
}, jobLogger: any) => {
  // Prepare a result array, one entry per orgUnit
  jobLogger.info("Formatting DHIS2 data");
  const result = data.data.orgUnits.map((orgUnit) => {
    // Filter rows for this orgUnit
    const rowsForOrgUnit = data.data.climate.rows.filter(
      (row: any) => row[2] === orgUnit.id
    );

    // Format climate and entomology data for this orgUnit
    const formattedClimateData: Record<string, ClimateDataRecord> = {};
    const formattedEntomologyData: Record<string, EntomologyDataRecord> = {};

    rowsForOrgUnit.forEach((row: any) => {
      const dataElement = row[0];
      const period = row[1];
      const value = row[3];
      const ou = organizationUnitsMetaData
        ?.flatMap((item) => item.children)
        .find((org) => org.name === orgUnit.name);
      if (!ou) return;
      console.log("logging orgUNits from formatDhis2Data", ou);
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
        dataElementsMetaData?.find((dx) => dx.id === dataElement)
          ?.displayName || dataElement;
      formattedClimateData[key][dx] = parseFloat(value);
    });

    // Read historical data for this orgUnit
    const histCliDataObj = readClimateData([orgUnit])[0];
    const histEntDataObj = readHistEntData([orgUnit])[0];

    let isReplacement = false;
    Object.values(formattedEntomologyData).forEach((formattedRow) => {
      return histEntDataObj.data.forEach((histRow) => {
        if (
          histRow.District === formattedRow.District &&
          histRow.District_ID === formattedRow.District_ID &&
          histRow.year === formattedRow.year &&
          histRow.month === formattedRow.month
        ) {
          console.log("Replacing all_ano for", histRow);
          histRow.all_ano = "NA";
          isReplacement = true;
        }
      });
    });

    // Merge queried and historical data
    const cliData = [
      ...(histCliDataObj?.data || []),
      ...Object.values(formattedClimateData),
    ];
    // const cliData = Object.values(formattedClimateData);
    const entData = isReplacement
      ? [...(histEntDataObj?.data || [])]
      : [
          ...(histEntDataObj?.data || []),
          ...Object.values(formattedEntomologyData),
        ];

    return {
      orgUnit: orgUnit,
      cliData,
      entData,
    };
  });
  const groupedResults = result.reduce(
    (
      prev: Record<
        string,
        { orgUnits: OrgUnit[]; cliData: any[]; entData: any[] }
      >,
      current
    ) => {
      const parentName =
        current.orgUnit.parent?.name.split(" ")[0].toLowerCase() || "no-parent";
      if (!prev[parentName]) {
        prev[parentName] = { orgUnits: [], cliData: [], entData: [] };
      }
      prev[parentName].orgUnits.push(current.orgUnit);
      prev[parentName].cliData.push(...current.cliData);
      prev[parentName].entData.push(...current.entData);
      return prev;
    },
    {}
  );

  return groupedResults;
};

// create a fn that reads data from Data/climate_data.csv and returns it as json
const readCsv = <T>(filePath: string): T[] => {
  try {
    const fileContent = fs.readFileSync(filePath, "utf8");
    return Papa.parse<T>(fileContent, { header: true, skipEmptyLines: true })
      .data;
  } catch (error) {
    throw new Error(`Error reading CSV file at ${filePath}: ${error}`);
  }
};

const readClimateData = (orgUnits: OrgUnit[]) => {
  return orgUnits?.map((orgUnit) => {
    if (orgUnit.parent) {
      const data = readCsv<ClimateDataRecord>(
        path.join(
          process.cwd(),
          "src",
          "Data",
          `${orgUnit.parent.name.split(" ")[0].toLowerCase()}_climate.csv`
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
          `${orgUnit.name.split(" ")[0].toLowerCase()}_climate.csv`
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
          `${orgUnit.parent.name.split(" ")[0].toLowerCase()}_ent.csv`
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
          `${orgUnit.name.split(" ")[0].toLowerCase()}_ent.csv`
        )
      );
      return {
        parent: orgUnit,
        data,
      };
    }
  });
};
