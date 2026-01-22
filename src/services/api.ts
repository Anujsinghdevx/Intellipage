const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const fetchData = async (endpoint: string) => {
  const response = await fetch(`${API_URL}/${endpoint}`);
  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }
  return response.json();
};
