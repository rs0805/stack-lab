import { useEffect, useState } from "react";
import { fetchLocationsApi } from "./locationService";

export const useGetLocations = () => {
  const [locations, setLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchLocationsApi()
      .then(setLocations)
      .catch(() => setLocations([]))
      .finally(() => setLoading(false));
  }, []);
  return { locations, loading };
};
