/**
 * Supabase Database Types
 *
 * IMPORTANT: This file should be GENERATED via Supabase CLI:
 *   supabase gen types typescript --local > types/database.ts
 *
 * For now, this is a skeleton. After Step 2 (Supabase setup),
 * run the CLI command above to auto-generate from your Supabase schema.
 */

export type Database = {
  public: {
    Tables: {
      speakers: {
        Row: {
          id: string;
          full_name: string;
          position: string | null;
          photo_url: string | null;
          photo_path: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['speakers']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['speakers']['Row']>;
      };
      presenters: {
        Row: {
          id: string;
          name: string;
          background_url: string | null;
          background_path: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['presenters']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['presenters']['Row']>;
      };
      branding_settings: {
        Row: {
          id: string;
          rri_logo_url: string | null;
          rri_logo_path: string | null;
          pro1_logo_url: string | null;
          pro1_logo_path: string | null;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['branding_settings']['Row'], 'updated_at'>;
        Update: Partial<Database['public']['Tables']['branding_settings']['Row']>;
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
};
