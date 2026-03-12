import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env file.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database types (you can generate these with Supabase CLI)
export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          short_description: string | null;
          price: number;
          sale_price: number | null;
          discount: number;
          stock: number;
          category_id: string | null;
          subcategory_id: string | null;
          image_url: string | null;
          featured: boolean;
          specifications: { key: string; value: string; sort_order: number }[] | null;
          status: "active" | "inactive" | "out_of_stock" | "draft" | "low_stock";
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["products"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
      };
      categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          image_url: string | null;
          parent_id: string | null;
          status: "active" | "inactive";
          product_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["categories"]["Row"],
          "id" | "created_at" | "updated_at" | "product_count"
        >;
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
      };
      orders: {
        Row: {
          id: string;
          customer_name: string;
          customer_email: string;
          total_amount: number;
          status: "pending" | "processing" | "completed" | "cancelled";
          items_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["orders"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
      };
      top_categories: {
        Row: {
          id: string;
          category_id: string;
          sort_order: number;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["top_categories"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<
          Database["public"]["Tables"]["top_categories"]["Insert"]
        >;
      };
      tags: {
        Row: {
          id: string;
          name: string;
          color: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["tags"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["tags"]["Insert"]>;
      };
      product_tags: {
        Row: {
          id: string;
          product_id: string;
          tag_id: string;
          sort_order: number;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["product_tags"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<
          Database["public"]["Tables"]["product_tags"]["Insert"]
        >;
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          image_url: string;
          sort_order: number;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["product_images"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<
          Database["public"]["Tables"]["product_images"]["Insert"]
        >;
      };
    };
  };
}
