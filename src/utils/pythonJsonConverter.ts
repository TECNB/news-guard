/**
 * Python 格式数据转换工具
 * 提供将 Python 格式字符串转换为标准 JSON 格式的工具函数
 */

/**
 * 解析部分 JSON 或格式不标准的 JSON 字符串
 * @param jsonStr 要解析的 JSON 字符串
 * @returns 解析后的对象
 */
export const parsePartialJson = (jsonStr: string): any => {
    try {
        // 处理连续的换行符和特殊字符
        const sanitizedStr = jsonStr.replace(/\\n/g, ' ').replace(/[\r\n]+/g, ' ');
        return JSON.parse(sanitizedStr);
    } catch (e) {
        console.error('第一次解析JSON失败，尝试修复:', e);
        try {
            // 尝试找到并提取有效的JSON部分
            const jsonMatch = jsonStr.match(/\{.*\}/s);
            if (jsonMatch) {
                const extractedJson = jsonMatch[0];
                // 如果提取成功，尝试再次解析
                return JSON.parse(extractedJson);
            }
            
            // 如果上述方法失败，尝试补全括号
            const fixedJson = jsonStr + '}}';
            return JSON.parse(fixedJson);
        } catch (e2) {
            console.error('无法解析JSON，返回空对象:', e2);
            return {}; 
        }
    }
};

/**
 * 将Python风格的字符串转换为标准JSON格式
 * 专门处理从Python返回的搜索结果数据
 * @param pythonStr Python风格的字符串
 * @returns 标准JSON格式的字符串
 */
export const pythonStringToJson = (pythonStr: string): string => {
    // 如果输入为空，返回空数组字符串
    if (!pythonStr || pythonStr.trim() === '') {
        return '[]';
    }
    
    console.log('正在处理Python格式数据:', pythonStr.substring(0, 100) + '...');
    
    try {
        // 首先尝试特定格式的提取 - 针对搜索结果的特定格式
        const items = [];
        
        // 使用非贪婪模式匹配，以处理嵌套引号问题
        const titleRegex = /'title':\s*'(.*?)(?<!\\)',/g;
        const linkRegex = /'link':\s*'(.*?)(?<!\\)',/g;
        const snippetRegex = /'snippet':\s*'(.*?)(?<!\\)'/g;
        
        const titles = [];
        const links = [];
        const snippets = [];
        
        // 提取所有标题
        let titleMatch;
        while ((titleMatch = titleRegex.exec(pythonStr)) !== null) {
            titles.push(titleMatch[1].replace(/\\'/g, "'"));
        }
        
        // 提取所有链接
        let linkMatch;
        while ((linkMatch = linkRegex.exec(pythonStr)) !== null) {
            links.push(linkMatch[1].replace(/\\'/g, "'"));
        }
        
        // 提取所有片段
        let snippetMatch;
        while ((snippetMatch = snippetRegex.exec(pythonStr)) !== null) {
            snippets.push(snippetMatch[1].replace(/\\'/g, "'"));
        }
        
        // 确保我们提取到了相同数量的标题、链接和片段
        const minLength = Math.min(titles.length, links.length, snippets.length);
        
        // 创建结果对象数组
        for (let i = 0; i < minLength; i++) {
            items.push({
                title: titles[i],
                link: links[i],
                snippet: snippets[i].replace(/\\xa0/g, ' ').replace(/\\x[0-9a-fA-F]{2}/g, ' ')
            });
        }
        
        if (items.length > 0) {
            return JSON.stringify(items);
        }
        
        // 如果上面的方法失败，尝试另一种模式匹配
        console.log('第一种提取方法失败，尝试备用方法');
        const itemRegex = /\{(.*?)\}/gs;
        const extractedItems = [];
        
        let itemMatch;
        while ((itemMatch = itemRegex.exec(pythonStr)) !== null) {
            const itemContent = itemMatch[1];
            
            // 从每个项目内容中提取键值对
            const titleMatch = itemContent.match(/'title':\s*'(.*?)(?<!\\)'/);
            const linkMatch = itemContent.match(/'link':\s*'(.*?)(?<!\\)'/);
            const snippetMatch = itemContent.match(/'snippet':\s*'(.*?)(?<!\\)'/);
            
            if (titleMatch && linkMatch && snippetMatch) {
                extractedItems.push({
                    title: titleMatch[1].replace(/\\'/g, "'"),
                    link: linkMatch[1].replace(/\\'/g, "'"),
                    snippet: snippetMatch[1].replace(/\\'/g, "'").replace(/\\xa0/g, ' ').replace(/\\x[0-9a-fA-F]{2}/g, ' ')
                });
            }
        }
        
        if (extractedItems.length > 0) {
            console.log('备用方法成功提取数据:', extractedItems.length, '项');
            return JSON.stringify(extractedItems);
        }
        
        // 如果以上方法都失败，返回一个手动构建的硬编码结果
        // 这确保用户界面至少能显示一些结果
        console.warn('所有提取方法都失败，返回默认数据');
        return JSON.stringify([
            {
                title: "处理数据失败 - 请检查日志",
                link: "#",
                snippet: "无法解析搜索结果，请查看控制台日志以了解详细信息。"
            }
        ]);
    } catch (e: unknown) {
        console.error('处理Python字符串时发生异常:', e);
        // 返回一个有效的结果，即使解析失败
        return JSON.stringify([
            {
                title: "数据处理异常",
                link: "#",
                snippet: "解析搜索结果时发生错误: " + (e instanceof Error ? e.message : String(e))
            }
        ]);
    }
}; 