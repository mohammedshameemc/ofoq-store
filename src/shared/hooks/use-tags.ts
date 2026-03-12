import { tagService, type Tag } from "../../services/supabase/tag.service";
import { useFetchData } from "./use-fetch-data";

export const useTags = () => {
  const state = useFetchData(() => tagService.getTags());
  return {
    tags: (state.data ?? []) as Tag[],
    isLoading: state.isLoading,
    error: state.error,
  };
};
