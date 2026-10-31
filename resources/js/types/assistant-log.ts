export interface PortfolioAssistantLog {
    id: number;
    session_id: string | null;
    ip_hash: string;
    user_question: string;
    assistant_answer: string;
    status: 'success' | 'rate_limited' | 'error';
    created_at: string;
    updated_at: string;
}

export interface PaginatedAssistantLogs {
    data: PortfolioAssistantLog[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

export interface AssistantStats {
    total_queries: number;
    queries_today: number;
    unique_visitors: number;
}
