import { userApi } from '../../services/api'
const auth = require('../../utils/auth');

const app = getApp()

Page({
  data: {
    isAdminLogin: false, // 是否是管理员登录
    phoneNumber: '',
    password: '',
    loading: false,
    isLoading: false,
    showLoginForm: true
  },

  // 页面加载时检查登录状态
  onLoad() {
    console.log('=== 登录页面加载 onLoad ===');
    // 只在 onLoad 时检查一次登录状态
    this.checkLoginAndRedirect();
  },

  // 页面显示时不再重复检查
  onShow() {
    console.log('=== 登录页面显示 onShow ===');
    // 不再重复检查登录状态
  },

  // 检查登录状态并重定向
  async checkLoginAndRedirect() {
    console.log('=== 检查登录状态 ===');
    const token = wx.getStorageSync('auth_token');
    const userInfo = wx.getStorageSync('userInfo');
    const userRole = wx.getStorageSync('userRole');

    console.log('当前存储状态:', {
      token: token ? '存在' : '不存在',
      userInfo: userInfo ? '存在' : '不存在',
      userRole: userRole ? '存在' : '不存在'
    });

    // 如果没有完整的登录信息，直接显示登录表单
    if (!token || !userInfo || !userRole) {
      console.log('存储信息不完整，显示登录表单');
      this.setData({ showLoginForm: true });
      return;
    }

    // 如果有完整的登录信息，直接使用它们进行跳转
    console.log('准备根据角色跳转，当前角色:', userRole);
    if (userRole === '网格员') {
      wx.reLaunch({
        url: '/pages/grid/workorder/list'
      });
    } else if (userRole === '片区长') {
      wx.reLaunch({
        url: '/pages/captain/workorder/list'
      });
      } else {
      // 普通用户跳转到用户工单列表页面
      console.log('普通用户跳转到工单列表页面');
      wx.reLaunch({
        url: '/pages/user/workorder/list'
      });
    }
  },

  // 设置全局数据
  setGlobalData(response) {
    console.log('=== 设置全局数据 - 原始响应 ===', response);
    
    // 处理不同的响应结构
    let userInfo;
    if (response.userInfo) {
      // 管理员登录响应
      userInfo = {
        ...response.userInfo,
        token: response.token
      };
    } else {
      // 普通用户登录响应
      userInfo = {
        ...response,
        role: response.role || '普通用户',
        openid: response.openid || wx.getStorageSync('user_openid') || '' // 确保 openid 被包含在 userInfo 中，如果 response 中没有，则从 user_openid 中获取，如果 user_openid 中也没有，则设置为空字符串
      };
    }
    
    console.log('=== 设置全局数据 - 准备保存的userInfo ===', userInfo);

    // 保存到全局数据
    app.globalData.userInfo = userInfo;
    app.globalData.isGrid = userInfo.role === '网格员';
    app.globalData.isArea = userInfo.role === '片区长';
    app.globalData.token = response.token || response.accessToken;
    
    // 保存到本地存储
    wx.setStorageSync('auth_token', app.globalData.token);
    wx.setStorageSync('userInfo', userInfo);
    wx.setStorageSync('userRole', userInfo.role);
    // 这里的 response.openid 是为了兼容旧的 user_openid 存储，新逻辑应确保 userInfo 中包含 openid
    if (response.openid) {
      wx.setStorageSync('user_openid', response.openid);
    }
    
    console.log('数据保存完成，当前存储状态:', {
      token: wx.getStorageSync('auth_token') ? '存在' : '不存在',
      userInfo: wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo') : '不存在',
      userRole: wx.getStorageSync('userRole') ? '存在' : '不存在',
      userOpenid: wx.getStorageSync('user_openid') ? '存在' : '不存在'
    });

    // 根据角色跳转到不同页面
    if (userInfo.role === '网格员') {
      wx.reLaunch({
        url: '/pages/grid/workorder/list'
      });
    } else if (userInfo.role === '片区长') {
      wx.reLaunch({
        url: '/pages/captain/workorder/list'
      });
    } else {
      // 普通用户跳转到用户工单列表页面
      wx.reLaunch({
        url: '/pages/user/workorder/list'
      });
    }
  },

  // 切换登录方式
  switchLoginType() {
    this.setData({
      isAdminLogin: !this.data.isAdminLogin
    });
  },

  // 手机号输入处理
  onPhoneNumberInput(e) {
    this.setData({
      phoneNumber: e.detail.value
    });
  },

  // 密码输入处理
  onPasswordInput(e) {
    this.setData({
      password: e.detail.value
    });
  },

  // 微信登录处理
  async handleWxLogin() {
    this.setData({ isLoading: true });
    
    try {
      const { code } = await wx.login();
      console.log('获取到微信登录code:', code);
      
      const response = await userApi.userLogin(code);
      console.log('登录响应:', response);
      
      // 保存用户信息和认证信息，并自动跳转
      this.setGlobalData(response);
    } catch (err) {
      console.error('微信登录失败:', err);
      wx.showToast({
        title: err.message || '登录失败',
        icon: 'none'
      });
    } finally {
      this.setData({ isLoading: false });
    }
  },

  // 管理员登录处理
  async handleAdminLogin() {
    if (!this.data.phoneNumber || !this.data.password) {
      wx.showToast({
        title: '请输入手机号和密码',
        icon: 'none'
      });
      return;
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(this.data.phoneNumber)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return;
    }

    this.setData({ loading: true });

    try {
      const response = await userApi.gridLogin(this.data.phoneNumber, this.data.password);
      console.log('管理员登录响应:', response);
      
      // 保存用户信息和认证信息，并自动跳转
      this.setGlobalData(response);
    } catch (err) {
      console.error('管理员登录失败:', err);
      wx.showToast({
        title: err.message || '登录失败',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  }
}); 
 