# News-Guard

**News-Guard** 是一个功能全面、技术先进的伪造内容检测平台，旨在帮助平台管理者和普通用户快速、准确地识别和分析多模态信息（文本、图片、音频）中的潜在伪造、篡改或误导性内容。

本项目是 News-Guard 平台的前端代码仓库，涵盖了 Web 端、桌面端（Windows/macOS）以及浏览器插件的全部用户界面和交互逻辑。

## ✨ 项目特色

- **多模态内容检验**：支持对文本、图片、音频等多种形式的内容进行深度伪造检测和可信度分析。
- **全平台覆盖**：提供 Web 网站、桌面应用和浏览器插件，实现跨设备、跨场景的无缝检测体验。
- **数据可视化仪表盘**：通过 ECharts 动态展示虚假新闻统计数据、热门鉴别新闻和伪造趋势，提升信息环境透明度。
- **对话式分析与追问**：集成大语言模型（LLM），用户可通过自然语言对话，对检测结果和可疑内容进行深入追问。
- **低代码智能体定制**：提供图形化工作流编排界面，允许开发者和高级用户构建高度定制化的信息核查与分析流程，并一键生成 API。
- **区块链取证**：整合蚂蚁链技术，为新闻内容及检测结果提供不可篡改、可公开验证的“信任锚”。
- **热点风险预测**：主动监测社会热点，利用 LLM 预测其被用于制造和传播虚假信息的风险。

## 🚀 主要功能模块展示

### 1. 统计数据

提供一个动态、交互式的数据仪表盘，实时监控平台整体运行状态、检测效率和虚假信息的分布趋势。

<p align="center">
  <img src="https://tec-1312799453.cos.ap-shanghai.myqcloud.com/nft/%E7%BB%9F%E8%AE%A1%E6%95%B0%E6%8D%AE-%E6%95%B0%E6%8D%AE%E6%A6%82%E8%A7%88%E4%B8%8E%E6%95%B0%E6%8D%AE%E5%88%86%E6%9E%90.png" alt="统计数据-数据概览与数据分析" width="100%">
  <br>
  <em>图 1: 统计数据-数据概览与数据分析</em>
</p>

### 2. 新闻检验

#### 文字检验

支持用户输入文本或粘贴网页链接（URL），系统从标题相关性、逻辑一致性、事实准确性等多个维度进行综合评估，并生成可信度评分和结构化分析报告。

**检验前界面：**

<p align="center">
  <img src="https://tec-1312799453.cos.ap-shanghai.myqcloud.com/nft/%E6%96%87%E5%AD%97%E6%A3%80%E9%AA%8C-%E6%A3%80%E9%AA%8C%E5%89%8D.png" alt="文字检验-检验前" width="100%">
  <br>
  <em>图 2: 文字检验-检验前</em>
</p>

**检验后报告：**

<p align="center">
  <img src="https://tec-1312799453.cos.ap-shanghai.myqcloud.com/nft/%E6%96%87%E5%AD%97%E6%A3%80%E9%AA%8C-%E6%A3%80%E9%AA%8C%E5%90%8E%E7%9A%84%E8%AF%84%E5%88%86%E4%B8%8E%E5%86%85%E5%AE%B9%E9%80%90%E5%8F%A5%E5%88%86%E6%9E%90.png" alt="文字检验-检验后的评分与内容逐句分析" width="100%">
  <br>
  <em>图 3: 文字检验-检验后的评分与内容逐句分析</em>
</p>

#### 图片检验

用户可上传本地图片或粘贴图片 URL，系统应用计算机视觉技术检测数字篡改痕迹（如拼接、擦除）和 AI 生成特征，返回伪造概率并高亮显示可疑区域。

<p align="center">
  <img src="https://tec-1312799453.cos.ap-shanghai.myqcloud.com/nft/%E5%9B%BE%E7%89%87%E6%A3%80%E9%AA%8C-%E6%A3%80%E9%AA%8C%E5%90%8E.png" alt="图片检验-检验后" width="100%">
  <br>
  <em>图 4: 图片检验-检验后</em>
</p>

#### 音频检验

支持用户上传音频文件，系统通过分析声学特征（频谱、声纹）和语音内容，判断是否存在 AI 合成、拼接剪辑等伪造痕跡，并提供伪造概率评分。

**检验前界面：**

<p align="center">
  <img src="https://tec-1312799453.cos.ap-shanghai.myqcloud.com/nft/%E9%9F%B3%E9%A2%91%E6%A3%80%E9%AA%8C-%E6%A3%80%E6%B5%8B%E5%89%8D.png" alt="音频检验-检测前" width="100%">
  <br>
  <em>图 5: 音频检验-检测前</em>
</p>

**检验后报告：**

<p align="center">
  <img src="https://tec-1312799453.cos.ap-shanghai.myqcloud.com/nft/%E9%9F%B3%E9%A2%91%E6%A3%80%E9%AA%8C-%E6%A3%80%E6%B5%8B%E5%90%8E%E4%B8%BB%E8%A6%81%E7%BB%93%E6%9E%9C.png" alt="音频检验-检测后主要结果" width="100%">
  <br>
  <em>图 6: 音频检验-检测后主要结果</em>
</p>

### 3. 虚假新闻助手（对话式分析）

一个基于 LLM 的高级对话界面，用户可以围绕新闻内容进行提问、获取深入解释、进行多角度分析或对特定事实进行核查。

**主页面：**

<p align="center">
  <img src="https://tec-1312799453.cos.ap-shanghai.myqcloud.com/nft/%E8%99%9A%E5%81%87%E6%96%B0%E9%97%BB%E5%8A%A9%E6%89%8B-%E4%B8%BB%E9%A1%B5%E9%9D%A2.png" alt="虚假新闻助手-主页面" width="100%">
  <br>
  <em>图 7: 虚假新闻助手-主页面</em>
</p>

**网络搜索与对话记录：**

<p align="center">
  <img src="https://tec-1312799453.cos.ap-shanghai.myqcloud.com/nft/%E8%99%9A%E5%81%87%E6%96%B0%E9%97%BB%E5%8A%A9%E6%89%8B-%E7%BD%91%E7%BB%9C%E6%90%9C%E7%B4%A2%E5%B1%95%E5%BC%80.png" alt="虚假新闻助手-网络搜索展开" width="100%">
  <br>
  <em>图 8: 虚假新闻助手-网络搜索展开</em>
</p>

<p align="center">
  <img src="https://tec-1312799453.cos.ap-shanghai.myqcloud.com/nft/%E8%99%9A%E5%81%87%E6%96%B0%E9%97%BB%E5%8A%A9%E6%89%8B-%E5%AF%B9%E8%AF%9D%E8%AE%B0%E5%BD%95.png" alt="虚假新闻助手-对话记录" width="100%">
  <br>
  <em>图 9: 虚假新闻助手-对话记录</em>
</p>

### 4. 智能生成图表

在对话界面中，用户可通过自然语言指令（如“展示上个月各类假新闻数量的饼图”），让 AI 智能生成 ECharts 可视化图表，实现与数据的自然交互。

<p align="center">
  <img src="https://tec-1312799453.cos.ap-shanghai.myqcloud.com/nft/%E8%99%9A%E5%81%87%E6%96%B0%E9%97%BB%E5%8A%A9%E6%89%8B-%20%E9%A5%BC%E5%9B%BE%E7%94%9F%E6%88%90.png" alt="虚假新闻助手-饼图生成" width="100%">
  <br>
  <em>图 10: 虚假新闻助手-饼图生成</em>
</p>

<p align="center">
  <img src="https://tec-1312799453.cos.ap-shanghai.myqcloud.com/nft/%E8%99%9A%E5%81%87%E6%96%B0%E9%97%BB%E5%8A%A9%E6%89%8B-%E6%8A%98%E7%BA%BF%E5%9B%BE%E7%94%9F%E6%88%90.png" alt="虚假新闻助手-折线图生成" width="100%">
  <br>
  <em>图 11: 虚假新闻助手-折线图生成</em>
</p>

### 5. 个人知识库

允许用户创建和管理自己的私有知识库。通过上传数据集，用户可以在后续的对话式分析中，让 AI 结合个人知识库的数据进行回答，增强分析的定制化和准确性。

**知识库主页：**

<p align="center">
  <img src="https://tec-1312799453.cos.ap-shanghai.myqcloud.com/nft/%E4%B8%AA%E4%BA%BA%E7%9F%A5%E8%AF%86%E5%BA%93-%E4%B8%BB%E9%A1%B5.png" alt="个人知识库-主页" width="100%">
  <br>
  <em>图 12: 个人知识库-主页</em>
</p>

**创建与管理知识库：**

<p align="center">
  <img src="https://tec-1312799453.cos.ap-shanghai.myqcloud.com/nft/%E4%B8%AA%E4%BA%BA%E7%9F%A5%E8%AF%86%E5%BA%93-%E5%88%9B%E5%BB%BA%E7%9F%A5%E8%AF%86%E5%BA%93.png" alt="个人知识库-创建知识库" width="100%">
  <br>
  <em>图 13: 个人知识库-创建知识库</em>
</p>

<p align="center">
  <img src="https://tec-1312799453.cos.ap-shanghai.myqcloud.com/nft/%E4%B8%AA%E4%BA%BA%E7%9F%A5%E8%AF%86%E5%BA%93-%E6%95%B0%E6%8D%AE%E9%9B%86%E8%AF%A6%E6%83%85.png" alt="个人知识库-数据集详情" width="100%">
  <br>
  <em>图 14: 个人知识库-数据集详情</em>
</p>

### 6. 虚假新闻预测

系统自动爬取主流媒体的热点榜单，利用 LLM 分析每个热点话题的特征（如争议性、敏感性），预测其被用于制造虚假信息的风险，并进行预警。

<p align="center">
  <img src="https://tec-1312799453.cos.ap-shanghai.myqcloud.com/nft/%E8%99%9A%E5%81%87%E6%96%B0%E9%97%BB%E9%A2%84%E6%B5%8B.png" alt="虚假新闻预测" width="100%">
  <br>
  <em>图 15: 虚假新闻预测</em>
</p>

### 7. 虚假新闻智能体

提供一个类似 Dify 的低代码/无代码编排平台，用户可以通过拖拽组件（LLM、联网搜索、条件判断等）来设计个性化的虚假信息检测工作流，并一键发布为 API 服务。

**官方智能体与工作流发布：**

<p align="center">
  <img src="https://tec-1312799453.cos.ap-shanghai.myqcloud.com/nft/%E8%99%9A%E5%81%87%E6%96%B0%E9%97%BB%E6%99%BA%E8%83%BD%E4%BD%93-%E5%AE%98%E6%96%B9%E6%99%BA%E8%83%BD%E4%BD%93.png" alt="虚假新闻智能体-官方智能体" width="100%">
  <br>
  <em>图 16: 虚假新闻智能体-官方智能体</em>
</p>

<p align="center">
  <img src="https://tec-1312799453.cos.ap-shanghai.myqcloud.com/nft/%E8%99%9A%E5%81%87%E6%96%B0%E9%97%BB%E6%99%BA%E8%83%BD%E4%BD%93-%E5%B7%A5%E4%BD%9C%E6%B5%81%E5%8F%91%E5%B8%83%E6%88%90%E5%8A%9F%E4%BF%A1%E6%81%AF.png" alt="虚假新闻智能体-工作流发布成功信息" width="100%">
  <br>
  <em>图 17: 虚假新闻智能体-工作流发布成功信息</em>
</p>

**运行结果展示：**

<p align="center">
  <img src="https://tec-1312799453.cos.ap-shanghai.myqcloud.com/nft/%E8%99%9A%E5%81%87%E6%96%B0%E9%97%BB%E6%99%BA%E8%83%BD%E4%BD%93-%E5%AE%8C%E6%88%90%E8%BF%90%E8%A1%8C%E7%9A%84%E7%BB%93%E6%9E%9C%E9%80%89%E9%A1%B9.png" alt="虚假新闻智能体-完成运行的结果选项" width="100%">
  <br>
  <em>图 18: 虚假新闻智能体-完成运行的结果选项</em>
</p>

<p align="center">
  <img src="https://tec-1312799453.cos.ap-shanghai.myqcloud.com/nft/%E8%99%9A%E5%81%87%E6%96%B0%E9%97%BB%E6%99%BA%E8%83%BD%E4%BD%93-%E5%AE%8C%E6%88%90%E8%BF%90%E8%A1%8C%E7%9A%84%E8%AF%A6%E6%83%85%E9%80%89%E9%A1%B9.png" alt="虚假新闻智能体-完成运行的详情选项" width="100%">
  <br>
  <em>图 19: 虚假新闻智能体-完成运行的详情选项</em>
</p>

### 8. 区块链取证

为新闻内容、检测过程和结果提供一个基于蚂蚁链的、不可篡改的存证。用户可以通过哈希值或新闻内容查询链上记录，为信息真实性提供强有力的证据。

**主页与查询详情：**

<p align="center">
  <img src="https://tec-1312799453.cos.ap-shanghai.myqcloud.com/nft/%E5%8C%BA%E5%9D%97%E9%93%BE%E5%8F%96%E8%AF%81-%E4%B8%BB%E9%A1%B5.png" alt="区块链取证-主页" width="100%">
  <br>
  <em>图 20: 区块链取证-主页</em>
</p>

<p align="center">
  <img src="https://tec-1312799453.cos.ap-shanghai.myqcloud.com/nft/%E5%8C%BA%E5%9D%97%E9%93%BE%E5%8F%96%E8%AF%81-%E6%9F%A5%E8%AF%A2%E8%AF%A6%E6%83%85.png" alt="区块链取证-查询详情" width="100%">
  <br>
  <em>图 21: 区块链取证-查询详情</em>
</p>

## 🛠️ 技术栈

本项目前端采用现代化、跨平台的技术栈，以实现高效开发和一致性体验。

- **Web 端 / 桌面端**:
  - **框架**: [Vue 3](https://vuejs.org/)
  - **语言**: [TypeScript](https://www.typescriptlang.org/)
  - **桌面应用打包**: [Electron](https://www.electronjs.org/)
  - **数据可视化**: [ECharts](https://echarts.apache.org/zh/index.html)
- **浏览器插件**:
  - **框架**: [WXT](https://wxt.dev/) (下一代 Web 扩展框架，支持 Vue)
  - **语言**: [TypeScript](https://www.typescriptlang.org/)

## 📦 安装与启动

### Web 端

**注意此项目为纯前端，后端部分并未启动缺少部分功能**

```
# 克隆仓库

git clone https://github.com/TECNB/news-guard

# 进入项目目录

cd news-guard

# 安装依赖

npm install

# 启动开发服务器

npm run dev
```