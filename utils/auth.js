const { userApi } = require('../services/api');

// 检查登录状态
const checkLogin = () => {
  const token = wx.getStorageSync('auth_token');
  console.log('checkLogin - 当前token:', token);
  if (!token) {
    //console.log('》》》No token found, redirecting to login page');
    wx.reLaunch({
      url: '/pages/login/login'
    });
    return false;
  }
  return true;
};

// 获取用户角色
const getUserRole = () => {
  const role = wx.getStorageSync('userRole') || '普通用户';
  console.log('getUserRole - 当前角色:', role);
  return role;
};

// 重定向到工单页面
const redirectToWorkorder = () => {
  const role = getUserRole();
  console.log('redirectToWorkorder - 重定向到工单页面，角色:', role);
  switch (role) {
    case '网格员':
      wx.reLaunch({
        url: '/pages/grid/workorder/list'
      });
      break;
    case '片区长':
      wx.reLaunch({
        url: '/pages/captain/workorder/list'
      });
      break;
    default:
      wx.reLaunch({
        url: '/pages/user/workorder/list'
      });
  }
};

// 根据角色重定向
const redirectByRole = (role) => {
  console.log('redirectByRole - 根据角色重定向，角色:', role);
  switch (role) {
    case '网格员':
      wx.reLaunch({
        url: '/pages/grid/workorder/list'
      });
      break;
    case '片区长':
      wx.reLaunch({
        url: '/pages/captain/workorder/list'
      });
      break;
    default:
      wx.reLaunch({
        url: '/pages/user/workorder/list'
      });
  }
};

// 检查登录状态并重定向
const checkLoginAndRedirect = async () => {
  console.log('=== checkLoginAndRedirect 开始 ===');
  const token = wx.getStorageSync('auth_token');
  const userInfo = wx.getStorageSync('userInfo');
  const userRole = wx.getStorageSync('userRole');

  console.log('当前存储状态:', {
    token: token ? '存在' : '不存在',
    userInfo: userInfo ? '存在' : '不存在',
    userRole: userRole ? '存在' : '不存在'
  });

  // 如果没有 token，直接跳转到登录页
  if (!token) {
    console.log('没有token，跳转到登录页');
    wx.reLaunch({
      url: '/pages/login/login'
    });
    return false;
  }

  // 如果已经有完整的用户信息，直接返回 true
  if (userInfo && userRole) {
    console.log('已有完整用户信息，直接返回');
    return true;
  }

  // 如果有 token 但没有用户信息，尝试获取用户信息
  try {
    console.log('开始获取用户信息');
    const response = await userApi.getUserInfo(token);
    console.log('获取用户信息成功:', response);

    if (response && response.role) {
      // 保存用户信息到本地存储
      console.log('保存用户信息到本地存储');
      wx.setStorageSync('userInfo', response);
      wx.setStorageSync('userRole', response.role);
      // 确保 token 被正确保存
      wx.setStorageSync('auth_token', token);
      return true;
    }
    throw new Error('用户信息不完整');
  } catch (err) {
    console.error('获取用户信息失败:', err);
    // 获取用户信息失败时，清除所有存储
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