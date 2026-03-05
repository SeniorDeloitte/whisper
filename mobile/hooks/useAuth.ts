import { useApi } from "@/lib/axios";
import { User } from "@/types";
import { useQuery } from "@tanstack/react-query";


export const useCurrentUser = () => {
  const { apiWithAuth } = useApi();

  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data } = await apiWithAuth<User>({ method: "GET", url: "/auth/me" });
      return data;
    },
  });
};