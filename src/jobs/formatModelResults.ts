import Papa from "papaparse";
import path from "path";
import fs from "fs";
import { organizationUnitsMetaData } from "#utils/dhis2MetaData.js";
import { ModelRes } from "#types/index.js";
const dx = process.env.TEST_DATA_ELEMENT ?? "";
export const formatModelRes = (modelRes: ModelRes[]) => {
  // create a path to the file named forecasted.csv in src
  const forecasted_results_csv_test = Papa.unparse(modelRes);

  // const formattedCsvData = modelRes?.map((row, index) => {
  //   let month = String(row.month).padStart(2, "0");
  //   const orgUnit = organizationUnitsMetaData.find(
  //     (ou) => ou.displayName === row.District
  //   );
  //   const dhis2CsvFormat = {
  //     dataelement: "ziDDSitwIPh", // <-- adjust to your CSV column name
  //     period: `${row.year}${month}`,
  //     orgunit: orgUnit?.ouId,
  //     catoptcombo: "",
  //     attroptcombo: "",
  //     value: row.Forecasted, // <-- adjust to your CSV column name
  //     strby: "",
  //     lstupd: "",
  //     cmt: "",
  //   };
  //   return dhis2CsvFormat;
  // });
  const formatttedJsonData = {
    dataValues: modelRes.map((row, index) => {
      const month = String(row.month).padStart(2, "0");
      const orgUnit = organizationUnitsMetaData.flatMap(
        (item) => item.orgUnitDis
      ).find((dis) => dis.displayName === row.District);
      const dhis2JsonFormat = {
        period: `${row.year}${month}`,
        orgUnit: orgUnit?.ouId,
        dataElement: dx,
        value: row.Forecasted,
      };
      return dhis2JsonFormat;
    }),
  };
  // const forecasted_results_csv = Papa.unparse(formattedCsvData);
  // const filePath_test = path.join(
  //   process.cwd(),
  //   "src",
  //   "Data"orgUnit,
  //   "forecasted_data_test.csv"
  // );
  // const filePath = path.join(
  //   process.cwd(),
  //   "src",
  //   "Data",
  //   "forecasted_data.csv"
  // );

  // const filePath_json = path.join(
  //   process.cwd(),
  //   "src",
  //   "Data",
  //   "forecasted_data.json"
  // );
  // // save the res to a file
  // fs.writeFileSync(filePath_test, forecasted_results_csv_test);
  // fs.writeFileSync(filePath, forecasted_results_csv);
  console.log(formatttedJsonData);
  
  return formatttedJsonData
};
