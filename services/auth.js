// 认证服务
const authService = {
  // 存储用户信息的key
  USER_INFO_KEY: 'user_info',
  TOKEN_KEY: 'auth_token',

  /**
   * 微信登录
   * @returns {Promise} 登录结果
   */
  async wxLogin() {
    try {
      // 获取微信登录code
      const { code } = await wx.login();
      
      // 调用后端登录接口
      const res = await wx.request({
        url: 'http://localhost:8080/api/user/login',
        method: 'POST',
        data: { code },
        header: {
          'content-type': 'application/json'
        }
      });

      if (res.statusCode === 200) {
        // 保存用户信息和token
        this.saveUserInfo(res.data.data.user);
        this.saveToken(res.data.data.token);
        return res.data.data;
      } else {
        throw new Error(res.data.message || '登录失败');
      }
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    }
  },

  /**
   * 管理员登录
   * @param {string} username 用户名
   * @param {string} password 密码
   * @returns {Promise} 登录结果
   */
  async adminLogin(username, password) {
    try {
      const res = await wx.request({
        url: 'http://localhost:8080/api/grid/login',
        method: 'POST',
        data: { username, password },
        header: {
          'content-type': 'application/json'
        }
      });

      if (res.statusCode === 200) {
        this.saveUserInfo(res.data.data.user);
        this.saveToken(res.data.data.token);
        return res.data.data;
      } else {
        throw new Error(res.data.message || '登录失败');
      }
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    }
  },

  /**
   * 保存用户信息到本地存储
   * @param {Object} userInfo 用户信息
   */
  saveUserInfo(userInfo) {
    wx.setStorageSync(this.USER_INFO_KEY, userInfo);
  },

  /**
   * 获取用户信息
   * @returns {Object} 用户信息
   */
  getUserInfo() {
    return wx.getStorageSync(this.USER_INFO_KEY);
  },

  /**
   * 保存token到本地存储
   * @param {string} token JWT token
   */
  saveToken(token) {
    wx.setStorageSync(this.TOKEN_KEY, token);
  },

  /**
   * 获取token
   * @returns {string} JWT token
   */
  getToken() {
    return wx.getStorageSync(this.TOKEN_KEY);
  },

  /**
   * 清除用户信息和token
   */
  clearAuth() {
    wx.removeStorageSync(this.USER_INFO_KEY);
    wx.removeStorageSync(this.TOKEN_KEY);
  },

  /**
   * 检查是否已登录
   * @returns {boolean} 是否已登录
   */
  isLoggedIn() {
    return !!this.getToken() && !!this.getUserInfo();
  },

  /**
   * 获取用户角色
   * @returns {string} 用户角色
   */
  getUserRole() {
    const userInfo = this.getUserInfo();
    return userInfo ? userInfo.role : null;
  }
};

export default authService; 