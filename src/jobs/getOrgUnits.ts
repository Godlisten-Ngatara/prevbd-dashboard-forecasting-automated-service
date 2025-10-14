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
export async function getOrgUnits(orgUnitIds: string[], jobLogger: any) {
  const start = Date.now();

  jobLogger.info("Getting Organization Units metadata");
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

  //   console.log(orgUnits);

  const hasRegion = orgUnits.some((ou: any) => ou.level === 3);
  const onlyDistricts = orgUnits.every((ou: any) => ou.level === 4);
  const onlyRegions = orgUnits.every((ou: any) => ou.level === 3);
  // Step 3: Decide behavior
  if (hasRegion && !onlyDistricts && !onlyRegions) {
    // Mixed selection: fetch all districts under all selected regions and include directly selected districts
    const regions = orgUnits.filter((r: any) => r.level === 3);
    const districts = orgUnits.filter((d: any) => d.level === 4);

    let allDistricts: {
      id: string;
      code: string;
      name: string;
      parent?: any;
    }[] = [];

    // Fetch districts under each selected region
    for (const region of regions) {
      jobLogger.info(`Loading districts for ${region.name}`);
      const res = await fetch(
        `${DHIS2_BASE_URL}/organisationUnits?filter=path:like:${region.id}&level=4&fields=id,name,code,parent[id,code,name]&paging=false`,
        { headers }
      );
      const { organisationUnits } = (await res.json()) as OrgUnitResponse;
      jobLogger.info({
        status: "success",
        durationMs: Date.now() - start,
      });
      allDistricts.push(
        ...organisationUnits.map((d: any) => ({
          id: d.id,
          code: d.code,
          name: d.name,
          parent: d.parent,
        }))
      );
    }

    // Add any directly selected districts (not already included)
    allDistricts.push(
      ...districts.map((d: any) => ({
        id: d.id,
        code: d.code,
        name: d.name,
        parent: d.parent,
      }))
    );

    // Remove duplicates by district id
    const uniqueDistricts = Array.from(
      new Map(allDistricts.map((d) => [d.id, d])).values()
    );

    return {
      organisationUnits: uniqueDistricts,
    };
  }
  if (onlyDistricts) {
    jobLogger.info("Getting selected districts directly");
    // ✅ Only districts selected → return them directly
    return {
      organisationUnits: orgUnits.map((d) => ({
        id: d.id,
        code: d.code,
        name: d.name,
        parent: d.parent,
      })),
    };
  }

  // ✅ Only regions selected (no districts) → fetch districts under those regions
  const allDistricts: { id: string; code: string; name: string }[] = [];

  for (const region of orgUnits.filter((r) => r.level === 3)) {
    jobLogger.info(`Loading districts for ${region.name}`);
    const res = await fetch(
      `${DHIS2_BASE_URL}/organisationUnits?filter=path:like:${region.id}&level=4&fields=id,name,code,parent[id,name,code]&paging=false`,
      { headers }
    );
    const { organisationUnits } = (await res.json()) as OrgUnitResponse;

    allDistricts.push(
      ...organisationUnits.map((d: any) => ({
        id: d.id,
        code: d.code,
        name: d.name,
        parent: d.parent,
      }))
    );
  }

  // Remove duplicates

  return {
    organisationUnits: allDistricts,
  };
}
