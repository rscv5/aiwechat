// app.js
import { userApi } from './services/api'

App({
  // 全局数据管理
  globalData: {
    baseUrl: 'http://127.0.0.1:8080',  // 使用127.0.0.1替代localhost
    userInfo: null,
    isGrid: false,
    isArea: false,
    user: null,
    communityInfo: {
      name: '明发社区',
      description:'明发滨江新城一期坐落于滨江大道1号，南京长江大桥北堡下...',
      alldesc:'明发滨江新城一期坐落于滨江大道1号，南京长江大桥北堡下。小区交付于2006年，共有63栋楼房，建筑面积56万平方米，共3973户，划分为9个网格。2024年，社区不断探索小区和谐治理新模式，以“党建引领、多元共治、民主协商、科技赋能”为主线，建立“网格+物业”融合联动工作机制，明发一期物业在社区党委指导下，在融合服务党支部协助下，积极推进网格+物业全方位融合，实现网格员和物业管家联动互动融动，通过首问负责制、居民代表会商制等方式，努力做到小事不出楼栋，大事不出小区，难事不出社区。',
      
    },
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
