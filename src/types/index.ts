export type ClimateDataRecord = {
  District: string;
  District_ID: string;
  year: string;
  month: string;
  [key: string]: string | number; // For dynamic data element columns
};

export type EntomologyDataRecord = {
  District: string;
  District_ID: string;
  year: string;
  month: string;
  all_ano: number | string;
};

export enum Step {
  INITIAL,
  SECOND,
  THIRD,
  FOURTH,
  FIFTH,
  SIXTH,
  FINAL,
}

export type ModelRes = {
  District: string;
  month: string;
  year: string;
  Forecasted: number;
};
export type DhisImportFormat = {
  dataElement: string;
  value: number;
  orgUnit: string;
  period: string;
};
export type Dhis2ImportData = {
  dataValues: DhisImportFormat[];
};

export interface OrgUnit {
  id: string
  code: string
  name: string
  level?: number
  parent?: {
    id: string
    code: string
    name: string
  }
  District_ID?: string
}

export type OrgUnitResponse = {
  organisationUnits: OrgUnit[]
}


