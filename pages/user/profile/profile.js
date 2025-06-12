import config from '../../../config/api';
Page({
  data: {
    userInfo: null,
    hasUserInfo: false
  },

  onLoad: function() {
    // 检查是否已经登录
    const token = wx.getStorageSync('auth_token');
    if (token) {
      this.getUserInfo();
    } else {
      wx.navigateTo({
        url: '/pages/login/login'
      });
    }
  },

  getUserInfo: async function() {
    // 获取用户信息
    try {
      const app = getApp();
      const res = await app.call({
        path: '/api/user/info',
        method: 'GET',
      });

      // app.call 成功返回的是业务数据，无需再判断 statusCode 和 code
      if (res) {
        this.setData({
          userInfo: res,
          hasUserInfo: true
        });
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      wx.showToast({
        title: error.message || '获取用户信息失败',
        icon: 'none',
        duration: 2000
      });
    }
  },

  // 退出登录
  logout: function() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync();
          wx.reLaunch({
            url: '/pages/login/login'
          });
        }
      }
    });
  }
}); 