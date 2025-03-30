export interface Sentence {
    text: string;
    importance: number;
}

export interface AnalysisCategory {
    score: number | null;
    deductions: string[];
}

export interface Analysis {
    title_relevance: AnalysisCategory;
    logical_consistency: AnalysisCategory;
    factual_accuracy: AnalysisCategory;
    subjectivity_and_inflammatory_language: AnalysisCategory;
    causal_relevance: AnalysisCategory;
    source_credibility: AnalysisCategory;
    debunking_result: AnalysisCategory;
    external_corroboration: AnalysisCategory;
}

export interface Summary {
    main_points: string[];
}
