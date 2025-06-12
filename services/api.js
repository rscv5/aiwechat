import config from '../config/api';

// API接口服务

// 工单相关接口
export const workOrderApi = {
  // 提交工单
  submitWorkOrder: (data) => {
    const app = getApp();
    return app.call({
      path: '/api/workorder/submit',
      method: 'POST',
      data: data
    });
  },
  
  // 获取工单列表
  getWorkOrders: () => {
    const app = getApp();
    return app.call({
      path: '/api/workorder/list',
      method: 'GET'
    });
  },

  // 获取工单详情
  getWorkOrderDetail: (workId) => {
    const app = getApp();
    return app.call({
      path: `/api/workorder/${workId}`,
      method: 'GET'
    });
  }
}

// 用户相关接口
export const userApi = {
  // 网格员/片区长登录
  gridLogin: async (phoneNumber, password) => {
    console.log('Grid login request:', { phoneNumber, password });
    const app = getApp();
    const res = await app.call({
      path: '/api/grid/login',
      method: 'POST',
      data: {
        username: phoneNumber, // 后端接口使用 username 字段接收手机号
        password: password
      }
    });
    console.log('Grid login response:', res);
    // res 现在直接是业务数据，因为 app.call 已经处理了 statusCode 和 code
    return res; 
  },

  // 用户登录
  userLogin: async (code) => {
    const app = getApp();
    const res = await app.call({
      path: '/api/user/login',
      method: 'POST',
      data: {
        code: code
      },
      header: {
        'Accept': 'application/json'
      }
    });
    console.log('User login response:', res);
    // res 现在直接是业务数据，因为 app.call 已经处理了 statusCode 和 code

    // 确保响应中包含 token
    if (!res.token && !res.accessToken) {
      console.error('登录响应中没有token:', res);
      throw new Error('登录响应数据不完整');
    }
    
    // 保存 token
    const token = res.token || res.accessToken;
    wx.setStorageSync('auth_token', token);
    
    // 如果响应中包含 openid，则保存它
    if (res.openid) {
      wx.setStorageSync('user_openid', res.openid);
      console.log('保存的openid:', res.openid);
    }
    
    console.log('保存的token:', token);
    return res; // 返回业务数据
  },
  
  // 获取用户信息
  getUserInfo: async () => {
    console.log('=== 开始获取用户信息 ===');
    const app = getApp();
    // token 由 app.call 内部的 header 统一处理，无需在这里手动传入
    const res = await app.call({
      path: '/api/user/info',
      method: 'GET',
      header: {
        'Accept': 'application/json'
      }
    });
    console.log('Get user info response:', res);
    // res 现在直接是业务数据
    return res;
  },

  // 刷新 token
  refreshToken: async () => {
    const refreshToken = wx.getStorageSync('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token');
    }
    const app = getApp();
    const response = await app.call({
      path: '/api/auth/refresh',
      method: 'POST',
      data: { refreshToken }
    });
    return response.token;
  }
}

/**
 * 网格员提交工单反馈
 * @param {Object} params
 * @param {number} params.workId 工单ID
 * @param {string} params.handledDesc 处理说明
 * @param {Array<string>} params.handledImages 处理图片URL数组
 * @returns Promise
 */
export function submitFeedback({ workId, handledDesc, handledImages }) {
  const app = getApp();
  return app.call({
    path: '/api/gridworker/feedback',
    method: 'POST',
    data: {
      workId,
      handledDesc,
      handledImages
    }
  });
}

