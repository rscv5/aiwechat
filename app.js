// app.js
import { userApi } from './services/api'

App({
  // 全局数据管理
  globalData: {
    communityInfo: {
      name: '明发社区',
      address: '示例地址',
      description: '智慧社区示范点'
    },
    userInfo: null,
    isGrid: false,
    isArea: false,
    user: null
  },


  onLaunch() {
      // 小程序启动时触发 
  },

  onShow() {
    // 小程序显示时触发
  },

  onHide() {
    // 小程序隐藏时触发
  }
})
