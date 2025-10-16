import Papa from "papaparse";
import path from "path";
import fs from "fs";
import { organizationUnitsMetaData } from "#utils/dhis2MetaData.js";
import { Dhis2ImportData, DhisImportFormat, ModelRes, OrgUnit } from "#types/index.js";

const dx = process.env.TEST_DATA_ELEMENT ?? "";

export const formatModelRes = (groupedResults: {
  parent: { id: string; code: string; name: string };
  data: ModelRes[];
  orgUnits: OrgUnit[]
}[], jobLogger: any): Dhis2ImportData => {
  const allDataValues: any[] = [];
  jobLogger.info("Formatting model results for DHIS2 import...");
  for (const group of groupedResults) {
    const { parent, data, orgUnits } = group;

    if (!data || data.length === 0) {
      jobLogger.info(`No data found for parent ${parent.name}`);
      continue;
    }

    // Optionally save each parent’s data to a CSV file

    // Map data to DHIS2 format
    const formattedValues = data.map((row) => {
      const month = String(row.month).padStart(2, "0");
      const orgUnit = orgUnits.find((org) => org.name.split(" ")[0] === row.District);
        

      return {
        period: `${row.year}${month}`,
        orgUnit: orgUnit?.id,// fallback
        dataElement: dx,
        value: row.Forecasted,
      };
    });

    allDataValues.push(...formattedValues);
  }

  const formattedJsonData: Dhis2ImportData = { dataValues: allDataValues };

  console.log("Formatted DHIS2 data:", formattedJsonData);
  return formattedJsonData;
};
