/**
 * 根据句子类别返回对应的颜色
 * @param category 句子类别
 * @returns 颜色值
 */
export function getColorForCategory(category: string): string {
    switch (category) {
        case 'logical_consistency':
            return 'rgba(168, 85, 247, 0.2)'; // 紫色
        case 'factual_accuracy':
            return 'rgba(59, 130, 246, 0.2)'; // 蓝色
        case 'subjectivity_and_inflammatory_language':
            return 'rgba(239, 68, 68, 0.2)'; // 红色
        case 'causal_relevance':
            return 'rgba(245, 158, 11, 0.2)'; // 黄色
        case 'source_credibility':
            return 'rgba(249, 115, 22, 0.2)'; // 橙色
        case 'debunking_result':
            return 'rgba(16, 185, 129, 0.2)'; // 绿色
        case 'external_corroboration':
            return 'rgba(20, 184, 166, 0.2)'; // 青色
        default:
            return 'rgba(209, 213, 219, 0.2)'; // 灰色
    }
} 