// chartUtils.ts

export const generateChart = async (
    chartType: string,
    message: string,
    chatStore: any,
    displayedMessages: any,
    typeEffect: Function,
    setMessage: Function,
    setShowSuggestions: Function
) => {
    // 开始新会话
    if (chatStore.currentConversationId === null) {
        chatStore.startNewConversation();
    }

    // 显示用户输入
    displayedMessages.value.push({ type: 'user', content: message });
    chatStore.saveMessages(displayedMessages.value); // 保存消息到当前对话
    setMessage(''); // 清空消息输入

    // 隐藏建议列表
    setShowSuggestions(false);

    // 添加加载占位符
    displayedMessages.value.push({ type: 'loading', content: '' });
    chatStore.saveMessages(displayedMessages.value); // 保存消息到当前对话

    // 移除加载占位符
    displayedMessages.value.pop();
    displayedMessages.value.push({ type: 'ai', content: '' });
    chatStore.saveMessages(displayedMessages.value); // 保存消息到当前对话

    // 使用打字效果提示正在生成图表
    await typeEffect(`正在生成${chartType}图，请稍等...`, 50);

    // 根据图表类型生成相应的图表配置或ID
    let chartData;
    switch (chartType) {
        case '虚假新闻来源分布':
            chartData = 'chartDataForSourceDistribution';
            break;
        case '虚假新闻错误类型分布':
            chartData = 'chartDataForErrorTypeDistribution';
            break;
        case '虚假新闻按时间统计':
            chartData = 'chartDataForTimeStatistics';
            break;
        case '虚假新闻主题分析':
            chartData = 'chartDataForTopicAnalysis';
            break;
        default:
            chartData = 'chartDataForDefault';
            break;
    }

    // 返回图表数据
    displayedMessages.value.push({ type: 'chart', content: chartData });
    chatStore.saveMessages(displayedMessages.value); // 保存消息到当前对话
};