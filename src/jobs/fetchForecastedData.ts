import {
  ClimateDataRecord,
  EntomologyDataRecord,
  OrgUnit,
} from "#types/index.js";
import Papa from "papaparse";
const baseUrl =
  process.env.MODEL_BASE_API_URI || "http://localhost:8000/forecast";
const endpoint = "/ano";

// Accept groupedResults as returned from formatDhis2Data
export const getForecastedAbundance = async (
  groupedResults: Record<
    string,
    {
      orgUnits: OrgUnit[];
      cliData: ClimateDataRecord[];
      entData: EntomologyDataRecord[];
    }
  >,
  jobLogger: any
) => {
  const results = [];
  jobLogger.info("Running R model to get forecasted abundance");
  jobLogger.info("Getting forecasted abundance from R model API");
  for (const [parentKey, group] of Object.entries(groupedResults)) {
    // Use the first orgUnit's parent for endpoint naming

    const parent = group.orgUnits[0]?.parent || group.orgUnits[0];

    // Prepare CSV files
    const csvFile_cliData = new File(
      [Papa.unparse(group.cliData)],
      `${parentKey}_climate.csv`,
      { type: "text/csv" }
    );
    const csvFile_entData = new File(
      [Papa.unparse(group.entData)],
      `${parentKey}_entomology.csv`,
      { type: "text/csv" }
    );

    const formData = new FormData();
    formData.append("climate_file", csvFile_cliData);
    formData.append("entomology_file", csvFile_entData);

    // Dynamic endpoint based on parentKey (region name or "no-parent")
    const targetUrl = `${baseUrl}${endpoint}/${parentKey}`;

    try {
      const res = await fetch(targetUrl, {
        method: "POST",
        body: formData,
      });

      if (!res.ok)
        throw new Error(`Failed for ${parentKey}: ${res.statusText}`);

      const data = await res.json();
      results.push({ parent: parent, orgUnits: group.orgUnits, data });
    } catch (e: any) {
      jobLogger.info(e, `Error fetching forecasted data for ${parentKey}`);
      results.push({ parent: parent, error: e.message });
    }
  }

  return results;
};
