import { userApi } from '../../services/api'

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
    // console.log('onLoad');
    this.checkLoginAndRedirect(); // 检查登录状态并重定向
  },

  // 页面显示时检查登录状态
  onShow() {
    //console.log('onShow');
    this.checkLoginAndRedirect();
  },

  // 检查登录状态并重定向
  async checkLoginAndRedirect() {
    // console.log('再login页面检查登录状态');
    // console.log("Storage keys:", wx.getStorageInfoSync().keys);
    
    const token = wx.getStorageSync('auth_token');
    const userInfo = wx.getStorageSync('userInfo');
    const userRole = wx.getStorageSync('userRole');

    // 如果没有 token 或用户信息，显示登录表单
    if (!token || !userInfo || !userRole) {
      // console.log('没有token或用户信息，显示登录表单');
      this.setData({ showLoginForm: true });
      return;
    }

    try {
      // 验证 token 有效性
      const response = await this.getUserInfo(token);
      if (response) {
        // 更新全局数据
        this.setGlobalData(response);
        // 根据角色跳转
        this.redirectByRole(response.role);
        // console.log('登录成功后Storage:', wx.getStorageInfoSync());
      } else {
        this.setData({ showLoginForm: true });
      }
    } catch (err) {
      // console.error('Check login status failed:', err);
      // 显示错误提示
      wx.showToast({
        title: err.message || '登录已过期，请重新登录',
        icon: 'none',
        duration: 2000
      });
      this.setData({ showLoginForm: true });
    }
  },

  // 设置全局数据
  // 登录成功后的处理
  setGlobalData(response) {
    // console.log('设置全局数据', response);
    // 更新全局数据
    app.globalData.userInfo = response;
    app.globalData.isGrid = response.role === '网格员';
    app.globalData.isArea = response.role === '片区长';
    
    // 存储用户信息
    wx.setStorageSync('auth_token', response.token);
    wx.setStorageSync('userInfo', response);
    wx.setStorageSync('userRole', response.role);

    //console.log('Stored token:', response.token);
    //console.log('Stored userInfo:', response);
    //console.log('Stored userRole:', response.role);
  },

  // 根据角色跳转
  redirectByRole(role) {
    // 根据角色跳转到对应页面
    switch (role) {
      case '网格员':
        wx.reLaunch({
          url: '/pages/grid/index'
        });
        break;
      case '片区长':
        wx.reLaunch({
          url: '/pages/admin/workorder/create'
        });
        break;
      default:
        wx.reLaunch({
          url: '/pages/user/workorder/create'
        });
    }
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
      // console.error('Get user info failed:', err);
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
      this.redirectByRole(response.role);
    } catch (err) {
      // console.error('WX login failed:', err);
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
      this.redirectByRole(response.role);
    } catch (err) {
      //  console.error('Admin login failed:', err);
      wx.showToast({
        title: err.message || '登录失败',
        icon: 'none'
      });
    } finally {
      this.setData({ isLoading: false });
    }
  }
  
}) 
