export type Database = {
  public: {
    Tables: {
      bookmarks: {
        Row: {
          id: string
          created_at: string
          user_id: string
          title: string
          url: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          title: string
          url: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          title?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: 'bookmarks_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

// Export helper types
export type Bookmark = Database['public']['Tables']['bookmarks']['Row']
