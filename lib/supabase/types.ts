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
      profiles: {
        Row: {
          id: string;
          name: string | null;
          class: string | null;
          parent_phone: string | null;
          chess_profile_url: string | null;
          chess_rating: number | null;
          profile_photo: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name?: string | null;
          class?: string | null;
          parent_phone?: string | null;
          chess_profile_url?: string | null;
          chess_rating?: number | null;
          profile_photo?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string | null;
          class?: string | null;
          parent_phone?: string | null;
          chess_profile_url?: string | null;
          chess_rating?: number | null;
          profile_photo?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          event_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          event_date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          event_date?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      event_signups: {
        Row: {
          event_id: string;
          user_id: string;
          joined_at: string;
        };
        Insert: {
          event_id: string;
          user_id: string;
          joined_at?: string;
        };
        Update: {
          event_id?: string;
          user_id?: string;
          joined_at?: string;
        };
        Relationships: [];
      };
      match_results: {
        Row: {
          id: string;
          event_id: string | null;
          player1_id: string;
          player2_id: string;
          winner_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id?: string | null;
          player1_id: string;
          player2_id: string;
          winner_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string | null;
          player1_id?: string;
          player2_id?: string;
          winner_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          user_id: string;
          subject: string;
          message: string;
          admin_reply: string | null;
          status: 'pending' | 'replied';
          created_at: string;
          replied_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject: string;
          message: string;
          admin_reply?: string | null;
          status?: 'pending' | 'replied';
          created_at?: string;
          replied_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          subject?: string;
          message?: string;
          admin_reply?: string | null;
          status?: 'pending' | 'replied';
          created_at?: string;
          replied_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Event = Database['public']['Tables']['events']['Row'];
export type EventSignup = Database['public']['Tables']['event_signups']['Row'];
export type MatchResult = Database['public']['Tables']['match_results']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];
