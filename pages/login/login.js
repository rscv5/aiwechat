import authService from '../../services/auth';
import permission from '../../utils/permission';
import auth from '../../utils/auth';

const app = getApp()

Page({
  data: {
    isAdminLogin: false, // 是否是管理员登录
    username: '',
    password: '',
    loading: false,
    isLoading: false,
    showLoginForm: false
  },

  onLoad() {
    // 检查是否已登录
    const token = wx.getStorageSync('token');
    if (token) {
      // 已登录，根据角色跳转到对应的随手拍页面
      this.redirectByRole();
      return;
    }
    
    // 未登录，显示登录界面
    this.setData({
      showLoginForm: true
    });
  },

  // 根据角色跳转到对应的随手拍页面
  redirectByRole() {
    const role = auth.getUserRole();
    switch (role) {
      case '网格员':
        wx.redirectTo({
          url: '/pages/grid/index'
        });
        break;
      case '片区长':
        wx.redirectTo({
          url: '/pages/admin/workorder/create'
        });
        break;
      default:
        wx.redirectTo({
          url: '/pages/user/workorder/create'
        });
    }
  },

  // 切换登录方式
  switchLoginType() {
    this.setData({
      isAdminLogin: !this.data.isAdminLogin
    });
  },

  // 输入用户名
  onUsernameInput(e) {
    this.setData({
      username: e.detail.value
    });
  },

  // 输入密码
  onPasswordInput(e) {
    this.setData({
      password: e.detail.value
    });
  },

  // 微信登录
  handleWxLogin() {
    this.setData({ isLoading: true });
    
    wx.login({
      success: (res) => {
        if (res.code) {
          // 发送code到后端
          wx.request({
            url: 'http://localhost:8080/api/user/login',
            method: 'POST',
            data: {
              code: res.code
            },
            success: (response) => {
              if (response.data.token) {
                // 保存token和用户角色
                wx.setStorageSync('token', response.data.token);
                wx.setStorageSync('userRole', response.data.role);
                
                // 跳转到对应的随手拍页面
                this.redirectByRole();
              } else {
                wx.showToast({
                  title: '登录失败',
                  icon: 'none'
                });
              }
            },
            fail: () => {
              wx.showToast({
                title: '网络错误',
                icon: 'none'
              });
            },
            complete: () => {
              this.setData({ isLoading: false });
            }
          });
        }
      }
    });
  },

  // 管理员登录
  handleAdminLogin() {
    const { username, password } = this.data;
    if (!username || !password) {
      wx.showToast({
        title: '请输入用户名和密码',
        icon: 'none'
      });
      return;
    }

    this.setData({ isLoading: true });

    wx.request({
      url: 'http://localhost:8080/api/grid/login',
      method: 'POST',
      data: {
        username: username,
        password: password
      },
      success: (res) => {
        if (res.data.token) {
          // 保存token和用户角色
          wx.setStorageSync('token', res.data.token);
          wx.setStorageSync('userRole', res.data.role);
          
          // 跳转到对应的随手拍页面
          this.redirectByRole();
        } else {
          wx.showToast({
            title: '登录失败',
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      },
      complete: () => {
        this.setData({ isLoading: false });
      }
    });
  }
}) 