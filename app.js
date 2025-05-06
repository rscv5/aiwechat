// app.js
import { userApi } from './services/api'

App({
  // 全局数据管理
  globalData: {
    communityInfo: {
      name: '明发社区',
      address: '示例地址',
      description: '智慧社区示范点'
    },
    userInfo: null,
    isGrid: false,
    isArea: false,
    user: null
  },

  // 小程序启动时触发 
  // 生命周期函数
  onLaunch() {
    // 检查登录状态
    const token = wx.getStorageSync('token')
    if (token) {
      this.getUserInfo()
    }
  },

  // 网格员/片区长登录
  gridLogin(username, password) {
    return new Promise((resolve, reject) => {
      userApi.gridLogin(username, password)
        .then(user => {
          if (!user || !user.role) {
            throw new Error('用户信息不完整')
          }
          
          // 设置用户角色
          this.globalData.userInfo = user
          this.globalData.isGrid = user.role === '网格员'
          this.globalData.isArea = user.role === '片区长'
          
          // 存储用户信息
          wx.setStorageSync('token', user.openid)
          wx.setStorageSync('userInfo', user)
          wx.setStorageSync('userRole', user.role)
          
          // 根据角色跳转到对应页面
          if (this.globalData.isGrid) {
            wx.switchTab({
              url: '/pages/grid/home/home'
            })
          } else if (this.globalData.isArea) {
            wx.switchTab({
              url: '/pages/area/home/home'
            })
          }
          
          resolve(user)
        })
        .catch(err => {
          console.error('Grid login failed:', err)
          wx.showToast({
            title: err.message || '登录失败',
            icon: 'none'
          })
          reject(err)
        })
    })
  },

  // 用户登录
  userLogin() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (res.code) {
            userApi.userLogin(res.code)
              .then(user => {
                if (!user || !user.role) {
                  throw new Error('用户信息不完整')
                }
                
                // 设置用户角色
                this.globalData.userInfo = user
                this.globalData.isGrid = false
                this.globalData.isArea = false
                
                // 存储用户信息
                wx.setStorageSync('token', user.openid)
                wx.setStorageSync('userInfo', user)
                wx.setStorageSync('userRole', user.role)
                
                // 跳转到用户首页
                wx.switchTab({
                  url: '/pages/user/home/home'
                })
                
                resolve(user)
              })
              .catch(err => {
                console.error('User login failed:', err)
                wx.showToast({
                  title: err.message || '登录失败',
                  icon: 'none'
                })
                reject(err)
              })
          } else {
            reject(new Error('获取登录凭证失败'))
          }
        },
        fail: (err) => {
          console.error('wx.login failed:', err)
          reject(err)
        }
      })
    })
  },

  // 获取用户信息
  getUserInfo() {
    const token = wx.getStorageSync('token')
    if (!token) {
      return Promise.reject(new Error('未登录'))
    }

    return new Promise((resolve, reject) => {
      userApi.getUserInfo(token)
        .then(user => {
          if (!user || !user.role) {
            throw new Error('用户信息不完整')
          }
          
          // 设置用户角色
          this.globalData.userInfo = user
          this.globalData.isGrid = user.role === '网格员'
          this.globalData.isArea = user.role === '片区长'
          
          // 更新存储的用户信息
          wx.setStorageSync('userInfo', user)
          wx.setStorageSync('userRole', user.role)
          
          resolve(user)
        })
        .catch(err => {
          console.error('Get user info failed:', err)
          // 清除无效的登录状态
          wx.removeStorageSync('token')
          wx.removeStorageSync('userInfo')
          wx.removeStorageSync('userRole')
          this.globalData.userInfo = null
          this.globalData.isGrid = false
          this.globalData.isArea = false
          reject(err)
        })
    })
  },

  // 检查用户角色
  checkUserRole() {
    const userRole = wx.getStorageSync('userRole')
    if (!userRole) {
      return null
    }
    
    this.globalData.isGrid = userRole === '网格员'
    this.globalData.isArea = userRole === '片区长'
    
    return userRole
  },

  onShow() {
    // 小程序显示时触发
  },

  onHide() {
    // 小程序隐藏时触发
  }
})
