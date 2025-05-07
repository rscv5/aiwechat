const { userApi } = require('../services/api');

const checkLogin = () => {
  const token = wx.getStorageSync('auth_token');
  if (!token) {
    console.log('》》》No token found, redirecting to login page');
    wx.navigateTo({
      url: '/pages/login/login'
    });
    return false;
  }
  return true;
};

const getUserRole = () => {
  return wx.getStorageSync('userRole') || '普通用户';
};

const redirectToWorkorder = () => {
  const role = getUserRole();
  switch (role) {
    case '网格员':
      wx.navigateTo({
        url: '/pages/grid/workorder/create'
      });
      break;
    case '片区长':
      wx.navigateTo({
        url: '/pages/admin/workorder/create'
      });
      break;
    default:
      wx.navigateTo({
        url: '/pages/index/workorder/create'
      });
  }
};

// 新增：使用 reLaunch 的重定向方法
const redirectByRole = (role) => {
  switch (role) {
    case '网格员':
      wx.reLaunch({
        url: '/pages/grid/index'
      });
      break;
    case '片区长':
      wx.reLaunch({
        url: '/pages/admin/workorder/create'
      });
      break;
    default:
      wx.reLaunch({
        url: '/pages/user/workorder/create'
      });
  }
};

// 新增：统一的 token 验证和重定向方法
const checkLoginAndRedirect = async () => {
  const token = wx.getStorageSync('auth_token');
  const userInfo = wx.getStorageSync('userInfo');
  const userRole = wx.getStorageSync('userRole');

  if (!token || !userInfo || !userRole) {
    wx.reLaunch({
      url: '/pages/login/login'
    });
    return false;
  }

  try {
    const response = await userApi.getUserInfo(token);
    if (response && response.role) {
      redirectByRole(response.role);
      return true;
    }
    throw new Error('用户信息不完整');
  } catch (err) {
    wx.removeStorageSync('auth_token');
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('userRole');
    wx.reLaunch({
      url: '/pages/login/login'
    });
    return false;
  }
};

module.exports = {
  checkLogin,
  getUserRole,
  redirectToWorkorder,
  redirectByRole,
  checkLoginAndRedirect
}; 