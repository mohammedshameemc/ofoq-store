import { Database, supabase } from "../../config/supabase";

type Tag = Database["public"]["Tables"]["tags"]["Row"];
type TagInsert = Database["public"]["Tables"]["tags"]["Insert"];
type TagUpdate = Database["public"]["Tables"]["tags"]["Update"];

export type { Tag };

class TagService {
  /**
   * Get all tags ordered by name.
   */
  async getTags(): Promise<{ data: Tag[] }> {
    const { data, error } = await supabase
      .from("tags")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw new Error(error.message);
    return { data: data as Tag[] };
  }

  /**
   * Create a new tag.
   */
  async createTag(tag: TagInsert): Promise<Tag> {
    const { data, error } = await supabase
      .from("tags")
      .insert(tag)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as Tag;
  }

  /**
   * Update a tag by ID.
   */
  async updateTag(id: string, updates: TagUpdate): Promise<Tag> {
    const { data, error } = await supabase
      .from("tags")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as Tag;
  }

  /**
   * Delete a tag by ID.
   */
  async deleteTag(id: string): Promise<void> {
    const { error } = await supabase.from("tags").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }
}

export const tagService = new TagService();
