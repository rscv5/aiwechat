import request from '../utils/request'
// API接口服务
// 社区相关接口
export const communityApi = {
  // 获取社区信息
  getCommunityInfo: () => {
    return request({
      url: '/community/info',
      method: 'GET'
    })
  },
  
  // 获取社区公告
  getNotices: () => {
    return request({
      url: '/community/notices',
      method: 'GET'
    })
  },
  
  // 获取社区活动
  getActivities: () => {
    return request({
      url: '/community/activities',
      method: 'GET'
    })
  }
}

// 工单相关接口
export const workOrderApi = {
  // 提交工单
  submitWorkOrder: (data) => {
    return request({
      url: '/workorder/submit',
      method: 'POST',
      data
    })
  },
  
  // 获取工单列表
  getWorkOrders: () => {
    return request({
      url: '/workorder/list',
      method: 'GET'
    })
  }
}

// 用户相关接口
const baseUrl = 'http://localhost:8080'

export const userApi = {
  // 网格员/片区长登录
  gridLogin: (username, password) => {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${baseUrl}/api/grid/login`,
        method: 'POST',
        header: {
          'content-type': 'application/json',
          'Accept': 'application/json'
        },
        data: {
          username: username,
          password: password
        },
        success: (res) => {
          console.log('Grid login response:', res)
          if (res.statusCode === 200) {
            resolve(res.data)
          } else {
            reject(new Error(res.data.message || '登录失败'))
          }
        },
        fail: (err) => {
          console.error('Grid login request failed:', err)
          reject(new Error(err.errMsg || '网络请求失败'))
        }
      })
    })
  },

  // 用户登录
  userLogin: (openid) => {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${baseUrl}/api/user/login`,
        method: 'POST',
        header: {
          'content-type': 'application/json',
          'Accept': 'application/json'
        },
        data: {
          openid: openid
        },
        success: (res) => {
          console.log('User login response:', res)
          if (res.statusCode === 200) {
            resolve(res.data)
          } else {
            reject(new Error(res.data.message || '登录失败'))
          }
        },
        fail: (err) => {
          console.error('User login request failed:', err)
          reject(new Error(err.errMsg || '网络请求失败'))
        }
      })
    })
  },

  // 获取用户信息
  getUserInfo: (openid) => {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${baseUrl}/api/user/info`,
        method: 'GET',
        header: {
          'Accept': 'application/json'
        },
        data: {
          openid: openid
        },
        success: (res) => {
          console.log('Get user info response:', res)
          if (res.statusCode === 200) {
            resolve(res.data)
          } else {
            reject(new Error(res.data.message || '获取用户信息失败'))
          }
        },
        fail: (err) => {
          console.error('Get user info request failed:', err)
          reject(new Error(err.errMsg || '网络请求失败'))
        }
      })
    })
  }
} 