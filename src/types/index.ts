export type ClimateDataRecord = {
  District: string;
  District_ID: number;
  year: number;
  month: number;
  [key: string]: string | number; // For dynamic data element columns
};

export type EntomologyDataRecord = {
  District: string;
  District_ID: number;
  year: number;
  month: number;
  all_ano: number | string
};
