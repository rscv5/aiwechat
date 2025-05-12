import { userApi } from '../../services/api'
const auth = require('../../utils/auth');

const app = getApp()

Page({
  data: {
    isAdminLogin: false, // 是否是管理员登录
    username: '',
    password: '',
    loading: false,
    isLoading: false,
    showLoginForm: false
  },

  // 页面加载时检查登录状态
  onLoad() {
    this.checkLoginAndRedirect();
  },

  // 页面显示时检查登录状态
  onShow() {
    this.checkLoginAndRedirect();
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

    if (!token || !userInfo || !userRole) {
      console.log('存储信息不完整，显示登录表单');
      this.setData({ showLoginForm: true });
      return;
    }

    try {
      console.log('开始验证token');
      const response = await this.getUserInfo(token);
      console.log('token验证结果:', response);
      
      if (response) {
        // 更新用户信息，但保留原有的 token
        const updatedUserInfo = {
          ...response,
          token: token // 确保保留原有的 token
        };
        this.setGlobalData(updatedUserInfo);
        auth.redirectByRole(response.role);
      } else {
        console.log('token验证失败，显示登录表单');
        this.setData({ showLoginForm: true });
      }
    } catch (err) {
      console.error('token验证出错:', err);
      wx.showToast({
        title: err.message || '登录已过期，请重新登录',
        icon: 'none',
        duration: 2000
      });
      this.setData({ showLoginForm: true });
    }
  },

  // 设置全局数据
  setGlobalData(response) {
    console.log('=== 设置全局数据 ===');
    console.log('登录响应数据:', response);
    
    // 保存到全局数据
    app.globalData.userInfo = response;
    app.globalData.isGrid = response.role === '网格员';
    app.globalData.isArea = response.role === '片区长';
    
    // 保存到本地存储
    // 注意：token 可能在 response.token 或 response.accessToken 中
    const token = response.token || response.accessToken;
    console.log('保存的token:', token);
    
    if (!token) {
      console.error('登录响应中没有token');
      throw new Error('登录响应数据不完整');
    }
    
    wx.setStorageSync('auth_token', token);
    wx.setStorageSync('userInfo', response);
    wx.setStorageSync('userRole', response.role);
    wx.setStorageSync('user_openid', response.openid);  // 保存用户openid
    
    console.log('数据保存完成，当前存储状态:', {
      token: wx.getStorageSync('auth_token') ? '存在' : '不存在',
      userInfo: wx.getStorageSync('userInfo') ? '存在' : '不存在',
      userRole: wx.getStorageSync('userRole') ? '存在' : '不存在',
      userOpenid: wx.getStorageSync('user_openid') ? '存在' : '不存在'
    });
  },

  // 获取用户信息
  async getUserInfo(token) {
    try {
      const response = await userApi.getUserInfo(token);
      if (!response || !response.role) {
        throw new Error('用户信息不完整');
      }
      return response;
    } catch (err) {
      throw err;
    }
  },

  // 切换登录方式
  switchLoginType() {
    this.setData({
      isAdminLogin: !this.data.isAdminLogin
    });
  },

  // 输入用户名
  onUsernameInput(e) {
    this.setData({
      username: e.detail.value
    });
  },

  // 输入密码
  onPasswordInput(e) {
    this.setData({
      password: e.detail.value
    });
  },

  // 微信登录
  async handleWxLogin() {
    this.setData({ isLoading: true });
    
    try {
      const { code } = await wx.login();
      console.log('获取到微信登录code:', code);
      
      const response = await userApi.userLogin(code);
      console.log('登录响应:', response);
      
      if (!response || !response.role) {
        throw new Error('用户信息不完整');
      }
      
      // 确保响应中包含 token
      if (!response.token && !response.accessToken) {
        console.error('登录响应中没有token:', response);
        throw new Error('登录响应数据不完整');
      }
      
      this.setGlobalData(response);
      auth.redirectByRole(response.role);
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

  // 管理员登录
  async handleAdminLogin() {
    const { username, password } = this.data;
    if (!username || !password) {
      wx.showToast({ title: '请输入用户名和密码', icon: 'none' });
      return;
    }

    this.setData({ isLoading: true });

    try {
      const response = await userApi.gridLogin(username, password);
      console.log('管理员登录响应:', response);
      
      if (!response || !response.role) {
        throw new Error('用户信息不完整');
      }
      
      // 确保响应中包含 token
      if (!response.token && !response.accessToken) {
        console.error('登录响应中没有token:', response);
        throw new Error('登录响应数据不完整');
      }
      
      this.setGlobalData(response);
      auth.redirectByRole(response.role);
    } catch (err) {
      console.error('管理员登录失败:', err);
      wx.showToast({
        title: err.message || '登录失败',
        icon: 'none'
      });
    } finally {
      this.setData({ isLoading: false });
    }
  }
}); 
 