export type TopLevelType = 'expense' | 'income' | 'transfer'
export type BudgetFrequency = 'monthly' | 'yearly'
export type PlaidEnv = 'sandbox' | 'development' | 'production'

export interface Database {
  public: {
    Tables: {
      accounts: {
        Row: Account
        Insert: Omit<Account, 'id' | 'created_at'>
        Update: Partial<Omit<Account, 'id' | 'created_at'>>
      }
      transactions: {
        Row: Transaction
        Insert: Omit<Transaction, 'id' | 'created_at'>
        Update: Partial<Omit<Transaction, 'id' | 'created_at'>>
      }
      categories: {
        Row: Category
        Insert: Omit<Category, 'id' | 'created_at'>
        Update: Partial<Omit<Category, 'id' | 'created_at'>>
      }
      subcategories: {
        Row: Subcategory
        Insert: Omit<Subcategory, 'id' | 'created_at'>
        Update: Partial<Omit<Subcategory, 'id' | 'created_at'>>
      }
      budgets: {
        Row: Budget
        Insert: Omit<Budget, 'id' | 'created_at'>
        Update: Partial<Omit<Budget, 'id' | 'created_at'>>
      }
      recurring_rules: {
        Row: RecurringRule
        Insert: Omit<RecurringRule, 'id' | 'created_at'>
        Update: Partial<Omit<RecurringRule, 'id' | 'created_at'>>
      }
      merchant_rules: {
        Row: MerchantRule
        Insert: Omit<MerchantRule, 'id' | 'created_at'>
        Update: Partial<Omit<MerchantRule, 'id' | 'created_at'>>
      }
      portfolio_snapshots: {
        Row: PortfolioSnapshot
        Insert: Omit<PortfolioSnapshot, 'id' | 'created_at'>
        Update: Partial<Omit<PortfolioSnapshot, 'id' | 'created_at'>>
      }
      plaid_items: {
        Row: PlaidItem
        Insert: Omit<PlaidItem, 'id' | 'created_at'>
        Update: Partial<Omit<PlaidItem, 'id' | 'created_at'>>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

export interface Account {
  id: string
  created_at: string
  user_id: string
  plaid_account_id: string | null
  plaid_item_id: string | null
  name: string
  official_name: string | null
  type: string
  subtype: string | null
  is_manual: boolean
  current_balance: number | null
  available_balance: number | null
  currency: string
  mask: string | null
  last_synced_at: string | null
}

export interface Transaction {
  id: string
  created_at: string
  user_id: string
  plaid_transaction_id: string | null
  date: string
  amount: number
  description: string
  merchant_name: string | null
  account_id: string
  top_level_type: TopLevelType
  category_id: string | null
  subcategory_id: string | null
  transfer_pair_id: string | null
  is_recurring: boolean
  recurring_group_id: string | null
  is_manual: boolean
  notes: string | null
  pending: boolean
}

export interface Category {
  id: string
  created_at: string
  user_id: string
  name: string
  top_level_type: TopLevelType
  sort_order: number
  color: string | null
  icon: string | null
}

export interface Subcategory {
  id: string
  created_at: string
  user_id: string
  category_id: string
  name: string
  sort_order: number
}

export interface Budget {
  id: string
  created_at: string
  user_id: string
  category_id: string | null
  subcategory_id: string | null
  frequency: BudgetFrequency
  amount: number
  month_overrides: Record<string, number> | null
}

export interface RecurringRule {
  id: string
  created_at: string
  user_id: string
  name: string
  amount: number
  frequency: 'weekly' | 'monthly' | 'yearly'
  category_id: string | null
  subcategory_id: string | null
  is_active: boolean
}

export interface MerchantRule {
  id: string
  created_at: string
  user_id: string
  merchant_name: string
  category_id: string
  subcategory_id: string | null
  top_level_type: TopLevelType
}

export interface PortfolioSnapshot {
  id: string
  created_at: string
  user_id: string
  account_id: string
  date: string
  value: number
  notes: string | null
}

export interface PlaidItem {
  id: string
  created_at: string
  user_id: string
  access_token: string
  item_id: string
  institution_id: string | null
  institution_name: string | null
  last_synced_at: string | null
  cursor: string | null
}
