export type Json =
  | string
  | number
  | boolean
  | null
  | {
      [key: string]: Json | undefined;
    }
  | Json[];

export type InvestoAssetClass =
  | "equity"
  | "etf"
  | "mutual_fund"
  | "bond"
  | "treasury"
  | "commodity"
  | "cash"
  | "real_asset"
  | "private_asset";

export type InvestoOpportunityStage =
  | "discovered"
  | "screening"
  | "research"
  | "valuation"
  | "watch"
  | "buy_zone"
  | "owned"
  | "rejected"
  | "archived";

export type InvestoAction =
  | "watch"
  | "research"
  | "buy"
  | "add"
  | "hold"
  | "trim"
  | "sell"
  | "rebalance"
  | "reject";

export type InvestoConviction = "low" | "moderate" | "high" | "exceptional";

export type InvestoDecisionStatus =
  "prepared" | "approved" | "declined" | "executed" | "expired" | "cancelled";

type ResearchReportRow = {
  id: string;
  user_id: string;
  symbol: string;
  report_type: string;
  title: string;
  executive_summary: string | null;
  business_description: string | null;
  moat_analysis: string | null;
  management_analysis: string | null;
  capital_allocation_analysis: string | null;
  financial_strength_analysis: string | null;
  valuation_analysis: string | null;
  downside_analysis: string | null;
  catalysts: Json;
  risks: Json;
  evidence: Json;
  business_quality_score: number | null;
  moat_score: number | null;
  balance_sheet_score: number | null;
  management_score: number | null;
  capital_allocation_score: number | null;
  valuation_score: number | null;
  shovel_score: number | null;
  overall_score: number | null;
  data_as_of: string | null;
  created_at: string;
  updated_at: string;
};

type WatchlistRow = {
  id: string;
  user_id: string;
  symbol: string;
  company_name: string | null;
  asset_class: InvestoAssetClass;
  stage: InvestoOpportunityStage;
  priority: number;
  investment_theme: string | null;
  shovel_category: string | null;
  discovery_reason: string | null;
  research_notes: string | null;
  target_entry_price: number | null;
  strong_buy_price: number | null;
  fair_value: number | null;
  reject_above_price: number | null;
  desired_weight: number | null;
  next_review_at: string | null;
  created_at: string;
  updated_at: string;
};

type RecommendationRow = {
  id: string;
  user_id: string;
  portfolio_id: string | null;
  research_report_id: string | null;
  valuation_id: string | null;
  symbol: string;
  action: InvestoAction;
  conviction: InvestoConviction;
  priority: number;
  current_price: number | null;
  recommended_price: number | null;
  recommended_quantity: number | null;
  recommended_weight: number | null;
  rationale: string;
  key_risks: Json;
  thesis_break_conditions: Json;
  supporting_evidence: Json;
  requires_human_approval: boolean;
  data_as_of: string | null;
  expires_at: string | null;
  created_at: string;
};

type DecisionRow = {
  id: string;
  user_id: string;
  recommendation_id: string | null;
  symbol: string;
  action: InvestoAction;
  status: InvestoDecisionStatus;
  requested_quantity: number | null;
  approved_quantity: number | null;
  requested_price: number | null;
  approved_price: number | null;
  decision_note: string | null;
  approved_at: string | null;
  executed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type InvestoDatabase = {
  public: {
    Tables: {
      investo_research_reports: {
        Row: ResearchReportRow;
        Insert: {
          id?: string;
          user_id: string;
          symbol: string;
          report_type: string;
          title: string;
          executive_summary?: string | null;
          business_description?: string | null;
          moat_analysis?: string | null;
          management_analysis?: string | null;
          capital_allocation_analysis?: string | null;
          financial_strength_analysis?: string | null;
          valuation_analysis?: string | null;
          downside_analysis?: string | null;
          catalysts?: Json;
          risks?: Json;
          evidence?: Json;
          business_quality_score?: number | null;
          moat_score?: number | null;
          balance_sheet_score?: number | null;
          management_score?: number | null;
          capital_allocation_score?: number | null;
          valuation_score?: number | null;
          shovel_score?: number | null;
          overall_score?: number | null;
          data_as_of?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          InvestoDatabase["public"]["Tables"]["investo_research_reports"]["Insert"]
        >;
        Relationships: [];
      };

      investo_watchlist: {
        Row: WatchlistRow;
        Insert: {
          id?: string;
          user_id: string;
          symbol: string;
          company_name?: string | null;
          asset_class?: InvestoAssetClass;
          stage?: InvestoOpportunityStage;
          priority?: number;
          investment_theme?: string | null;
          shovel_category?: string | null;
          discovery_reason?: string | null;
          research_notes?: string | null;
          target_entry_price?: number | null;
          strong_buy_price?: number | null;
          fair_value?: number | null;
          reject_above_price?: number | null;
          desired_weight?: number | null;
          next_review_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          InvestoDatabase["public"]["Tables"]["investo_watchlist"]["Insert"]
        >;
        Relationships: [];
      };

      investo_recommendations: {
        Row: RecommendationRow;
        Insert: {
          id?: string;
          user_id: string;
          portfolio_id?: string | null;
          research_report_id?: string | null;
          valuation_id?: string | null;
          symbol: string;
          action: InvestoAction;
          conviction: InvestoConviction;
          priority?: number;
          current_price?: number | null;
          recommended_price?: number | null;
          recommended_quantity?: number | null;
          recommended_weight?: number | null;
          rationale: string;
          key_risks?: Json;
          thesis_break_conditions?: Json;
          supporting_evidence?: Json;
          requires_human_approval?: boolean;
          data_as_of?: string | null;
          expires_at?: string | null;
          created_at?: string;
        };
        Update: Partial<
          InvestoDatabase["public"]["Tables"]["investo_recommendations"]["Insert"]
        >;
        Relationships: [];
      };

      investo_decisions: {
        Row: DecisionRow;
        Insert: {
          id?: string;
          user_id: string;
          recommendation_id?: string | null;
          symbol: string;
          action: InvestoAction;
          status?: InvestoDecisionStatus;
          requested_quantity?: number | null;
          approved_quantity?: number | null;
          requested_price?: number | null;
          approved_price?: number | null;
          decision_note?: string | null;
          approved_at?: string | null;
          executed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          InvestoDatabase["public"]["Tables"]["investo_decisions"]["Insert"]
        >;
        Relationships: [];
      };
    };

    Views: Record<string, never>;
    Functions: Record<string, never>;

    Enums: {
      investo_asset_class: InvestoAssetClass;
      investo_opportunity_stage: InvestoOpportunityStage;
      investo_action: InvestoAction;
      investo_conviction: InvestoConviction;
      investo_decision_status: InvestoDecisionStatus;
    };

    CompositeTypes: Record<string, never>;
  };
};

export type InvestoResearchReport =
  InvestoDatabase["public"]["Tables"]["investo_research_reports"]["Row"];

export type InvestoResearchReportInsert =
  InvestoDatabase["public"]["Tables"]["investo_research_reports"]["Insert"];

export type InvestoWatchlistItem =
  InvestoDatabase["public"]["Tables"]["investo_watchlist"]["Row"];

export type InvestoRecommendation =
  InvestoDatabase["public"]["Tables"]["investo_recommendations"]["Row"];

export type InvestoDecision =
  InvestoDatabase["public"]["Tables"]["investo_decisions"]["Row"];
