export interface Sentence {
    text: string;
    importance: number;
}

export interface AnalysisCategory {
    score: number;
    deductions: string[];
}

export interface Analysis {
    title_relevance: AnalysisCategory;
    logical_consistency: AnalysisCategory;
    factual_accuracy: AnalysisCategory;
    historical_accuracy: AnalysisCategory;
    subjectivity_and_inflammatory_language: AnalysisCategory;
    causality_check: AnalysisCategory;
}

export interface Summary {
    main_points: string[];
    check_facts: string[];
}
