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
export const userApi = {
  // 用户登录
  login: (data) => {
    return request({
      url: '/user/login',
      method: 'POST',
      data
    })
  },
  
  // 获取用户信息
  getUserInfo: () => {
    return request({
      url: '/user/info',
      method: 'GET'
    })
  }
} 