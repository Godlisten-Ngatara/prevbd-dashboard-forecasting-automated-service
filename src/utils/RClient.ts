const baseUrl =
  process.env.MODEL_BASE_API_URI || "http://localhost:8000/forecast";
const endpoint = "/ano-tanga";
const targetUrl = `${baseUrl}${endpoint}`;
export const getForecastedAbundance = async (
  csvString_cliData: string,
  csvString_entData: string
) => {
  const csvFile_cliData = new File([csvString_cliData], "climate_data.csv", {
    type: "text/csv",
  });
  const csvFile_entData = new File([csvString_entData], "entomology_data.csv", {
    type: "text/csv",
  });
  const formData = new FormData();
  formData.append("climate_file", csvFile_cliData);
  formData.append("entomology_file", csvFile_entData);
  try {
    const res = await fetch(targetUrl, {
      method: "POST",
      body: formData, // no Content-Type
    });
    console.log(formData);
    
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`API request failed (${res.status}): ${text}`);
    }

    const data = await res.json();
    return { success: true, forecasted_results: data };
  } catch (e: any) {
    console.error("Error sending CSV:", e);
    return { success: false, message: e.message };
  }
};
