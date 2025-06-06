// app.js
import { userApi } from './services/api'

App({
  // 全局数据管理
  globalData: {
    userInfo: null,
    token: null,
    isGrid: false,
    isArea: false,
    baseUrl: 'http://127.0.0.1:8080',  // 使用127.0.0.1替代localhost
    user: null,
    communityInfo: {
      name: '明发社区欢迎您',
      description:'明发滨江新城一期坐落于滨江大道1号，南京长江大桥北堡下...',
      alldesc:'明发滨江新城一期坐落于滨江大道1号，南京长江大桥北堡下。小区交付于2006年，共有63栋楼房，建筑面积56万平方米，共3973户，划分为9个网格。2024年，社区不断探索小区和谐治理新模式，以"党建引领、多元共治、民主协商、科技赋能"为主线，建立"网格+物业"融合联动工作机制，明发一期物业在社区党委指导下，在融合服务党支部协助下，积极推进网格+物业全方位融合，实现网格员和物业管家联动互动融动，通过首问负责制、居民代表会商制等方式，努力做到小事不出楼栋，大事不出小区，难事不出社区。',
      
    },
  },

  onLaunch() {
    console.log('=== 应用启动 ===');
    // 从本地存储恢复用户状态
    const token = wx.getStorageSync('auth_token');
    const userInfo = wx.getStorageSync('userInfo');
    const userRole = wx.getStorageSync('userRole');

    if (token && userInfo && userRole) {
      console.log('从本地存储恢复用户状态');
      this.globalData.token = token;
      this.globalData.userInfo = userInfo;
      this.globalData.isGrid = userRole === '网格员';
      this.globalData.isArea = userRole === '片区长';
    }
  },

  onShow() {
    // 小程序显示时触发
    console.log('App Show');
  },

  onHide() {
    // 小程序隐藏时触发
    console.log('App Hide');
  },

  // 检查登录状态
  checkLoginStatus() {
    const token = wx.getStorageSync('auth_token');
    const userInfo = wx.getStorageSync('userInfo');
    
    if (!token || !userInfo) {
      wx.redirectTo({
        url: '/pages/login/login'
      });
      return false;
    }
    return true;
  }
})
