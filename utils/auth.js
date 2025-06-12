// const { userApi } = require('../services/api'); // 移除此行

// JWT解析函数 (与workOrderDetail.js中的相同，确保一致性)
function parseJwt(token) {
  if (!token) return null;
  try {
    const base664Url = token.split('.')[1];
    const base64 = base664Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Error parsing JWT token:", e);
    return null;
  }
}

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

  // 如果已经有完整的用户信息，直接返回true，不进行跳转
  // 让调用方决定是否需要跳转
  if (userInfo && userRole) {
    console.log('已有完整用户信息，返回true');
    return true;
  }

  // 如果有 token 但没有用户信息，尝试获取用户信息
  try {
    console.log('开始获取用户信息');
    const response = await userApi.getUserInfo(token);
    console.log('获取用户信息成功:', response);

    if (response) {
      // 保存用户信息到本地存储
      const role = response.role || '普通用户';
      console.log('保存用户信息到本地存储，角色:', role);
      wx.setStorageSync('userInfo', response);
      wx.setStorageSync('userRole', role);
      // 确保 token 被正确保存
      wx.setStorageSync('auth_token', token);
      return true;
    }
    
    console.log('用户信息不完整，清除token并跳转登录页');
    wx.removeStorageSync('auth_token');
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('userRole');
    wx.reLaunch({
      url: '/pages/login/login'
    });
    return false;
  } catch (err) {
    console.error('获取用户信息失败:', err);
    // 只有在确认是token过期时才清除存储
    if (err.message?.includes('登录已过期') || err.message?.includes('token无效')) {
      wx.removeStorageSync('auth_token');
      wx.removeStorageSync('userInfo');
      wx.removeStorageSync('userRole');
    }
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