import Papa from "papaparse";
import path from "path";
import fs from "fs";
export const formatModelRes = (modelRes: any) => {
  // create a path to the file named forecasted.csv in src
  const forecasted_results_csv = Papa.unparse(modelRes);

  const filePath = path.join(
    process.cwd(),
    "src",
    "Data",
    "forecasted_data.csv"
  );
  // save the res to a file
  fs.writeFileSync(filePath, forecasted_results_csv);
};
