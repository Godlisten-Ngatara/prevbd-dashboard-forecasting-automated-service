import { OrgUnit, OrgUnitResponse } from "#types/index";

const DHIS2_BASE_URL =
  process.env.PREVBD_BASE_API_URI || "https://prevbd.org/prevbd/api";
const headers = {
  Authorization: `Basic ${Buffer.from(
    `${process.env.PREVBD_API_USER}:${process.env.PREVBD_API_PASSWORD}`
  ).toString("base64")}`,
  "Content-Type": "application/json",
};

// Step 1: Fetch metadata of selected orgUnit to determine its level
export async function getOrgUnits(orgUnitIds: string[]) {
  // Step 1: Fetch metadata for all selected orgUnits in parallel
  const metaResponses: Promise<OrgUnit[]> = Promise.all(
    orgUnitIds.map((id) =>
      fetch(
        `${DHIS2_BASE_URL}/organisationUnits/${id}?fields=id,name,code,level,parent[id,code,name]`,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(
              `${process.env.PREVBD_API_USER}:${process.env.PREVBD_API_PASSWORD}`
            ).toString("base64")}`,
            "Content-Type": "application/json",
          },
        }
      ).then((r) => r.json() as Promise<OrgUnit>)
    )
  );

  // Step 2: Detect if any selection is a region
  const orgUnits = await metaResponses;

  console.log(orgUnits);

  const hasRegion = orgUnits.some((ou: any) => ou.level === 3);
  const onlyDistricts = orgUnits.every((ou: any) => ou.level === 4);
  const onlyRegions = orgUnits.every((ou: any) => ou.level === 3);
  // Step 3: Decide behavior
  if (hasRegion && !onlyDistricts && !onlyRegions) {
    // ⚠️ Mixed or region-only selection → fetch all districts in the system
    const region = orgUnits.find((r: any) => r.level === 3) ?? orgUnits[0];
    console.log(region);

    const res = await fetch(
      `${DHIS2_BASE_URL}/organisationUnits?filter=path:like:${region.id}&level=4&fields=id,name,code&paging=false`,
      { headers }
    );
    const { organisationUnits } = (await res.json()) as OrgUnitResponse;
    return organisationUnits.map((d: any) => ({
      id: d.id,
      code: d.code,
      name: d.name,
    }));
  }

  if (onlyDistricts) {
    // ✅ Only districts selected → return them directly
    return orgUnits.map((d) => ({
      id: d.id,
      code: d.code,
      name: d.name,
      parent: d.parent,
    }));
  }

  // ✅ Only regions selected (no districts) → fetch districts under those regions
  const allDistricts: { id: string; code: string; name: string }[] = [];

  for (const region of orgUnits.filter((r) => r.level === 3)) {
    const res = await fetch(
      `${DHIS2_BASE_URL}/organisationUnits?filter=path:like:${region.id}&level=4&fields=id,name,code&paging=false`,
      { headers }
    );
    const { organisationUnits } = (await res.json()) as OrgUnitResponse;
    allDistricts.push(
      ...organisationUnits.map((d: any) => ({
        id: d.id,
        code: d.code,
        name: d.name,
      }))
    );
  }

  // Remove duplicates

  return allDistricts;
}

// Test function to fetch org units
async function test() {
  const orgUnitIds = ["Nyd7qIdoR4R", "eCeku5fUWg8"]; // Example org unit IDs (regions and districts)
  const orgUnits = await getOrgUnits(orgUnitIds);
  console.log("Fetched Org Units:", orgUnits);
}

// Uncomment to run the test function
test();
