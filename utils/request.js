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

    try {
      const res = await wx.request(config);
      
      // 处理响应
      if (res.statusCode === 200) {
        return res.data;
      } else if (res.statusCode === 401) {
        // token过期，清除登录状态
        authService.clearAuth();
        // 跳转到登录页
        wx.redirectTo({
          url: '/pages/login/login'
        });
        throw new Error('登录已过期，请重新登录');
      } else {
        throw new Error(res.data.message || '请求失败');
      }
    } catch (error) {
      console.error('请求失败:', error);
      throw error;
    }
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