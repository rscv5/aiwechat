// app.js

App({
  // 全局数据管理
  globalData: {
    communityInfo: {
      name: '明发社区',
      address: '示例地址',
      description: '智慧社区示范点'
    },
    userInfo: null
  },

  // 小程序启动时触发 
  // 生命周期函数
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录逻辑
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        console.log('登录成功', res)
      }
    })
  },

  onShow() {
    // 小程序显示时触发
  },

  onHide() {
    // 小程序隐藏时触发
  }
})
