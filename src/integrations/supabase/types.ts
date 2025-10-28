export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      age_groups_lookup: {
        Row: {
          age_group_code: string
          age_group_name: string
          description: string | null
          id: number
          max_age_days: number | null
          min_age_days: number | null
        }
        Insert: {
          age_group_code: string
          age_group_name: string
          description?: string | null
          id?: number
          max_age_days?: number | null
          min_age_days?: number | null
        }
        Update: {
          age_group_code?: string
          age_group_name?: string
          description?: string | null
          id?: number
          max_age_days?: number | null
          min_age_days?: number | null
        }
        Relationships: []
      }
      agent_actions: {
        Row: {
          action_data: Json
          action_type: string
          created_at: string | null
          execution_time_ms: number | null
          id: string
          metadata: Json | null
          query_id: number | null
          status: string | null
          user_session_id: string | null
        }
        Insert: {
          action_data: Json
          action_type: string
          created_at?: string | null
          execution_time_ms?: number | null
          id?: string
          metadata?: Json | null
          query_id?: number | null
          status?: string | null
          user_session_id?: string | null
        }
        Update: {
          action_data?: Json
          action_type?: string
          created_at?: string | null
          execution_time_ms?: number | null
          id?: string
          metadata?: Json | null
          query_id?: number | null
          status?: string | null
          user_session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_actions_query_id_fkey"
            columns: ["query_id"]
            isOneToOne: false
            referencedRelation: "queries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_actions_user_session_id_fkey"
            columns: ["user_session_id"]
            isOneToOne: false
            referencedRelation: "user_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_logs: {
        Row: {
          agent_id: string | null
          agent_profile_id: string | null
          created_at: string | null
          depth_level: number | null
          has_subtasks: boolean | null
          id: string
          level: string
          message: string
          metadata: Json | null
          parent_task_id: string | null
          subtask_count: number | null
          task_id: string | null
        }
        Insert: {
          agent_id?: string | null
          agent_profile_id?: string | null
          created_at?: string | null
          depth_level?: number | null
          has_subtasks?: boolean | null
          id?: string
          level: string
          message: string
          metadata?: Json | null
          parent_task_id?: string | null
          subtask_count?: number | null
          task_id?: string | null
        }
        Update: {
          agent_id?: string | null
          agent_profile_id?: string | null
          created_at?: string | null
          depth_level?: number | null
          has_subtasks?: boolean | null
          id?: string
          level?: string
          message?: string
          metadata?: Json | null
          parent_task_id?: string | null
          subtask_count?: number | null
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_logs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_logs_agent_profile_id_fkey"
            columns: ["agent_profile_id"]
            isOneToOne: false
            referencedRelation: "agent_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_logs_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "agent_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_logs_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_performance: {
        Row: {
          agent_profile_id: string | null
          avg_completion_time_ms: number | null
          completed_tasks: number | null
          id: string
          last_updated: string | null
          success_rate: number | null
          task_category: string | null
          total_tasks: number | null
        }
        Insert: {
          agent_profile_id?: string | null
          avg_completion_time_ms?: number | null
          completed_tasks?: number | null
          id?: string
          last_updated?: string | null
          success_rate?: number | null
          task_category?: string | null
          total_tasks?: number | null
        }
        Update: {
          agent_profile_id?: string | null
          avg_completion_time_ms?: number | null
          completed_tasks?: number | null
          id?: string
          last_updated?: string | null
          success_rate?: number | null
          task_category?: string | null
          total_tasks?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_performance_agent_profile_id_fkey"
            columns: ["agent_profile_id"]
            isOneToOne: false
            referencedRelation: "agent_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_profiles: {
        Row: {
          color_theme: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_default: boolean | null
          model_preference: string | null
          name: string
          role: string
          system_prompt: string
        }
        Insert: {
          color_theme?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_default?: boolean | null
          model_preference?: string | null
          name: string
          role: string
          system_prompt: string
        }
        Update: {
          color_theme?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_default?: boolean | null
          model_preference?: string | null
          name?: string
          role?: string
          system_prompt?: string
        }
        Relationships: []
      }
      agents: {
        Row: {
          completed_at: string | null
          config: Json | null
          created_at: string | null
          id: string
          metrics: Json | null
          name: string
          objective: string
          started_at: string | null
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          config?: Json | null
          created_at?: string | null
          id?: string
          metrics?: Json | null
          name: string
          objective: string
          started_at?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          config?: Json | null
          created_at?: string | null
          id?: string
          metrics?: Json | null
          name?: string
          objective?: string
          started_at?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      alert_rules: {
        Row: {
          created_at: string | null
          function_id: string | null
          id: string
          is_enabled: boolean | null
          notification_method: string | null
          rule_type: string
          threshold: number
        }
        Insert: {
          created_at?: string | null
          function_id?: string | null
          id?: string
          is_enabled?: boolean | null
          notification_method?: string | null
          rule_type: string
          threshold: number
        }
        Update: {
          created_at?: string | null
          function_id?: string | null
          id?: string
          is_enabled?: boolean | null
          notification_method?: string | null
          rule_type?: string
          threshold?: number
        }
        Relationships: [
          {
            foreignKeyName: "alert_rules_function_id_fkey"
            columns: ["function_id"]
            isOneToOne: false
            referencedRelation: "edge_functions"
            referencedColumns: ["id"]
          },
        ]
      }
      alerts: {
        Row: {
          acknowledged_at: string | null
          alert_type: string
          created_at: string | null
          function_name: string
          id: string
          is_acknowledged: boolean | null
          message: string
          severity: string
        }
        Insert: {
          acknowledged_at?: string | null
          alert_type: string
          created_at?: string | null
          function_name: string
          id?: string
          is_acknowledged?: boolean | null
          message: string
          severity: string
        }
        Update: {
          acknowledged_at?: string | null
          alert_type?: string
          created_at?: string | null
          function_name?: string
          id?: string
          is_acknowledged?: boolean | null
          message?: string
          severity?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          created_at: string | null
          details: Json | null
          event: string
          id: number
          user_sub_hash: string
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          event: string
          id?: number
          user_sub_hash: string
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          event?: string
          id?: number
          user_sub_hash?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          project_id: string | null
          role: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          project_id?: string | null
          role: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          project_id?: string | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      citations: {
        Row: {
          abstract: string | null
          access_date: string | null
          authors: string[] | null
          citation_format: string | null
          citation_type: string
          created_at: string | null
          doi: string | null
          edition: string | null
          evidence_level: string | null
          full_citation: string | null
          id: string
          is_active: boolean | null
          isbn: string | null
          issue: string | null
          journal_name: string | null
          keywords: string[] | null
          metadata: Json | null
          notes: string | null
          page_numbers: string | null
          peer_reviewed: boolean | null
          pmid: string | null
          publication_year: number | null
          publisher: string | null
          reliability_score: number | null
          specialty_relevance: string[] | null
          title: string
          updated_at: string | null
          url: string | null
          volume: string | null
        }
        Insert: {
          abstract?: string | null
          access_date?: string | null
          authors?: string[] | null
          citation_format?: string | null
          citation_type: string
          created_at?: string | null
          doi?: string | null
          edition?: string | null
          evidence_level?: string | null
          full_citation?: string | null
          id?: string
          is_active?: boolean | null
          isbn?: string | null
          issue?: string | null
          journal_name?: string | null
          keywords?: string[] | null
          metadata?: Json | null
          notes?: string | null
          page_numbers?: string | null
          peer_reviewed?: boolean | null
          pmid?: string | null
          publication_year?: number | null
          publisher?: string | null
          reliability_score?: number | null
          specialty_relevance?: string[] | null
          title: string
          updated_at?: string | null
          url?: string | null
          volume?: string | null
        }
        Update: {
          abstract?: string | null
          access_date?: string | null
          authors?: string[] | null
          citation_format?: string | null
          citation_type?: string
          created_at?: string | null
          doi?: string | null
          edition?: string | null
          evidence_level?: string | null
          full_citation?: string | null
          id?: string
          is_active?: boolean | null
          isbn?: string | null
          issue?: string | null
          journal_name?: string | null
          keywords?: string[] | null
          metadata?: Json | null
          notes?: string | null
          page_numbers?: string | null
          peer_reviewed?: boolean | null
          pmid?: string | null
          publication_year?: number | null
          publisher?: string | null
          reliability_score?: number | null
          specialty_relevance?: string[] | null
          title?: string
          updated_at?: string | null
          url?: string | null
          volume?: string | null
        }
        Relationships: []
      }
      clinical_cases: {
        Row: {
          age_group: string
          author_credentials: string | null
          case_source: string | null
          case_title: string
          case_type: string
          chief_complaint: string
          complexity_level: number | null
          complications: string[] | null
          created_at: string | null
          diagnosis: string | null
          differential_diagnoses: string[] | null
          evidence_level: string | null
          history_of_present_illness: string | null
          id: string
          imaging_results: Json | null
          is_active: boolean | null
          laboratory_results: Json | null
          learning_points: string[] | null
          metadata: Json | null
          past_medical_history: string | null
          physical_examination: string | null
          review_status: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          topic_ids: string[] | null
          treatment_plan: string | null
          updated_at: string | null
        }
        Insert: {
          age_group: string
          author_credentials?: string | null
          case_source?: string | null
          case_title: string
          case_type: string
          chief_complaint: string
          complexity_level?: number | null
          complications?: string[] | null
          created_at?: string | null
          diagnosis?: string | null
          differential_diagnoses?: string[] | null
          evidence_level?: string | null
          history_of_present_illness?: string | null
          id?: string
          imaging_results?: Json | null
          is_active?: boolean | null
          laboratory_results?: Json | null
          learning_points?: string[] | null
          metadata?: Json | null
          past_medical_history?: string | null
          physical_examination?: string | null
          review_status?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          topic_ids?: string[] | null
          treatment_plan?: string | null
          updated_at?: string | null
        }
        Update: {
          age_group?: string
          author_credentials?: string | null
          case_source?: string | null
          case_title?: string
          case_type?: string
          chief_complaint?: string
          complexity_level?: number | null
          complications?: string[] | null
          created_at?: string | null
          diagnosis?: string | null
          differential_diagnoses?: string[] | null
          evidence_level?: string | null
          history_of_present_illness?: string | null
          id?: string
          imaging_results?: Json | null
          is_active?: boolean | null
          laboratory_results?: Json | null
          learning_points?: string[] | null
          metadata?: Json | null
          past_medical_history?: string | null
          physical_examination?: string | null
          review_status?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          topic_ids?: string[] | null
          treatment_plan?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      content_citations: {
        Row: {
          citation_id: string | null
          confidence_score: number | null
          content_id: string
          content_type: string
          context_description: string | null
          created_at: string | null
          id: string
          page_numbers: string | null
          quote_text: string | null
        }
        Insert: {
          citation_id?: string | null
          confidence_score?: number | null
          content_id: string
          content_type: string
          context_description?: string | null
          created_at?: string | null
          id?: string
          page_numbers?: string | null
          quote_text?: string | null
        }
        Update: {
          citation_id?: string | null
          confidence_score?: number | null
          content_id?: string
          content_type?: string
          context_description?: string | null
          created_at?: string | null
          id?: string
          page_numbers?: string | null
          quote_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_citations_citation_id_fkey"
            columns: ["citation_id"]
            isOneToOne: false
            referencedRelation: "citations"
            referencedColumns: ["id"]
          },
        ]
      }
      content_quality_metrics: {
        Row: {
          accuracy_score: number | null
          completeness_score: number | null
          content_id: string
          content_type: string
          created_at: string | null
          evidence_strength: string | null
          id: string
          last_reviewed: string | null
          review_notes: string | null
          reviewer_id: string | null
          updated_at: string | null
        }
        Insert: {
          accuracy_score?: number | null
          completeness_score?: number | null
          content_id: string
          content_type: string
          created_at?: string | null
          evidence_strength?: string | null
          id?: string
          last_reviewed?: string | null
          review_notes?: string | null
          reviewer_id?: string | null
          updated_at?: string | null
        }
        Update: {
          accuracy_score?: number | null
          completeness_score?: number | null
          content_id?: string
          content_type?: string
          created_at?: string | null
          evidence_strength?: string | null
          id?: string
          last_reviewed?: string | null
          review_notes?: string | null
          reviewer_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      diagnostic_workflows: {
        Row: {
          completed_at: string | null
          completed_steps: string[] | null
          confidence_scores: Json | null
          created_at: string | null
          current_step: number | null
          id: string
          query_id: number | null
          session_id: string | null
          step_data: Json | null
          total_steps: number | null
          updated_at: string | null
          workflow_type: string
        }
        Insert: {
          completed_at?: string | null
          completed_steps?: string[] | null
          confidence_scores?: Json | null
          created_at?: string | null
          current_step?: number | null
          id?: string
          query_id?: number | null
          session_id?: string | null
          step_data?: Json | null
          total_steps?: number | null
          updated_at?: string | null
          workflow_type?: string
        }
        Update: {
          completed_at?: string | null
          completed_steps?: string[] | null
          confidence_scores?: Json | null
          created_at?: string | null
          current_step?: number | null
          id?: string
          query_id?: number | null
          session_id?: string | null
          step_data?: Json | null
          total_steps?: number | null
          updated_at?: string | null
          workflow_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "diagnostic_workflows_query_id_fkey"
            columns: ["query_id"]
            isOneToOne: false
            referencedRelation: "queries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diagnostic_workflows_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "user_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      drug_names_lookup: {
        Row: {
          brand_name: string
          created_at: string
          drug_class: string | null
          generic_name: string
          id: number
          therapeutic_category: string | null
        }
        Insert: {
          brand_name: string
          created_at?: string
          drug_class?: string | null
          generic_name: string
          id?: number
          therapeutic_category?: string | null
        }
        Update: {
          brand_name?: string
          created_at?: string
          drug_class?: string | null
          generic_name?: string
          id?: number
          therapeutic_category?: string | null
        }
        Relationships: []
      }
      edge_functions: {
        Row: {
          alert_threshold_failures: number | null
          category: string | null
          created_at: string | null
          description: string | null
          expected_response_time_ms: number | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
          url: string
        }
        Insert: {
          alert_threshold_failures?: number | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          expected_response_time_ms?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
          url: string
        }
        Update: {
          alert_threshold_failures?: number | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          expected_response_time_ms?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
      evidence_grade_definitions: {
        Row: {
          color_hex: string | null
          created_at: string | null
          description: string
          grade_code: string
          grade_name: string
          id: string
          requirements: string[] | null
          sort_order: number | null
        }
        Insert: {
          color_hex?: string | null
          created_at?: string | null
          description: string
          grade_code: string
          grade_name: string
          id?: string
          requirements?: string[] | null
          sort_order?: number | null
        }
        Update: {
          color_hex?: string | null
          created_at?: string | null
          description?: string
          grade_code?: string
          grade_name?: string
          id?: string
          requirements?: string[] | null
          sort_order?: number | null
        }
        Relationships: []
      }
      evidence_grades: {
        Row: {
          age_groups_applicable: string[] | null
          applicability_score: number | null
          bias_risk: string | null
          citation_ids: string[] | null
          content_id: string | null
          content_type: string
          created_at: string | null
          evidence_level: string
          evidence_type: string | null
          id: string
          is_current: boolean | null
          last_reviewed: string | null
          limitations: string[] | null
          metadata: Json | null
          pediatric_specific: boolean | null
          quality_score: number | null
          review_notes: string | null
          reviewer_credentials: string | null
          sample_size: number | null
          strength_of_recommendation: string | null
          study_design: string | null
          updated_at: string | null
        }
        Insert: {
          age_groups_applicable?: string[] | null
          applicability_score?: number | null
          bias_risk?: string | null
          citation_ids?: string[] | null
          content_id?: string | null
          content_type: string
          created_at?: string | null
          evidence_level: string
          evidence_type?: string | null
          id?: string
          is_current?: boolean | null
          last_reviewed?: string | null
          limitations?: string[] | null
          metadata?: Json | null
          pediatric_specific?: boolean | null
          quality_score?: number | null
          review_notes?: string | null
          reviewer_credentials?: string | null
          sample_size?: number | null
          strength_of_recommendation?: string | null
          study_design?: string | null
          updated_at?: string | null
        }
        Update: {
          age_groups_applicable?: string[] | null
          applicability_score?: number | null
          bias_risk?: string | null
          citation_ids?: string[] | null
          content_id?: string | null
          content_type?: string
          created_at?: string | null
          evidence_level?: string
          evidence_type?: string | null
          id?: string
          is_current?: boolean | null
          last_reviewed?: string | null
          limitations?: string[] | null
          metadata?: Json | null
          pediatric_specific?: boolean | null
          quality_score?: number | null
          review_notes?: string | null
          reviewer_credentials?: string | null
          sample_size?: number | null
          strength_of_recommendation?: string | null
          study_design?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      function_checks: {
        Row: {
          checked_at: string | null
          created_at: string | null
          error_code: string | null
          error_message: string | null
          function_name: string
          function_url: string
          id: string
          response_time_ms: number | null
          status: string
        }
        Insert: {
          checked_at?: string | null
          created_at?: string | null
          error_code?: string | null
          error_message?: string | null
          function_name: string
          function_url: string
          id?: string
          response_time_ms?: number | null
          status: string
        }
        Update: {
          checked_at?: string | null
          created_at?: string | null
          error_code?: string | null
          error_message?: string | null
          function_name?: string
          function_url?: string
          id?: string
          response_time_ms?: number | null
          status?: string
        }
        Relationships: []
      }
      godzilla_medical_dataset: {
        Row: {
          age_groups: string | null
          book_title: string | null
          chapter_title: string | null
          chunk_token_count: number | null
          clinical_relevance_score: number | null
          confidence_score: number | null
          created_at: string | null
          id: string
          keywords: string | null
          learning_objectives: string | null
          medical_specialty: string | null
          page_number: number | null
          reading_difficulty: string | null
          source_dataset: string
          source_file: string | null
          text: string
        }
        Insert: {
          age_groups?: string | null
          book_title?: string | null
          chapter_title?: string | null
          chunk_token_count?: number | null
          clinical_relevance_score?: number | null
          confidence_score?: number | null
          created_at?: string | null
          id: string
          keywords?: string | null
          learning_objectives?: string | null
          medical_specialty?: string | null
          page_number?: number | null
          reading_difficulty?: string | null
          source_dataset: string
          source_file?: string | null
          text: string
        }
        Update: {
          age_groups?: string | null
          book_title?: string | null
          chapter_title?: string | null
          chunk_token_count?: number | null
          clinical_relevance_score?: number | null
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          keywords?: string | null
          learning_objectives?: string | null
          medical_specialty?: string | null
          page_number?: number | null
          reading_difficulty?: string | null
          source_dataset?: string
          source_file?: string | null
          text?: string
        }
        Relationships: []
      }
      learned_insights: {
        Row: {
          category: string | null
          confidence_score: number | null
          created_at: string
          id: string
          insight_text: string
          insight_type: string
          sample_size: number | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          confidence_score?: number | null
          created_at?: string
          id?: string
          insight_text: string
          insight_type: string
          sample_size?: number | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          confidence_score?: number | null
          created_at?: string
          id?: string
          insight_text?: string
          insight_type?: string
          sample_size?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      learning_analytics: {
        Row: {
          ai_assessment: Json | null
          comprehension_score: number | null
          content_id: string | null
          created_at: string | null
          difficulty_perceived: string | null
          id: string
          interaction_type: string
          metadata: Json | null
          time_spent_seconds: number | null
          topic_id: string | null
          user_feedback: Json | null
          user_session_id: string | null
        }
        Insert: {
          ai_assessment?: Json | null
          comprehension_score?: number | null
          content_id?: string | null
          created_at?: string | null
          difficulty_perceived?: string | null
          id?: string
          interaction_type: string
          metadata?: Json | null
          time_spent_seconds?: number | null
          topic_id?: string | null
          user_feedback?: Json | null
          user_session_id?: string | null
        }
        Update: {
          ai_assessment?: Json | null
          comprehension_score?: number | null
          content_id?: string | null
          created_at?: string | null
          difficulty_perceived?: string | null
          id?: string
          interaction_type?: string
          metadata?: Json | null
          time_spent_seconds?: number | null
          topic_id?: string | null
          user_feedback?: Json | null
          user_session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_analytics_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "pediatric_topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_analytics_user_session_id_fkey"
            columns: ["user_session_id"]
            isOneToOne: false
            referencedRelation: "user_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_progress: {
        Row: {
          case_attempts: number | null
          cases_completed: number | null
          created_at: string | null
          id: string
          last_accessed: string | null
          mastery_level: number | null
          quiz_attempts: number | null
          quiz_average_score: number | null
          quiz_best_score: number | null
          streak_days: number | null
          time_spent_minutes: number | null
          topic_id: string | null
          total_sessions: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          case_attempts?: number | null
          cases_completed?: number | null
          created_at?: string | null
          id?: string
          last_accessed?: string | null
          mastery_level?: number | null
          quiz_attempts?: number | null
          quiz_average_score?: number | null
          quiz_best_score?: number | null
          streak_days?: number | null
          time_spent_minutes?: number | null
          topic_id?: string | null
          total_sessions?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          case_attempts?: number | null
          cases_completed?: number | null
          created_at?: string | null
          id?: string
          last_accessed?: string | null
          mastery_level?: number | null
          quiz_attempts?: number | null
          quiz_average_score?: number | null
          quiz_best_score?: number | null
          streak_days?: number | null
          time_spent_minutes?: number | null
          topic_id?: string | null
          total_sessions?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_progress_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "pediatric_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_session_activities: {
        Row: {
          activity_data: Json | null
          activity_type: string
          completed: boolean | null
          created_at: string | null
          end_time: string | null
          id: string
          score: number | null
          session_id: string | null
          start_time: string | null
          time_spent_seconds: number | null
          topic_id: string | null
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          completed?: boolean | null
          created_at?: string | null
          end_time?: string | null
          id?: string
          score?: number | null
          session_id?: string | null
          start_time?: string | null
          time_spent_seconds?: number | null
          topic_id?: string | null
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          completed?: boolean | null
          created_at?: string | null
          end_time?: string | null
          id?: string
          score?: number | null
          session_id?: string | null
          start_time?: string | null
          time_spent_seconds?: number | null
          topic_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_session_activities_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "user_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_session_activities_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "pediatric_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_sessions: {
        Row: {
          achievements: string[] | null
          ai_recommendations: Json | null
          case_id: string | null
          completed_at: string | null
          confidence_score: number | null
          correct_answers: number | null
          created_at: string | null
          difficulty_level: number | null
          feedback_rating: number | null
          id: string
          learning_progress: Json | null
          next_recommended_topics: string[] | null
          notes: string | null
          query_text: string | null
          questions_answered: number | null
          response_summary: string | null
          session_metadata: Json | null
          session_type: string
          started_at: string | null
          time_spent: number | null
          topic_id: string | null
          user_id: string
        }
        Insert: {
          achievements?: string[] | null
          ai_recommendations?: Json | null
          case_id?: string | null
          completed_at?: string | null
          confidence_score?: number | null
          correct_answers?: number | null
          created_at?: string | null
          difficulty_level?: number | null
          feedback_rating?: number | null
          id?: string
          learning_progress?: Json | null
          next_recommended_topics?: string[] | null
          notes?: string | null
          query_text?: string | null
          questions_answered?: number | null
          response_summary?: string | null
          session_metadata?: Json | null
          session_type: string
          started_at?: string | null
          time_spent?: number | null
          topic_id?: string | null
          user_id: string
        }
        Update: {
          achievements?: string[] | null
          ai_recommendations?: Json | null
          case_id?: string | null
          completed_at?: string | null
          confidence_score?: number | null
          correct_answers?: number | null
          created_at?: string | null
          difficulty_level?: number | null
          feedback_rating?: number | null
          id?: string
          learning_progress?: Json | null
          next_recommended_topics?: string[] | null
          notes?: string | null
          query_text?: string | null
          questions_answered?: number | null
          response_summary?: string | null
          session_metadata?: Json | null
          session_type?: string
          started_at?: string | null
          time_spent?: number | null
          topic_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_sessions_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "clinical_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_sessions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "pediatric_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_chunks: {
        Row: {
          age_specific: boolean | null
          authors: string | null
          book_title: string | null
          chapter_title: string | null
          chunk_index: number | null
          chunk_summary: string | null
          chunk_text: string
          chunk_token_count: number | null
          chunk_type: string | null
          citation_ids: string[] | null
          confidence_score: number | null
          created_at: string | null
          edition: string | null
          embedding: string | null
          evidence_grade: string | null
          id: string
          isbn: string | null
          keywords: string | null
          page_number: number | null
          publisher: string | null
          section_heading_path: string | null
          section_title: string | null
          source_url: string | null
          topic_ids: string[] | null
          year: string | null
        }
        Insert: {
          age_specific?: boolean | null
          authors?: string | null
          book_title?: string | null
          chapter_title?: string | null
          chunk_index?: number | null
          chunk_summary?: string | null
          chunk_text: string
          chunk_token_count?: number | null
          chunk_type?: string | null
          citation_ids?: string[] | null
          confidence_score?: number | null
          created_at?: string | null
          edition?: string | null
          embedding?: string | null
          evidence_grade?: string | null
          id: string
          isbn?: string | null
          keywords?: string | null
          page_number?: number | null
          publisher?: string | null
          section_heading_path?: string | null
          section_title?: string | null
          source_url?: string | null
          topic_ids?: string[] | null
          year?: string | null
        }
        Update: {
          age_specific?: boolean | null
          authors?: string | null
          book_title?: string | null
          chapter_title?: string | null
          chunk_index?: number | null
          chunk_summary?: string | null
          chunk_text?: string
          chunk_token_count?: number | null
          chunk_type?: string | null
          citation_ids?: string[] | null
          confidence_score?: number | null
          created_at?: string | null
          edition?: string | null
          embedding?: string | null
          evidence_grade?: string | null
          id?: string
          isbn?: string | null
          keywords?: string | null
          page_number?: number | null
          publisher?: string | null
          section_heading_path?: string | null
          section_title?: string | null
          source_url?: string | null
          topic_ids?: string[] | null
          year?: string | null
        }
        Relationships: []
      }
      medical_chunks_raw: {
        Row: {
          authors: string | null
          book_title: string | null
          chapter_title: string | null
          chunk_index: string | null
          chunk_summary: string | null
          chunk_text: string | null
          chunk_token_count: string | null
          confidence_score: string | null
          created_at: string | null
          drive_link: string | null
          edition: string | null
          id: string | null
          isbn: string | null
          keywords: string | null
          page_number: string | null
          publisher: string | null
          section_heading_path: string | null
          section_title: string | null
          source_url: string | null
          year: string | null
        }
        Insert: {
          authors?: string | null
          book_title?: string | null
          chapter_title?: string | null
          chunk_index?: string | null
          chunk_summary?: string | null
          chunk_text?: string | null
          chunk_token_count?: string | null
          confidence_score?: string | null
          created_at?: string | null
          drive_link?: string | null
          edition?: string | null
          id?: string | null
          isbn?: string | null
          keywords?: string | null
          page_number?: string | null
          publisher?: string | null
          section_heading_path?: string | null
          section_title?: string | null
          source_url?: string | null
          year?: string | null
        }
        Update: {
          authors?: string | null
          book_title?: string | null
          chapter_title?: string | null
          chunk_index?: string | null
          chunk_summary?: string | null
          chunk_text?: string | null
          chunk_token_count?: string | null
          confidence_score?: string | null
          created_at?: string | null
          drive_link?: string | null
          edition?: string | null
          id?: string | null
          isbn?: string | null
          keywords?: string | null
          page_number?: string | null
          publisher?: string | null
          section_heading_path?: string | null
          section_title?: string | null
          source_url?: string | null
          year?: string | null
        }
        Relationships: []
      }
      medical_classifications: {
        Row: {
          auto_classified: boolean | null
          classification_confidence: number | null
          complexity_score: number | null
          created_at: string | null
          id: string
          medical_specialty: string | null
          query_id: number | null
          reviewed_by: string | null
          urgency_level: string
        }
        Insert: {
          auto_classified?: boolean | null
          classification_confidence?: number | null
          complexity_score?: number | null
          created_at?: string | null
          id?: string
          medical_specialty?: string | null
          query_id?: number | null
          reviewed_by?: string | null
          urgency_level: string
        }
        Update: {
          auto_classified?: boolean | null
          classification_confidence?: number | null
          complexity_score?: number | null
          created_at?: string | null
          id?: string
          medical_specialty?: string | null
          query_id?: number | null
          reviewed_by?: string | null
          urgency_level?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_classifications_query_id_fkey"
            columns: ["query_id"]
            isOneToOne: false
            referencedRelation: "queries"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_context_summary: {
        Row: {
          allergies_mentioned: string[] | null
          created_at: string | null
          id: string
          key_symptoms: string[] | null
          medications_mentioned: string[] | null
          previous_diagnoses: string[] | null
          session_id: string | null
          summary_confidence: number | null
          summary_text: string
          updated_at: string | null
        }
        Insert: {
          allergies_mentioned?: string[] | null
          created_at?: string | null
          id?: string
          key_symptoms?: string[] | null
          medications_mentioned?: string[] | null
          previous_diagnoses?: string[] | null
          session_id?: string | null
          summary_confidence?: number | null
          summary_text: string
          updated_at?: string | null
        }
        Update: {
          allergies_mentioned?: string[] | null
          created_at?: string | null
          id?: string
          key_symptoms?: string[] | null
          medications_mentioned?: string[] | null
          previous_diagnoses?: string[] | null
          session_id?: string | null
          summary_confidence?: number | null
          summary_text?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_context_summary_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "user_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_embeddings: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          embedding: string | null
          full_text: string | null
          id: number
          keywords: string | null
          medical_specialty: string | null
          record_id: string
          source_dataset: string | null
          text_preview: string | null
          updated_at: string | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          embedding?: string | null
          full_text?: string | null
          id?: never
          keywords?: string | null
          medical_specialty?: string | null
          record_id: string
          source_dataset?: string | null
          text_preview?: string | null
          updated_at?: string | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          embedding?: string | null
          full_text?: string | null
          id?: never
          keywords?: string | null
          medical_specialty?: string | null
          record_id?: string
          source_dataset?: string | null
          text_preview?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      medical_entities: {
        Row: {
          chunk_id: string | null
          end_offset: number | null
          entity: string
          entity_type: string | null
          id: number
          start_offset: number | null
        }
        Insert: {
          chunk_id?: string | null
          end_offset?: number | null
          entity: string
          entity_type?: string | null
          id?: number
          start_offset?: number | null
        }
        Update: {
          chunk_id?: string | null
          end_offset?: number | null
          entity?: string
          entity_type?: string | null
          id?: number
          start_offset?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_entities_chunk_id_fkey"
            columns: ["chunk_id"]
            isOneToOne: false
            referencedRelation: "medical_chunks"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_queries: {
        Row: {
          age_group: string | null
          created_at: string
          id: string
          keywords: string[] | null
          medical_category: string | null
          message_id: string
          query_type: string
          urgency_level: string | null
        }
        Insert: {
          age_group?: string | null
          created_at?: string
          id?: string
          keywords?: string[] | null
          medical_category?: string | null
          message_id: string
          query_type: string
          urgency_level?: string | null
        }
        Update: {
          age_group?: string | null
          created_at?: string
          id?: string
          keywords?: string[] | null
          medical_category?: string | null
          message_id?: string
          query_type?: string
          urgency_level?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_queries_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      memories: {
        Row: {
          agent_id: string | null
          content: string
          created_at: string | null
          embedding: string | null
          id: string
          metadata: Json | null
        }
        Insert: {
          agent_id?: string | null
          content: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
        }
        Update: {
          agent_id?: string | null
          content?: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "memories_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          confidence_score: number | null
          content: string
          conversation_id: string
          created_at: string
          id: string
          sources: string[] | null
          type: string
        }
        Insert: {
          confidence_score?: number | null
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          sources?: string[] | null
          type: string
        }
        Update: {
          confidence_score?: number | null
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          sources?: string[] | null
          type?: string
        }
        Relationships: []
      }
      objective_chat_history: {
        Row: {
          content: string
          created_at: string | null
          id: string
          metadata: Json | null
          objective_id: string | null
          role: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          objective_id?: string | null
          role: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          objective_id?: string | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "objective_chat_history_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      objective_embeddings: {
        Row: {
          created_at: string | null
          embedding: string | null
          id: string
          key_learnings: string[] | null
          metadata: Json | null
          objective_description: string | null
          objective_id: string | null
          objective_title: string
          summary_text: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          embedding?: string | null
          id?: string
          key_learnings?: string[] | null
          metadata?: Json | null
          objective_description?: string | null
          objective_id?: string | null
          objective_title: string
          summary_text: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          embedding?: string | null
          id?: string
          key_learnings?: string[] | null
          metadata?: Json | null
          objective_description?: string | null
          objective_id?: string | null
          objective_title?: string
          summary_text?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objective_embeddings_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      objective_evaluations: {
        Row: {
          adjustments_made: Json | null
          confidence_score: number | null
          created_at: string | null
          evaluation_type: string
          id: string
          objective_id: string | null
          recommendations: Json | null
        }
        Insert: {
          adjustments_made?: Json | null
          confidence_score?: number | null
          created_at?: string | null
          evaluation_type: string
          id?: string
          objective_id?: string | null
          recommendations?: Json | null
        }
        Update: {
          adjustments_made?: Json | null
          confidence_score?: number | null
          created_at?: string | null
          evaluation_type?: string
          id?: string
          objective_id?: string | null
          recommendations?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "objective_evaluations_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      objective_reflections: {
        Row: {
          completed_tasks: number
          created_at: string
          id: string
          insights: string | null
          objective_id: string
          objective_title: string
          recommendations: string | null
          total_tasks: number
          total_time_ms: number | null
          what_didnt_work: string | null
          what_worked: string | null
        }
        Insert: {
          completed_tasks?: number
          created_at?: string
          id?: string
          insights?: string | null
          objective_id: string
          objective_title: string
          recommendations?: string | null
          total_tasks?: number
          total_time_ms?: number | null
          what_didnt_work?: string | null
          what_worked?: string | null
        }
        Update: {
          completed_tasks?: number
          created_at?: string
          id?: string
          insights?: string | null
          objective_id?: string
          objective_title?: string
          recommendations?: string | null
          total_tasks?: number
          total_time_ms?: number | null
          what_didnt_work?: string | null
          what_worked?: string | null
        }
        Relationships: []
      }
      pediatric_drug_dosages: {
        Row: {
          age_group: string | null
          confidence: number | null
          created_at: string
          dosage_text: string
          dose_normalized_unit: string | null
          dose_normalized_value: string | null
          dose_type: string | null
          dose_unit: string
          dose_value: string
          drug_name: string
          duration: string | null
          file_id: string
          frequency: string | null
          generic_name: string
          id: number
          indication: string | null
          line_number: number
          max_dose_text: string | null
          notes: string | null
          route: string | null
          safety_flag: boolean | null
          updated_at: string
          verification_source: string
          verified: boolean | null
        }
        Insert: {
          age_group?: string | null
          confidence?: number | null
          created_at?: string
          dosage_text: string
          dose_normalized_unit?: string | null
          dose_normalized_value?: string | null
          dose_type?: string | null
          dose_unit: string
          dose_value: string
          drug_name: string
          duration?: string | null
          file_id: string
          frequency?: string | null
          generic_name: string
          id?: number
          indication?: string | null
          line_number: number
          max_dose_text?: string | null
          notes?: string | null
          route?: string | null
          safety_flag?: boolean | null
          updated_at?: string
          verification_source: string
          verified?: boolean | null
        }
        Update: {
          age_group?: string | null
          confidence?: number | null
          created_at?: string
          dosage_text?: string
          dose_normalized_unit?: string | null
          dose_normalized_value?: string | null
          dose_type?: string | null
          dose_unit?: string
          dose_value?: string
          drug_name?: string
          duration?: string | null
          file_id?: string
          frequency?: string | null
          generic_name?: string
          id?: number
          indication?: string | null
          line_number?: number
          max_dose_text?: string | null
          notes?: string | null
          route?: string | null
          safety_flag?: boolean | null
          updated_at?: string
          verification_source?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      pediatric_drugs: {
        Row: {
          Class: string | null
          Contraindications: string | null
          Dosage_Form: string | null
          Drug: string
          Frequency: string | null
          Indication: string | null
          Major_Side_Effects: string | null
          Max_Dose: string | null
          Pediatric_Dose: string | null
          Route: string | null
          Special_Notes: string | null
          System: string
        }
        Insert: {
          Class?: string | null
          Contraindications?: string | null
          Dosage_Form?: string | null
          Drug: string
          Frequency?: string | null
          Indication?: string | null
          Major_Side_Effects?: string | null
          Max_Dose?: string | null
          Pediatric_Dose?: string | null
          Route?: string | null
          Special_Notes?: string | null
          System: string
        }
        Update: {
          Class?: string | null
          Contraindications?: string | null
          Dosage_Form?: string | null
          Drug?: string
          Frequency?: string | null
          Indication?: string | null
          Major_Side_Effects?: string | null
          Max_Dose?: string | null
          Pediatric_Dose?: string | null
          Route?: string | null
          Special_Notes?: string | null
          System?: string
        }
        Relationships: []
      }
      pediatric_topics: {
        Row: {
          age_groups: string[] | null
          created_at: string | null
          description: string | null
          difficulty_level: string | null
          estimated_study_time_minutes: number | null
          id: string
          is_core_topic: boolean | null
          keywords: string[] | null
          learning_objectives: string[] | null
          medical_specialties: string[] | null
          metadata: Json | null
          parent_topic_id: string | null
          prerequisites: string[] | null
          status: string | null
          topic_code: string
          topic_name: string
          updated_at: string | null
        }
        Insert: {
          age_groups?: string[] | null
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          estimated_study_time_minutes?: number | null
          id?: string
          is_core_topic?: boolean | null
          keywords?: string[] | null
          learning_objectives?: string[] | null
          medical_specialties?: string[] | null
          metadata?: Json | null
          parent_topic_id?: string | null
          prerequisites?: string[] | null
          status?: string | null
          topic_code: string
          topic_name: string
          updated_at?: string | null
        }
        Update: {
          age_groups?: string[] | null
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          estimated_study_time_minutes?: number | null
          id?: string
          is_core_topic?: boolean | null
          keywords?: string[] | null
          learning_objectives?: string[] | null
          medical_specialties?: string[] | null
          metadata?: Json | null
          parent_topic_id?: string | null
          prerequisites?: string[] | null
          status?: string | null
          topic_code?: string
          topic_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pediatric_topics_parent_topic_id_fkey"
            columns: ["parent_topic_id"]
            isOneToOne: false
            referencedRelation: "pediatric_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_predictions: {
        Row: {
          confidence_score: number | null
          created_at: string
          id: string
          objective_id: string
          predicted_completion_time: number | null
          recommended_optimizations: Json | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          id?: string
          objective_id: string
          predicted_completion_time?: number | null
          recommended_optimizations?: Json | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          id?: string
          objective_id?: string
          predicted_completion_time?: number | null
          recommended_optimizations?: Json | null
        }
        Relationships: []
      }
      plugins: {
        Row: {
          category: string
          config: Json | null
          created_at: string | null
          description: string | null
          enabled: boolean | null
          id: string
          name: string
          version: string
        }
        Insert: {
          category: string
          config?: Json | null
          created_at?: string | null
          description?: string | null
          enabled?: boolean | null
          id?: string
          name: string
          version: string
        }
        Update: {
          category?: string
          config?: Json | null
          created_at?: string | null
          description?: string | null
          enabled?: boolean | null
          id?: string
          name?: string
          version?: string
        }
        Relationships: []
      }
      project_files: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          language: string | null
          name: string
          path: string
          project_id: string | null
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          language?: string | null
          name: string
          path: string
          project_id?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          language?: string | null
          name?: string
          path?: string
          project_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      queries: {
        Row: {
          answer: string | null
          citations: string[] | null
          complexity_score: number | null
          confidence: number | null
          context_chunks: Json | null
          created_at: string | null
          diagnostic_stage: string | null
          differential_diagnoses: Json | null
          id: number
          latency_ms: number | null
          medical_specialty: string | null
          meta: Json | null
          model: string | null
          reasoning_steps: Json | null
          retrieval_method: string | null
          safety_flags: string[] | null
          session_id: string | null
          token_count: number | null
          urgency_level: string | null
          user_question: string
        }
        Insert: {
          answer?: string | null
          citations?: string[] | null
          complexity_score?: number | null
          confidence?: number | null
          context_chunks?: Json | null
          created_at?: string | null
          diagnostic_stage?: string | null
          differential_diagnoses?: Json | null
          id?: number
          latency_ms?: number | null
          medical_specialty?: string | null
          meta?: Json | null
          model?: string | null
          reasoning_steps?: Json | null
          retrieval_method?: string | null
          safety_flags?: string[] | null
          session_id?: string | null
          token_count?: number | null
          urgency_level?: string | null
          user_question: string
        }
        Update: {
          answer?: string | null
          citations?: string[] | null
          complexity_score?: number | null
          confidence?: number | null
          context_chunks?: Json | null
          created_at?: string | null
          diagnostic_stage?: string | null
          differential_diagnoses?: Json | null
          id?: number
          latency_ms?: number | null
          medical_specialty?: string | null
          meta?: Json | null
          model?: string | null
          reasoning_steps?: Json | null
          retrieval_method?: string | null
          safety_flags?: string[] | null
          session_id?: string | null
          token_count?: number | null
          urgency_level?: string | null
          user_question?: string
        }
        Relationships: [
          {
            foreignKeyName: "queries_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "user_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      routes_lookup: {
        Row: {
          description: string | null
          id: number
          is_active: boolean | null
          route_code: string
          route_name: string
        }
        Insert: {
          description?: string | null
          id?: number
          is_active?: boolean | null
          route_code: string
          route_name: string
        }
        Update: {
          description?: string | null
          id?: number
          is_active?: boolean | null
          route_code?: string
          route_name?: string
        }
        Relationships: []
      }
      safety_alerts: {
        Row: {
          acknowledged: boolean | null
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_message: string
          alert_type: string
          created_at: string | null
          id: string
          query_id: number | null
          session_id: string | null
          severity_score: number | null
          triggered_keywords: string[] | null
        }
        Insert: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_message: string
          alert_type: string
          created_at?: string | null
          id?: string
          query_id?: number | null
          session_id?: string | null
          severity_score?: number | null
          triggered_keywords?: string[] | null
        }
        Update: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_message?: string
          alert_type?: string
          created_at?: string | null
          id?: string
          query_id?: number | null
          session_id?: string | null
          severity_score?: number | null
          triggered_keywords?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "safety_alerts_query_id_fkey"
            columns: ["query_id"]
            isOneToOne: false
            referencedRelation: "queries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "safety_alerts_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "user_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_objectives: {
        Row: {
          id: string
          objective_description: string | null
          objective_id: string
          objective_title: string
          shared_at: string
          shared_by: string
          status: string
          tasks: Json | null
          team_id: string
        }
        Insert: {
          id?: string
          objective_description?: string | null
          objective_id: string
          objective_title: string
          shared_at?: string
          shared_by: string
          status?: string
          tasks?: Json | null
          team_id: string
        }
        Update: {
          id?: string
          objective_description?: string | null
          objective_id?: string
          objective_title?: string
          shared_at?: string
          shared_by?: string
          status?: string
          tasks?: Json | null
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_objectives_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      system_config: {
        Row: {
          config_key: string
          config_value: Json
          created_at: string | null
          description: string | null
          id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          config_key: string
          config_value: Json
          created_at?: string | null
          description?: string | null
          id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          config_key?: string
          config_value?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      task_execution_history: {
        Row: {
          actual_time_ms: number | null
          category: string | null
          completed_at: string
          estimated_time: string | null
          id: string
          objective_id: string
          priority: number | null
          task_id: string
          task_title: string
        }
        Insert: {
          actual_time_ms?: number | null
          category?: string | null
          completed_at?: string
          estimated_time?: string | null
          id?: string
          objective_id: string
          priority?: number | null
          task_id: string
          task_title: string
        }
        Update: {
          actual_time_ms?: number | null
          category?: string | null
          completed_at?: string
          estimated_time?: string | null
          id?: string
          objective_id?: string
          priority?: number | null
          task_id?: string
          task_title?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          agent_id: string | null
          completed_at: string | null
          created_at: string | null
          description: string
          error: string | null
          id: string
          metadata: Json | null
          priority: number
          result: string | null
          started_at: string | null
          status: string
        }
        Insert: {
          agent_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          description: string
          error?: string | null
          id?: string
          metadata?: Json | null
          priority?: number
          result?: string | null
          started_at?: string | null
          status?: string
        }
        Update: {
          agent_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string
          error?: string | null
          id?: string
          metadata?: Json | null
          priority?: number
          result?: string | null
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          id: string
          joined_at: string
          role: string
          team_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          role?: string
          team_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          role?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          auto_archive_days: number | null
          created_at: string
          font_size: number | null
          id: string
          notifications_enabled: boolean | null
          preferred_specialties: string[] | null
          theme: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_archive_days?: number | null
          created_at?: string
          font_size?: number | null
          id?: string
          notifications_enabled?: boolean | null
          preferred_specialties?: string[] | null
          theme?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_archive_days?: number | null
          created_at?: string
          font_size?: number | null
          id?: string
          notifications_enabled?: boolean | null
          preferred_specialties?: string[] | null
          theme?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          case_completions: number | null
          created_at: string | null
          id: string
          improvement_areas: string[] | null
          last_interaction: string | null
          mastery_level: string | null
          metadata: Json | null
          progress_percentage: number | null
          quiz_scores: Json | null
          strength_areas: string[] | null
          time_invested_minutes: number | null
          topic_id: string | null
          updated_at: string | null
          user_sub: string
        }
        Insert: {
          case_completions?: number | null
          created_at?: string | null
          id?: string
          improvement_areas?: string[] | null
          last_interaction?: string | null
          mastery_level?: string | null
          metadata?: Json | null
          progress_percentage?: number | null
          quiz_scores?: Json | null
          strength_areas?: string[] | null
          time_invested_minutes?: number | null
          topic_id?: string | null
          updated_at?: string | null
          user_sub: string
        }
        Update: {
          case_completions?: number | null
          created_at?: string | null
          id?: string
          improvement_areas?: string[] | null
          last_interaction?: string | null
          mastery_level?: string | null
          metadata?: Json | null
          progress_percentage?: number | null
          quiz_scores?: Json | null
          strength_areas?: string[] | null
          time_invested_minutes?: number | null
          topic_id?: string | null
          updated_at?: string | null
          user_sub?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "pediatric_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          granted_at: string | null
          granted_by: string | null
          id: string
          metadata: Json | null
          role: string
          user_id: string
        }
        Insert: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          metadata?: Json | null
          role: string
          user_id: string
        }
        Update: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          metadata?: Json | null
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          ai_mode: string | null
          context_window: Json | null
          conversation_state: string | null
          ended_at: string | null
          id: string
          learning_mode: string | null
          medical_context: Json | null
          meta: Json | null
          patient_context: Json | null
          risk_level: string | null
          session_type: string | null
          specialty_focus: string | null
          started_at: string | null
          topic_progress: Json | null
          user_sub: string
        }
        Insert: {
          ai_mode?: string | null
          context_window?: Json | null
          conversation_state?: string | null
          ended_at?: string | null
          id?: string
          learning_mode?: string | null
          medical_context?: Json | null
          meta?: Json | null
          patient_context?: Json | null
          risk_level?: string | null
          session_type?: string | null
          specialty_focus?: string | null
          started_at?: string | null
          topic_progress?: Json | null
          user_sub: string
        }
        Update: {
          ai_mode?: string | null
          context_window?: Json | null
          conversation_state?: string | null
          ended_at?: string | null
          id?: string
          learning_mode?: string | null
          medical_context?: Json | null
          meta?: Json | null
          patient_context?: Json | null
          risk_level?: string | null
          session_type?: string | null
          specialty_focus?: string | null
          started_at?: string | null
          topic_progress?: Json | null
          user_sub?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          institution: string | null
          is_active: boolean | null
          last_login: string | null
          role: string | null
          specialty_col: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          institution?: string | null
          is_active?: boolean | null
          last_login?: string | null
          role?: string | null
          specialty_col?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          institution?: string | null
          is_active?: boolean | null
          last_login?: string | null
          role?: string | null
          specialty_col?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      emergency_medications: {
        Row: {
          age_group: string | null
          confidence: number | null
          created_at: string | null
          dosage_text: string | null
          dose_normalized_unit: string | null
          dose_normalized_value: string | null
          dose_type: string | null
          dose_unit: string | null
          dose_value: string | null
          drug_name: string | null
          duration: string | null
          file_id: string | null
          frequency: string | null
          generic_name: string | null
          id: number | null
          indication: string | null
          line_number: number | null
          max_dose_text: string | null
          notes: string | null
          route: string | null
          safety_flag: boolean | null
          updated_at: string | null
          verification_source: string | null
          verified: boolean | null
        }
        Insert: {
          age_group?: string | null
          confidence?: number | null
          created_at?: string | null
          dosage_text?: string | null
          dose_normalized_unit?: string | null
          dose_normalized_value?: string | null
          dose_type?: string | null
          dose_unit?: string | null
          dose_value?: string | null
          drug_name?: string | null
          duration?: string | null
          file_id?: string | null
          frequency?: string | null
          generic_name?: string | null
          id?: number | null
          indication?: string | null
          line_number?: number | null
          max_dose_text?: string | null
          notes?: string | null
          route?: string | null
          safety_flag?: boolean | null
          updated_at?: string | null
          verification_source?: string | null
          verified?: boolean | null
        }
        Update: {
          age_group?: string | null
          confidence?: number | null
          created_at?: string | null
          dosage_text?: string | null
          dose_normalized_unit?: string | null
          dose_normalized_value?: string | null
          dose_type?: string | null
          dose_unit?: string | null
          dose_value?: string | null
          drug_name?: string | null
          duration?: string | null
          file_id?: string | null
          frequency?: string | null
          generic_name?: string | null
          id?: number | null
          indication?: string | null
          line_number?: number | null
          max_dose_text?: string | null
          notes?: string | null
          route?: string | null
          safety_flag?: boolean | null
          updated_at?: string | null
          verification_source?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      safety_review_required: {
        Row: {
          age_group: string | null
          confidence: number | null
          created_at: string | null
          dosage_text: string | null
          dose_unit: string | null
          dose_value: string | null
          drug_name: string | null
          file_id: string | null
          generic_name: string | null
          id: number | null
          line_number: number | null
          notes: string | null
          route: string | null
        }
        Insert: {
          age_group?: string | null
          confidence?: number | null
          created_at?: string | null
          dosage_text?: string | null
          dose_unit?: string | null
          dose_value?: string | null
          drug_name?: string | null
          file_id?: string | null
          generic_name?: string | null
          id?: number | null
          line_number?: number | null
          notes?: string | null
          route?: string | null
        }
        Update: {
          age_group?: string | null
          confidence?: number | null
          created_at?: string | null
          dosage_text?: string | null
          dose_unit?: string | null
          dose_value?: string | null
          drug_name?: string | null
          file_id?: string | null
          generic_name?: string | null
          id?: number | null
          line_number?: number | null
          notes?: string | null
          route?: string | null
        }
        Relationships: []
      }
      verified_dosages: {
        Row: {
          age_group: string | null
          confidence: number | null
          dosage_text: string | null
          dose_type: string | null
          dose_unit: string | null
          dose_value: string | null
          drug_name: string | null
          file_id: string | null
          frequency: string | null
          generic_name: string | null
          id: number | null
          indication: string | null
          line_number: number | null
          max_dose_text: string | null
          route: string | null
          safety_flag: boolean | null
        }
        Insert: {
          age_group?: string | null
          confidence?: number | null
          dosage_text?: string | null
          dose_type?: string | null
          dose_unit?: string | null
          dose_value?: string | null
          drug_name?: string | null
          file_id?: string | null
          frequency?: string | null
          generic_name?: string | null
          id?: number | null
          indication?: string | null
          line_number?: number | null
          max_dose_text?: string | null
          route?: string | null
          safety_flag?: boolean | null
        }
        Update: {
          age_group?: string | null
          confidence?: number | null
          dosage_text?: string | null
          dose_type?: string | null
          dose_unit?: string | null
          dose_value?: string | null
          drug_name?: string | null
          file_id?: string | null
          frequency?: string | null
          generic_name?: string | null
          id?: number | null
          indication?: string | null
          line_number?: number | null
          max_dose_text?: string | null
          route?: string | null
          safety_flag?: boolean | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: { Args: { _role: string; _user_id: string }; Returns: boolean }
      import_drug_dosage_csv: {
        Args: {
          p_age_group: string
          p_confidence: number
          p_dosage_text: string
          p_dose_normalized_unit: string
          p_dose_normalized_value: string
          p_dose_type: string
          p_dose_unit: string
          p_dose_value: string
          p_drug_name: string
          p_duration: string
          p_file_id: string
          p_frequency: string
          p_generic_name: string
          p_indication: string
          p_line_number: number
          p_max_dose_text: string
          p_notes: string
          p_route: string
          p_safety_flag: boolean
          p_verification_source: string
          p_verified: boolean
        }
        Returns: number
      }
      match_medical_chunks: {
        Args: {
          keywords?: string
          match_count?: number
          query_embedding: string
        }
        Returns: {
          book_title: string
          chapter_title: string
          chunk_text: string
          id: string
          page_number: number
          section_title: string
          similarity: number
          source_url: string
        }[]
      }
      search_drugs: {
        Args: { search_term: string }
        Returns: {
          age_group: string
          confidence: number
          dosage_text: string
          drug_name: string
          generic_name: string
          id: number
          indication: string
          rank: number
          route: string
        }[]
      }
      search_similar_objectives: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          id: string
          key_learnings: string[]
          objective_id: string
          objective_title: string
          similarity: number
          summary_text: string
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
