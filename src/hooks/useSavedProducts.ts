import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useUserContext } from "../context/UserContext";
import { fetchSavedProductIds, toggleSaveProduct } from "../api/user";

export const useSavedProducts = () => {
  const { user } = useUserContext();
  const queryClient = useQueryClient();

  const userKey = user?.username ?? "guest";

  const {
    data: savedProductIds = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<number[]>({
    queryKey: ["savedProducts", userKey],
    queryFn: () => fetchSavedProductIds(),
    enabled: !!user,
    staleTime: 60 * 1000,
  });

  const mutation = useMutation({
    mutationFn: ({
      productId,
      isSaved,
    }: {
      productId: number;
      isSaved: boolean;
    }) => toggleSaveProduct(productId, isSaved),
    onSuccess: (_, { isSaved }) => {
      toast.success(isSaved ? "Removed from saved." : "Product saved!");
      queryClient.invalidateQueries({
        queryKey: ["savedProducts", userKey],
      });
    },
    onError: () => {
      toast.error("❌ Error saving product.");
    },
  });

  const toggleSave = (productId: number) => {
    if (!user) {
      toast.warn("🔒 Log in to save products!");
      return;
    }
    mutation.mutate({
      productId,
      isSaved: savedProductIds.includes(productId),
    });
  };

  return {
    savedProductIds,
    toggleSaveProduct: toggleSave,
    isLoading,
    isError,
    refetch,
    isSaving: mutation.isPending,
  };
};
