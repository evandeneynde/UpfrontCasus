export type BatchStatus = 'in_progress' | 'completed';

export type BatchInputMode = 'kg' | 'bags';

export type ProductListItem = {
    id: number;
    name: string;
    bag_weight_kg: number;
    is_active: boolean;
    ingredients_count: number;
    batches_count: number;
};

export type ProductIngredientInput = {
    name: string;
    grams_per_bag: number | string;
};

export type ProductFormData = {
    id: number;
    name: string;
    bag_weight_kg: number;
    is_active: boolean;
    ingredients: ProductIngredientInput[];
};

export type ActiveProduct = {
    id: number;
    name: string;
    bag_weight_kg: number;
};

export type BatchListItem = {
    id: number;
    user_id: number;
    worker_name: string | null;
    product_name: string;
    status: BatchStatus;
    current_step: number;
    target_bags: number;
    bags_produced: number | null;
    started_at: string | null;
    completed_at: string | null;
    duration_minutes: number | null;
};

export type RunIngredient = {
    id: number;
    name: string;
    needed_kg: number;
};

export type TrainingQuestion = {
    question: string;
    options: string[];
};

export type TrainingStep = {
    title: string;
    description: string;
    video_id: string | null;
    questions: TrainingQuestion[];
};

export type AdminTrainingQuestion = {
    id: number;
    question: string;
    options: [string, string, string, string];
    correct_option: number;
};

export type AdminTrainingStep = {
    id: number;
    sort_order: number;
    title: string;
    description: string;
    video_id: string | null;
    questions: AdminTrainingQuestion[];
    questions_count?: number;
};

export type VolumePeriod = {
    bags: number;
    kg: number;
    batches: number;
};

export type LeaderboardEntry = {
    name: string;
    bags: number;
    kg: number;
    batches: number;
    efficiency: number | null;
};

export type FlowPeriod = {
    labels: string[];
    average: number[];
    current: number[];
};

export type FlowDataSet = {
    day: FlowPeriod;
    week: FlowPeriod;
    month: FlowPeriod;
};

export type ProductOption = {
    id: number;
    name: string;
};

export type AnalyticsData = {
    volume: Record<string, VolumePeriod>;
    efficiency: Record<string, number | null>;
    leaderboard: LeaderboardEntry[];
    flowData: Record<string, FlowDataSet>;
    products: ProductOption[];
};

export type ProductionRun = {
    id: number;
    product_name: string;
    input_mode: BatchInputMode;
    target_bags: number | null;
    bag_weight_kg: number;
    status: BatchStatus;
    current_step: number;
    sifted: boolean | null;
    mixer_started: boolean | null;
    mix_minutes: number | null;
    attached_to_line: boolean | null;
    bags_produced: number | null;
    notes: string | null;
    started_at: string | null;
    completed_at: string | null;
    duration_minutes: number | null;
    total_actual_weight: number | null;
    ingredients: RunIngredient[];
};
