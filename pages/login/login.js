const app = getApp()

Page({
  data: {
    loginType: 'user', // 默认普通用户登录
    username: '',
    password: ''
  },

  onLoad: function() {
    // 检查是否已登录
    const token = wx.getStorageSync('token')
    if (token) {
      // 已登录，跳转到首页
      this.redirectToHome()
    }
  },

  // 切换登录类型
  switchLoginType: function(e) {
    const type = e.currentTarget.dataset.type
    this.setData({
      loginType: type,
      username: '',
      password: ''
    })
  },

  // 用户名输入
  onUsernameInput: function(e) {
    this.setData({
      username: e.detail.value
    })
  },

  // 密码输入
  onPasswordInput: function(e) {
    this.setData({
      password: e.detail.value
    })
  },

  // 普通用户登录
  userLogin: function() {
    wx.showLoading({
      title: '登录中...',
      mask: true
    })

    app.userLogin()
      .then(user => {
        wx.hideLoading()
        wx.showToast({
          title: '登录成功',
          icon: 'success'
        })
        this.redirectToHome()
      })
      .catch(err => {
        wx.hideLoading()
        wx.showToast({
          title: err.message || '登录失败',
          icon: 'none'
        })
      })
  },

  // 网格员/片区长登录
  gridLogin: function() {
    const { username, password, loginType } = this.data

    if (!username || !password) {
      wx.showToast({
        title: '请输入账号和密码',
        icon: 'none'
      })
      return
    }

    wx.showLoading({
      title: '登录中...',
      mask: true
    })

    app.gridLogin(username, password)
      .then(user => {
        wx.hideLoading()
        // 检查用户角色是否匹配
        if ((loginType === 'grid' && user.role === '网格员') || 
            (loginType === 'area' && user.role === '片区长')) {
          wx.showToast({
            title: '登录成功',
            icon: 'success'
          })
          this.redirectToHome()
        } else {
          wx.showToast({
            title: '账号类型不匹配',
            icon: 'none'
          })
        }
      })
      .catch(err => {
        wx.hideLoading()
        wx.showToast({
          title: err.message || '登录失败',
          icon: 'none'
        })
      })
  },

  // 跳转到首页
  redirectToHome: function() {
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo) {
      return
    }

    let targetPage = '/pages/user/index/index'
    if (userInfo.role === '网格员') {
      targetPage = '/pages/grid/index/index'
    } else if (userInfo.role === '片区长') {
      targetPage = '/pages/area/index/index'
    }

    wx.redirectTo({
      url: targetPage
    })
  }
}) 