import authService from '../services/auth';
import config from '../config/api';

// 基础URL (对于wx.cloud.callContainer不再需要，但如果还有wx.request调用可以保留)
// const BASE_URL = config.baseURL;

/**
 * 请求工具类
 */
const request = {
  /**
   * 发送请求
   * @param {Object} options 请求配置
   * @returns {Promise} 请求结果
   */
  async request(options) {
    // 合并配置
    const requestConfig = {
      // 对于 wx.cloud.callContainer，这里是后端服务的相对路径，不是完整URL
      path: options.url,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'content-type': 'application/json',
        'X-WX-SERVICE': config.cloudServiceName,
        ...options.header
      }
    };

    // 添加token
    const token = authService.getToken();
    if (token) {
      requestConfig.header.Authorization = `Bearer ${token}`;
    }

    // 用 Promise 包装 wx.cloud.callContainer
    return new Promise((resolve, reject) => {
      if (!config.cloudEnvId) {
        console.error('Cloud Environment ID is not configured.');
        return reject(new Error('云环境ID未配置'));
      }
      
      wx.cloud.callContainer({
        config: {
          env: config.cloudEnvId // 使用配置的云环境ID
        },
        ...requestConfig,
        success: (res) => {
          // wx.cloud.callContainer 的响应格式是 res.data 中包含业务数据
          if (res.statusCode === 200) {
            // 业务数据通常在 res.data.data 中，或直接在 res.data 中
            // 假设后端返回的数据结构是 { code: 200, data: ..., msg: ... }
            if (res.data && res.data.code === 200) {
              // 成功时，总是返回整个 Result 对象，而不是尝试解构其内部的data字段
              resolve(res.data);
            } else if (res.data && res.data.code === 401) {
              authService.clearAuth();
              wx.redirectTo({
                url: '/pages/login/login'
              });
              reject(new Error(res.data.msg || '登录已过期，请重新登录'));
            } else {
              const error = new Error(res.data?.msg || '请求失败');
              error.response = res;
              reject(error);
            }
          } else if (res.statusCode === 401) {
            authService.clearAuth();
            wx.redirectTo({
              url: '/pages/login/login'
            });
            reject(new Error('登录已过期，请重新登录'));
          } else {
            const error = new Error(res.errMsg || '请求失败');
            error.response = res;
            reject(error);
          }
        },
        fail: (err) => {
          reject(new Error(err.errMsg || '网络请求失败，请稍后重试'));
        }
      });
    });
  },

  /**
   * GET请求
   * @param {string} url 请求地址
   * @param {Object} data 请求参数
   * @param {Object} options 其他配置
   * @returns {Promise} 请求结果
   */
  get(url, data = {}, options = {}) {
    return this.request({
      url,
      method: 'GET',
      data,
      ...options
    });
  },

  /**
   * POST请求
   * @param {string} url 请求地址
   * @param {Object} data 请求参数
   * @param {Object} options 其他配置
   * @returns {Promise} 请求结果
   */
  post(url, data = {}, options = {}) {
    return this.request({
      url,
      method: 'POST',
      data,
      ...options
    });
  },

  /**
   * PUT请求
   * @param {string} url 请求地址
   * @param {Object} data 请求参数
   * @param {Object} options 其他配置
   * @returns {Promise} 请求结果
   */
  put(url, data = {}, options = {}) {
    return this.request({
      url,
      method: 'PUT',
      data,
      ...options
    });
  },

  /**
   * DELETE请求
   * @param {string} url 请求地址
   * @param {Object} data 请求参数
   * @param {Object} options 其他配置
   * @returns {Promise} 请求结果
   */
  delete(url, data = {}, options = {}) {
    return this.request({
      url,
      method: 'DELETE',
      data,
      ...options
    });
  }
};

export default request; 