import request from '../utils/request'
import config from '../config/api';

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
  submitWorkOrder: (data) => request.post('/api/workorder/submit', data),
  
  // 获取工单列表
  getWorkOrders: () => request.get('/api/workorder/list'),

  // 获取工单详情
  getWorkOrderDetail: (workId) => request.get(`/api/workorder/${workId}`)
}

// 用户相关接口
//const baseUrl = 'http://127.0.0.1:8080'
const baseUrl = config.baseURL;

export const userApi = {
  // 网格员/片区长登录
  gridLogin: (phoneNumber, password) => {
    console.log('Grid login request:', { phoneNumber, password });
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${baseUrl}/api/grid/login`,
        method: 'POST',
        data: {
          username: phoneNumber, // 后端接口使用 username 字段接收手机号
          password: password
        },
        header: {
          'Content-Type': 'application/json'
        },
        success: (res) => {
          console.log('Grid login response:', res);
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            reject(new Error(res.data || '登录失败'));
          }
        },
        fail: (err) => {
          console.error('Grid login request failed:', err);
          reject(new Error('网络请求失败'));
        }
      });
    });
  },

  // 用户登录
  userLogin: (code) => {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${baseUrl}/api/user/login`,
      method: 'POST',
        header: {
          'content-type': 'application/json',
          'Accept': 'application/json'
        },
        data: {
          code: code
        },
        success: (res) => {
          console.log('User login response:', res);
          if (res.statusCode === 200 && res.data) {
            // 确保响应中包含 token
            if (!res.data.token && !res.data.accessToken) {
              console.error('登录响应中没有token:', res.data);
              reject(new Error('登录响应数据不完整'));
              return;
            }
            
            // 保存 token
            const token = res.data.token || res.data.accessToken;
            wx.setStorageSync('auth_token', token);
            
            // 如果响应中包含 openid，则保存它
            if (res.data.openid) {
              wx.setStorageSync('user_openid', res.data.openid);
              console.log('保存的openid:', res.data.openid);
            }
            
            console.log('保存的token:', token);
            resolve(res.data);
          } else {
            reject(new Error(res.data?.message || '登录失败'));
          }
        },
        fail: (err) => {
          console.error('User login request failed:', err);
          reject(new Error(err.errMsg || '网络请求失败'));
        }
      });
    });
  },
  
  // 获取用户信息
  getUserInfo: (token) => {
    console.log('请求获取用户信息前的Token:', token);
    console.log('=== 开始获取用户信息 ===');
    console.log('1. 请求前的Token:', token);
    console.log('2. 请求URL:', `${baseUrl}/api/user/info`);
    console.log('3. 请求头:', {
       'content-type': 'application/json',
       'Accept': 'application/json',
       'Authorization': `Bearer ${token}`
    });

    return new Promise((resolve, reject) => {
      wx.request({
        url: `${baseUrl}/api/user/info`,
        method: 'GET',
        header: {
          'content-type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        success: (res) => {
          console.log('Get user info response:', res)
          console.log('4. 响应状态码:', res.statusCode);
          console.log('5. 响应数据:', res.data);
          console.log('6. 响应头:', res.header);
          if (res.statusCode === 200 && res.data) {
            console.log('7. 请求成功，返回数据');
            resolve(res.data)
          } else if (res.statusCode === 403) {
            console.log('7. 请求失败,状态码403');
            console.log('8. 错误信息:', res.data);
            // 只有在确认是 token 过期时才清除
            if (res.data?.message?.includes('token expired')) {
              console.log('9. 清除token');
              wx.removeStorageSync('auth_token')
              wx.removeStorageSync('userInfo')
              wx.removeStorageSync('userRole')
            }
            reject(new Error('登录已过期，请重新登录'))
          } else {
            console.log('7. 请求失败,其他错误');
            reject(new Error(res.data?.message || '获取用户信息失败'))
          }
        },
        fail: (err) => {
          console.log('4. 请求失败:', err);
          //console.error('Get user info request failed:', err)
          reject(new Error(err.errMsg || '网络请求失败'))
        }
      })
    })
  },

  // 刷新 token
  refreshToken: async () => {
    const refreshToken = wx.getStorageSync('refresh_token');
    // 如果refresh_token不存在，则抛出错误
    if (!refreshToken) {
      throw new Error('No refresh token');
    }
    // 发送刷新token的请求
    const response = await request({    
      url: '/api/auth/refresh',
      method: 'POST',
      data: { refreshToken }
    });
    // 返回新的token
    return response.token;
  }
} 

// 网格员相关接口

/**
 * 网格员提交工单反馈
 * @param {Object} params
 * @param {number} params.workId 工单ID
 * @param {string} params.handledDesc 处理说明
 * @param {Array<string>} params.handledImages 处理图片URL数组
 * @returns Promise
 */
export function submitFeedback({ workId, handledDesc, handledImages }) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${baseUrl}/api/gridworker/feedback`, // 使用配置的baseURL
      method: 'POST',
      header: {
        'Authorization': 'Bearer ' + wx.getStorageSync('auth_token'),
        'Content-Type': 'application/json'
      },
      data: {
        workId,
        handledDesc,
        handledImages
      },
      success: resolve,
      fail: reject
    });
  });
}

