const auth = require('../../utils/auth');
const { userApi } = require('../../services/api');

Page({
  data: {
    isLoading: true
  },

  onLoad() {
    this.checkLoginAndRedirect();
  },

  onShow() {
    this.checkLoginAndRedirect();
  },

  // 检查登录状态并重定向
  async checkLoginAndRedirect() {
    this.setData({ isLoading: true });
    
    try {
      const token = wx.getStorageSync('auth_token');
      const userInfo = wx.getStorageSync('userInfo');
      const userRole = wx.getStorageSync('userRole');

      // 如果没有 token 或用户信息，跳转到登录页
      if (!token || !userInfo || !userRole) {
        //console.log('No login info found, redirecting to login page');
        wx.reLaunch({
          url: '/pages/login/login'
        });
        return;
      }

      // 验证 token 有效性
      try {
        const response = await userApi.getUserInfo(token);
        if (response && response.role) {
          // token 有效，根据角色跳转
          this.redirectByRole(response.role);
        } else {
          throw new Error('用户信息不完整');
        }
      } catch (err) {
        //console.error('Token validation failed:', err);
        // token 无效，清除登录状态并跳转到登录页
        wx.removeStorageSync('auth_token');
        wx.removeStorageSync('userInfo');
        wx.removeStorageSync('userRole');
        wx.redirectTo({
          url: '/pages/login/login'
        });
      }
    } catch (err) {
      //console.error('Check login status failed:', err);
      wx.showToast({
        title: '登录状态检查失败',
        icon: 'none',
        duration: 2000
      });
    } finally {
      this.setData({ isLoading: false });
    }
  },

  // 根据角色跳转到对应页面
  redirectByRole(role) {
    console.log('Redirecting by role:', role);
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
  }
})