// 区块链取证系统相关的模拟数据
// 新闻类型数据
export const NewsTypes = [
  '文本新闻',
  '图文结合',
  '视频新闻',
  '音频新闻'
];

// 假新闻记录数据
export const fakeNewsRecords = [
  {
    id: 'FN-2023-001',
    title: '金正恩亲自打靶庆祝尹锡悦下台？',
    content: '据朝鲜媒体报道，朝鲜最高领导人金正恩在得知韩国总统尹锡悦支持率下降后，亲自前往射击场打靶庆祝。报道中还提到金正恩一连命中多个靶心，展示了非凡的射击技术。经核实，该消息未在朝鲜官方媒体发布，为虚假信息。',
    type: '图文结合',
    verificationDate: '2023-11-15T09:30:00',
    transactionHash: '0x7b5e832f5746e7884b5f9c6e23aee1f18b23f8b4c8c8e9f9b8f7e6d5c4b3a2c1',
    blockNumber: 15689742,
    verificationResult: '虚假新闻',
    reasonDetail: '朝鲜官方媒体未发布相关报道',
    score: 35,
    blockchainProof: {
      timestamp: '2023-11-15T10:05:23',
      networkId: 1,
      contractAddress: '0x9876543210abcdef',
      eventSignature: 'FakeNewsVerified(bytes32,string,uint256)'
    }
  },
  {
    id: 'FN-2023-002',
    title: '苹果iOS18.5正式发布，极大优化续航和信号，前所未有的更新',
    content: '苹果公司今日凌晨突然发布了iOS18.5正式版，据官方介绍，该版本对系统进行了全面优化，使iPhone续航提升50%，信号问题得到根本性解决。众多用户反馈更新后手机"焕然一新"，甚至老款iPhone也有明显提升。经核实，苹果尚未发布iOS18.5，当前最新版本为iOS17.x。',
    type: '文本新闻',
    verificationDate: '2023-12-03T14:15:00',
    transactionHash: '0x8c7d6e5f4d3c2b1a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5',
    blockNumber: 15782931,
    verificationResult: '误导性信息',
    reasonDetail: '苹果官方未发布iOS18.5，目前最新系统为iOS17系列，且苹果系统更新通常不会声称有如此夸张的性能提升',
    score: 24,
    blockchainProof: {
      timestamp: '2023-12-03T14:55:12',
      networkId: 1,
      contractAddress: '0x9876543210abcdef',
      eventSignature: 'FakeNewsVerified(bytes32,string,uint256)'
    }
  }
];

// 与媒体类型相关的假新闻记录
export const mediaTypeNewsRecords = {
  image: {
    id: 'FN-2023-003',
    title: '上海浦东突发大规模洪灾？照片揭露惨状',
    content: '社交媒体流传一组据称为上海浦东新区遭遇严重洪水灾害的照片，显示城市街道被淹没，市民乘坐皮划艇出行。经核实，这些照片是利用AI技术将其他城市的洪水场景与上海地标建筑合成的，上海近期未发生大规模洪水事件。',
    type: '图文结合',
    verificationDate: '2023-10-25T11:20:00',
    transactionHash: '0x3a2c1b4e5d6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3',
    blockNumber: 15620031,
    verificationResult: '图像篡改',
    reasonDetail: '通过图像分析确认为AI合成图片，将其他城市的洪水照片与上海地标建筑结合。上海气象局和应急管理部门均未发布相关预警或救灾信息',
    score: 28,
    blockchainProof: {
      timestamp: '2023-10-25T12:05:18',
      networkId: 1,
      contractAddress: '0x9876543210abcdef',
      eventSignature: 'FakeNewsVerified(bytes32,string,uint256)'
    }
  },
  audio: {
    id: 'FN-2023-004',
    title: '李强总理讲话录音：将迅速放松房地产调控政策',
    content: '一段声称为中国总理李强的讲话音频在网络传播，内容提到将全面放松房地产调控政策，取消限购限贷等措施。经过专业比对确认为AI合成音频，内容与官方政策严重不符。',
    type: '音频新闻',
    verificationDate: '2023-09-18T16:45:00',
    transactionHash: '0x5f6e7d8c9b0a1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0e1d2c3b4a5f6e7',
    blockNumber: 15520974,
    verificationResult: '音频伪造',
    reasonDetail: '通过声纹分析确认为AI生成音频，非真实官员声音。国务院新闻办公室明确声明未有此讲话，且内容与当前房地产政策方向不符',
    score: 18,
    blockchainProof: {
      timestamp: '2023-09-18T17:12:45',
      networkId: 1,
      contractAddress: '0x9876543210abcdef',
      eventSignature: 'FakeNewsVerified(bytes32,string,uint256)'
    }
  },
  video: {
    id: 'FN-2023-005',
    title: '马斯克宣布放弃收购推特并捐赠100亿美元给中国慈善机构',
    content: '一段埃隆·马斯克的视频在社交平台广泛传播，视频中马斯克宣布放弃推特收购计划并将捐赠100亿美元支持中国的环保事业。该视频经分析为深度伪造作品，马斯克本人已在社交媒体上辟谣。',
    type: '视频新闻',
    verificationDate: '2023-11-30T08:15:00',
    transactionHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    blockNumber: 15770526,
    verificationResult: '深度伪造',
    reasonDetail: '通过面部表情和口型分析确认为深度伪造视频，马斯克本人已在社交媒体上否认此言论，且视频中提到的事件与实际情况不符',
    score: 8,
    blockchainProof: {
      timestamp: '2023-11-30T09:22:30',
      networkId: 1,
      contractAddress: '0x9876543210abcdef',
      eventSignature: 'FakeNewsVerified(bytes32,string,uint256)'
    }
  }
};

// 搜索关键词映射
export const keywordMapping = {
  '金正恩': 'FN-2023-001',
  '尹锡悦': 'FN-2023-001',
  '朝鲜': 'FN-2023-001',
  '韩国': 'FN-2023-001',
  'iOS': 'FN-2023-002',
  '苹果': 'FN-2023-002',
  'iPhone': 'FN-2023-002',
  '上海': 'FN-2023-003',
  '浦东': 'FN-2023-003',
  '洪水': 'FN-2023-003',
  '李强': 'FN-2023-004',
  '房地产': 'FN-2023-004',
  '马斯克': 'FN-2023-005',
  '推特': 'FN-2023-005'
};

// 示例区块链地址
export const EXAMPLE_BLOCKCHAIN_ADDRESS = '0x123456789abcdef'; 