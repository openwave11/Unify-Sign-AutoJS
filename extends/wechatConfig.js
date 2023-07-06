
module.exports = {
  // 配置自定义的签到任务定义信息
  supported_signs: [
    {
      name: '早晚企业微信打卡',
      taskCode: 'WeChatSign',
      script: 'WeChatSign.js',
      enabled: true
    }
  ]
}
