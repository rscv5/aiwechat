import authService from '../services/auth';

/**
 * 权限检查工具
 */
const permission = {
  /**
   * 检查用户是否有权限访问页面
   * @param {string} requiredRole 需要的角色
   * @returns {boolean} 是否有权限
   */
  checkPagePermission(requiredRole) {
    const userRole = authService.getUserRole();
    
    // 角色权限等级
    const roleLevel = {
      '普通用户': 1,
      '网格员': 2,
      '片区长': 3
    };

    // 如果用户角色等级大于等于需要的角色等级，则有权限
    return roleLevel[userRole] >= roleLevel[requiredRole];
  },

  /**
   * 页面权限检查中间件
   * @param {string} requiredRole 需要的角色
   * @param {Function} onSuccess 有权限时的回调
   * @param {Function} onFail 无权限时的回调
   */
  pageGuard(requiredRole, onSuccess, onFail) {
    if (!authService.isLoggedIn()) {
      // 未登录，跳转到登录页
      wx.redirectTo({
        url: '/pages/login/login'
      });
      return;
    }

    if (this.checkPagePermission(requiredRole)) {
      onSuccess && onSuccess();
    } else {
      onFail && onFail();
      // 无权限，跳转到首页
      wx.redirectTo({
        url: '/pages/index/index'
      });
    }
  },

  /**
   * 根据用户角色获取首页路径
   * @returns {string} 首页路径
   */
  getHomePage() {
    const role = authService.getUserRole();
    switch (role) {
      case '网格员':
        return '/pages/grid/index';
      case '片区长':
        return '/pages/admin/index';
      default:
        return '/pages/user/index';
    }
  }
};

export default permission; 