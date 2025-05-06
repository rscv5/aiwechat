const checkLogin = () => {
  const token = wx.getStorageSync('token');
  if (!token) {
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

module.exports = {
  checkLogin,
  getUserRole,
  redirectToWorkorder
}; 