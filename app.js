// app.js
import { userApi } from './services/api'

App({
  // 全局数据管理
  globalData: {
    baseUrl: 'http://127.0.0.1:8080',  // 使用127.0.0.1替代localhost
    userInfo: null,
    isGrid: false,
    isArea: false,
    user: null
  },

  onLaunch() {
    // 小程序启动时触发
    console.log('App Launch');
    // 检查登录状态
    const token = wx.getStorageSync('auth_token');
    if (token) {
      console.log('检测到已登录状态');
    }
  },

  onShow() {
    // 小程序显示时触发
    console.log('App Show');
  },

  onHide() {
    // 小程序隐藏时触发
    console.log('App Hide');
  }
})
