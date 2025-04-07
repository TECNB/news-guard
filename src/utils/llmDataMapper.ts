/**
 * LLM数据映射工具
 * 用于将LLM返回的JSON数据映射到分析结构
 */

import { removeNewlinesRecursively } from './stringCleaner';
import type { Analysis, Summary } from './types';

/**
 * 将LLM响应数据映射到分析结构
 * @param jsonData LLM返回的JSON数据
 * @param targetData 目标数据对象，包含analysis和summary属性
 */
export const mapLlmDataToAnalysis = (
    jsonData: any, 
    targetData: { 
        analysis: Analysis; 
        summary: Summary 
    }
): void => {
    const cleanJsonData = removeNewlinesRecursively(jsonData);
    
    // 处理主要观点 (main_point → a)
    if (cleanJsonData.a) {
        targetData.summary.main_points = cleanJsonData.a;
    } else {
        targetData.summary.main_points = [];
    }

    // 处理详细分析 (details → b, analysis → c)
    if (cleanJsonData.b && cleanJsonData.b.c) {
        const analysis = cleanJsonData.b.c;
        
        // 映射结构：
        // title_relevance → d
        if (analysis.d) {
            targetData.analysis.title_relevance.score = analysis.d.e || 0;
            if (Array.isArray(analysis.d.m)) {
                targetData.analysis.title_relevance.deductions = analysis.d.m;
            }
        }
        
        // logical_consistency → f
        if (analysis.f) {
            targetData.analysis.logical_consistency.score = analysis.f.e || 0;
            if (Array.isArray(analysis.f.m)) {
                targetData.analysis.logical_consistency.deductions = analysis.f.m;
            }
        }
        
        // factual_accuracy → g
        if (analysis.g) {
            targetData.analysis.factual_accuracy.score = analysis.g.e || 0;
            if (Array.isArray(analysis.g.m)) {
                targetData.analysis.factual_accuracy.deductions = analysis.g.m;
            }
        }
        
        // subjectivity_and_inflammatory_language → h
        if (analysis.h) {
            targetData.analysis.subjectivity_and_inflammatory_language.score = analysis.h.e || 0;
            if (Array.isArray(analysis.h.m)) {
                targetData.analysis.subjectivity_and_inflammatory_language.deductions = analysis.h.m;
            }
        }
        
        // causal_relevance → i
        if (analysis.i) {
            targetData.analysis.causal_relevance.score = analysis.i.e || 0;
            if (Array.isArray(analysis.i.m)) {
                targetData.analysis.causal_relevance.deductions = analysis.i.m;
            }
        }
        
        // source_credibility → j
        if (analysis.j) {
            targetData.analysis.source_credibility.score = analysis.j.e || 0;
            if (Array.isArray(analysis.j.m)) {
                targetData.analysis.source_credibility.deductions = analysis.j.m;
            }
        }
        
        // debunking_result → k
        if (analysis.k) {
            targetData.analysis.debunking_result.score = analysis.k.e !== undefined ? analysis.k.e : null;
            if (Array.isArray(analysis.k.m)) {
                targetData.analysis.debunking_result.deductions = analysis.k.m;
            }
        }
        
        // external_corroboration → l
        if (analysis.l) {
            targetData.analysis.external_corroboration.score = analysis.l.e !== undefined ? analysis.l.e : null;
            if (Array.isArray(analysis.l.m)) {
                targetData.analysis.external_corroboration.deductions = analysis.l.m;
            }
        }
    }
}; 