// app.js
import { userApi } from './services/api'
import config from './config/api';

App({
  // 全局数据管理
  globalData: {
    userInfo: null,
    token: null,
    isGrid: false,
    isArea: false,
    //baseUrl: 'http://127.0.0.1:8080',  // 使用127.0.0.1替代localhost
    baseUrl: config.baseURL,
    user: null,
    communityInfo: {
      name: '明发社区欢迎您',
      description:'明发滨江新城一期坐落于滨江大道1号，南京长江大桥北堡下...',
      alldesc:'明发滨江新城一期坐落于滨江大道1号，南京长江大桥北堡下。小区交付于2006年，共有63栋楼房，建筑面积56万平方米，共3973户，划分为9个网格。2024年，社区不断探索小区和谐治理新模式，以"党建引领、多元共治、民主协商、科技赋能"为主线，建立"网格+物业"融合联动工作机制，明发一期物业在社区党委指导下，在融合服务党支部协助下，积极推进网格+物业全方位融合，实现网格员和物业管家联动互动融动，通过首问负责制、居民代表会商制等方式，努力做到小事不出楼栋，大事不出小区，难事不出社区。',
      
    },
  },

  onLaunch() {
    console.log('=== 应用启动 ===');
    // 初始化云开发环境 (全局执行一次)
    if (config.cloudEnvId) {
      wx.cloud.init({
        env: config.cloudEnvId,
        traceUser: true, // 开启用户追踪
      });
      console.log('wx.cloud.init initialized with env:', config.cloudEnvId);
    } else {
      console.warn('config.cloudEnvId is not set. wx.cloud.init not performed.');
    }

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
  },

  /**
   * 封装的微信云托管调用方法
   * @param {*} obj 业务请求信息，可按照需要扩展
   *   obj.path: 后端服务接口地址
   *   obj.method: HTTP 请求方法 (可选，默认为GET)
   *   obj.data: 请求的参数 (可选)
   *   obj.header: 其他header参数 (可选)
   * @param {*} number 请求等待，默认不用传，用于初始化等待
   */
  async call(obj, number = 0) {
    const that = this;
    if (that.cloud == null) {
      const cloud = new wx.cloud.Cloud({
        resourceAppid: config.appId, // 您的AppID
        resourceEnv: config.cloudEnvId, // 微信云托管的环境ID
      });
      that.cloud = cloud;
      await that.cloud.init(); // init过程是异步的，需要等待init完成才可以发起调用
    }

    try {
      const result = await that.cloud.callContainer({
        config: {
          env: config.cloudEnvId, // 微信云托管的环境ID
        },
        path: obj.path, // 填入业务自定义路径和参数
        method: obj.method || 'GET', // 按照自己的业务开发，选择对应的方法
        header: {
          'X-WX-SERVICE': config.cloudServiceName, // 填入服务名称
          'content-type': 'application/json', // 默认 content-type
          ...(wx.getStorageSync('auth_token') ? { 'Authorization': `Bearer ${wx.getStorageSync('auth_token')}` } : {}), // 自动添加Authorization头
          ...obj.header // 合并其他header参数
        },
        data: obj.data, // 请求参数
        // 其余参数同 wx.request (如 dataType, timeout 等)
      });
      console.log(`微信云托管调用结果${result.errMsg} | callid:${result.callID}`);
      console.log('完整的 wx.cloud.callContainer 响应对象:', result); // 打印完整响应对象
      
      // 根据后端的返回格式判断
      if (result.statusCode === 200) {
        // 后端直接返回业务数据（如登录接口），或者返回 { code: 200, data: ..., msg: ... }
        // 为了兼容两种情况，这里只判断 statusCode 为 200，并直接返回 result.data
        // 后续的API调用方（如userApi.userLogin）会根据具体返回的数据结构进行解析
        return result.data;
      } else if (result.statusCode === 401 || (result.data && result.data.code === 401)) {
        // 处理登录过期
        wx.removeStorageSync('auth_token');
        wx.removeStorageSync('userInfo');
        wx.removeStorageSync('userRole');
        wx.redirectTo({
          url: '/pages/login/login'
        });
        throw new Error(result.data?.msg || '登录已过期，请重新登录');
      } else {
        // 如果后端返回了错误信息，优先使用后端提供的 msg，否则使用 result.errMsg 或默认错误
        throw new Error(result.data?.msg || result.errMsg || '请求失败');
      }
    } catch (e) {
      const error = e.toString();
      // 如果错误信息为未初始化，则等待300ms再次尝试，因为init过程是异步的
      if (error.indexOf("Cloud API isn't enabled") != -1 && number < 3) {
        return new Promise((resolve) => {
          setTimeout(function() {
            resolve(that.call(obj, number + 1));
          }, 300);
        });
      } else {
        throw new Error(`微信云托管调用失败: ${error}`);
      }
    }
  }
})
