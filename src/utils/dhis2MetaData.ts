const organizationUnitsMetaData = [
  {
    parent: { code: "", name: "" },
    children: [
      {
        code: "TZ.NT.TN.HD.6",
        name: "Handeni District Council",
        District_ID: "1",
      },
      {
        code: "TZ.NT.TN.KO.2",
        name: "Korogwe District Council",
        District_ID: "2",
      },
      {
        code: "TZ.NT.TN.LS.1",
        name: "Lushoto District Council",
        District_ID: "3",
      },
      {
        code: "TZ.NT.TN.MK.8",
        name: "Mkinga District Council",
        District_ID: "4",
      },
      {
        code: "TZ.NT.TN.MH.3",
        name: "Muheza District Council",
        District_ID: "5",
      },
      { code: "TZ.NT.TN.TN.4", name: "Tanga City Council", District_ID: "6" },
    ],
  },
  {
    parent: { code: "", name: "" },
    children: [
      { code: "", name: "Kaskazini B", District_ID: "1" },
      { code: "", name: "Kati", District_ID: "2" },
      { code: "", name: "Magharibi A", District_ID: "3" },
      { code: "", name: "Mjini", District_ID: "4" },
    ],
  },
];
const dataElementsMetaData = [
  { id: "YbMrdSQNLv3", displayName: "Precip." },
  { id: "t4pDkufZCP6", displayName: "Max_temp" },
  { id: "L2SzqNRNLbL", displayName: "Min_temp" },
  { id: "niosrPOHrQf", displayName: "Relat_humid." },
];

export { organizationUnitsMetaData, dataElementsMetaData };
