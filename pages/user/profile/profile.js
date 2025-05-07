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

  getUserInfo: function() {
    // 获取用户信息
    wx.request({
      url: 'http://localhost:8080/api/user/info',
      method: 'GET',
      header: {
        'Authorization': 'Bearer ' + wx.getStorageSync('auth_token')
      },
      success: (res) => {
        if (res.data.code === 200) {
          this.setData({
            userInfo: res.data.data,
            hasUserInfo: true
          });
        }
      }
    });
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