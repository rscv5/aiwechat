import authService from '../services/auth';

// 基础URL
const BASE_URL = 'http://localhost:8080';

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
    const config = {
      url: options.url.startsWith('http') ? options.url : `${BASE_URL}${options.url}`,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'content-type': 'application/json',
        ...options.header
      }
    };

    // 添加token
    const token = authService.getToken();
    if (token) {
      config.header.Authorization = `Bearer ${token}`;
    }

    // 用 Promise 包装 wx.request
    return new Promise((resolve, reject) => {
      wx.request({
        ...config,
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else if (res.statusCode === 401) {
            authService.clearAuth();
            wx.redirectTo({
              url: '/pages/login/login'
            });
            reject(new Error('登录已过期，请重新登录'));
          } else {
            const error = new Error(res.data?.message || '请求失败');
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