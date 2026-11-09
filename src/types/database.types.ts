export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          color_hex: string;
          icon_name: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          color_hex: string;
          icon_name?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          description?: string | null;
          color_hex?: string;
          icon_name?: string | null;
          sort_order?: number;
          created_at?: string;
        };
      };
      tools: {
        Row: {
          id: string;
          slug: string;
          code_id: string;
          title: string;
          tagline: string;
          emoji: string;
          category_id: string | null;
          phase_number: number;
          status: 'published' | 'draft' | 'archived';
          is_featured: boolean;
          criollo_analogy: string;
          criollo_without_with: Json;
          criollo_semaforo: Json;
          risk_level: 'low' | 'medium' | 'high';
          mermaid_diagram: string | null;
          svg_infographic_config: Json | null;
          install_commands: Json;
          mcp_config_json: string | null;
          raw_markdown: string;
          repo_url: string | null;
          compatibility_tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          code_id: string;
          title: string;
          tagline: string;
          emoji?: string;
          category_id?: string | null;
          phase_number?: number;
          status?: 'published' | 'draft' | 'archived';
          is_featured?: boolean;
          criollo_analogy: string;
          criollo_without_with?: Json;
          criollo_semaforo?: Json;
          risk_level?: 'low' | 'medium' | 'high';
          mermaid_diagram?: string | null;
          svg_infographic_config?: Json | null;
          install_commands?: Json;
          mcp_config_json?: string | null;
          raw_markdown: string;
          repo_url?: string | null;
          compatibility_tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          code_id?: string;
          title?: string;
          tagline?: string;
          emoji?: string;
          category_id?: string | null;
          phase_number?: number;
          status?: 'published' | 'draft' | 'archived';
          is_featured?: boolean;
          criollo_analogy?: string;
          criollo_without_with?: Json;
          criollo_semaforo?: Json;
          risk_level?: 'low' | 'medium' | 'high';
          mermaid_diagram?: string | null;
          svg_infographic_config?: Json | null;
          install_commands?: Json;
          mcp_config_json?: string | null;
          raw_markdown?: string;
          repo_url?: string | null;
          compatibility_tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      combos: {
        Row: {
          id: string;
          slug: string;
          title: string;
          subtitle: string | null;
          badge_color: string;
          criollo_summary: string;
          workflow_note: string | null;
          phase_workflow_mermaid: string | null;
          is_featured: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          subtitle?: string | null;
          badge_color?: string;
          criollo_summary: string;
          workflow_note?: string | null;
          phase_workflow_mermaid?: string | null;
          is_featured?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          subtitle?: string | null;
          badge_color?: string;
          criollo_summary?: string;
          workflow_note?: string | null;
          phase_workflow_mermaid?: string | null;
          is_featured?: boolean;
          created_at?: string;
        };
      };
      ai_settings: {
        Row: {
          id: string;
          provider: 'gemini' | 'openai' | 'openrouter';
          model_text: string;
          model_image: string | null;
          enable_svg_fallback: boolean;
          api_key: string | null;
          api_key_encrypted: string | null;
          is_active: boolean;
          updated_at: string;
        };
        Insert: {
          id?: string;
          provider: 'gemini' | 'openai' | 'openrouter';
          model_text?: string;
          model_image?: string | null;
          enable_svg_fallback?: boolean;
          api_key?: string | null;
          api_key_encrypted?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
        Update: {
          id?: string;
          provider?: 'gemini' | 'openai' | 'openrouter';
          model_text?: string;
          model_image?: string | null;
          enable_svg_fallback?: boolean;
          api_key?: string | null;
          api_key_encrypted?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
      };
    };
  };
}
