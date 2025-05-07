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
    const token = wx.getStorageSync('auth_token');
    const userInfo = wx.getStorageSync('userInfo');
    const userRole = wx.getStorageSync('userRole');

    if (!token || !userInfo || !userRole) {
      this.setData({ showLoginForm: true });
      return;
    }

    try {
      const response = await this.getUserInfo(token);
      if (response) {
        this.setGlobalData(response);
        auth.redirectByRole(response.role);
      } else {
        this.setData({ showLoginForm: true });
      }
    } catch (err) {
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
    app.globalData.userInfo = response;
    app.globalData.isGrid = response.role === '网格员';
    app.globalData.isArea = response.role === '片区长';
    
    wx.setStorageSync('auth_token', response.token);
    wx.setStorageSync('userInfo', response);
    wx.setStorageSync('userRole', response.role);
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
      const response = await userApi.userLogin(code);
      
      if (!response || !response.role) {
        throw new Error('用户信息不完整');
      }
      
      this.setGlobalData(response);
      auth.redirectByRole(response.role);
    } catch (err) {
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
      if (!response || !response.role) {
        throw new Error('用户信息不完整');
      }
      
      this.setGlobalData(response);
      auth.redirectByRole(response.role);
    } catch (err) {
      wx.showToast({
        title: err.message || '登录失败',
        icon: 'none'
      });
    } finally {
      this.setData({ isLoading: false });
    }
  }
}); 
