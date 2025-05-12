const app = getApp();
const auth = require('../../../utils/auth');



Page({
  data: {
    activeTab: 0,
    tabs: ['全部', '待处理', '处理中', '已解决'], // 状态标签
    workOrders: [],
    isLoading: true,
    statusMap: {
      '未领取': { color: '#ff9800', text: '待处理' },
      '处理中': { color: '#2196f3', text: '处理中' },
      '已上报': { color: '#2196f3', text: '处理中' }, // 添加已上报状态映射
      '处理完': { color: '#4caf50', text: '已解决' }
    }, // 状态映射
    statusMapping: {
      '待处理': '未领取',
      '处理中': ['处理中', '已上报'], // 修改为数组，包含多个后端状态
      '已解决': '处理完'
    } // 状态映射 
  },

  // 页面加载时触发，只会触发一次
  onLoad() {
    console.log('=== 页面加载 onLoad ===');
    // 检查登录状态并加载数据
    this.checkLoginAndLoadData();
  },

  // 页面显示时触发，每次页面显示都会触发
  onShow() {
    console.log('=== 页面显示 onShow ===');
    // 获取当前存储的 token
    const token = wx.getStorageSync('auth_token');
    console.log('当前token:', token);
    
    // 如果有 token，说明用户已登录，直接加载数据
    if (token) {
      console.log('检测到token，开始加载数据');
      this.loadWorkOrders();
    } else {
      console.log('未检测到token，跳转到登录页');
      // 如果没有 token，跳转到登录页
      wx.reLaunch({
        url: '/pages/login/login'
      });
    }
  },

  // 下拉刷新时触发
  onPullDownRefresh() {
    console.log('=== 下拉刷新 ===');
    this.loadWorkOrders().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 检查登录状态并加载数据
  async checkLoginAndLoadData() {
    console.log('=== 检查登录状态并加载数据 ===');
    this.setData({ isLoading: true });
    
    try {
      // 调用 auth 模块检查登录状态
      const isLoggedIn = await auth.checkLoginAndRedirect();
      console.log('登录状态检查结果:', isLoggedIn);
      
      if (isLoggedIn) {
        // 如果已登录，加载工单数据
        console.log('用户已登录，开始加载工单数据');
        await this.loadWorkOrders();
      } else {
        console.log('用户未登录，跳转到登录页');
        // 如果未登录，跳转到登录页
        wx.reLaunch({
          url: '/pages/login/login'
        });
      }
    } catch (error) {
      console.error('登录检查出错:', error);
      wx.showToast({
        title: '登录状态检查失败',
        icon: 'none'
      });
    } finally {
      // 无论成功失败，都关闭加载状态
      this.setData({ isLoading: false });
    }
  },

  // 切换标签页
  onTabChange(e) {
    const index = e.currentTarget.dataset.index;
    console.log('切换标签页:', index);
    this.setData({ activeTab: index });
    this.loadWorkOrders();
  },

  // 加载工单列表
  async loadWorkOrders() {
    console.log('=== 开始加载工单列表 ===');
    try {
      const token = wx.getStorageSync('auth_token');
      const userOpenid = wx.getStorageSync('user_openid');
      let status = this.data.activeTab === 0 ? '全部' : this.data.tabs[this.data.activeTab];
      
      // 转换状态值为后端期望的值
      if (status !== '全部') {
        const mappedStatus = this.data.statusMapping[status];
        // 如果是数组，说明需要查询多个状态
        if (Array.isArray(mappedStatus)) {
          status = mappedStatus.join(',');
        } else {
          status = mappedStatus;
        }
      }
      
      console.log('请求参数:', {
        token: token ? '存在' : '不存在',
        userOpenid: userOpenid ? '存在' : '不存在',
        status: status,
        baseUrl: app.globalData.baseUrl
      });

      if (!userOpenid) {
        throw new Error('用户未登录或登录已过期，请重新登录');
      }
      
      const url = `${app.globalData.baseUrl}/api/workorder/user`;
      console.log('发送请求到:', url);
      
      // 使用Promise包装wx.request
      const requestPromise = new Promise((resolve, reject) => {
        wx.request({
          url: url,
          method: 'GET',
          header: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          data: {
            userOpenid: userOpenid,
            status: status
          },
          success: (res) => {
            console.log('请求成功，响应数据:', res);
            resolve(res);
          },
          fail: (err) => {
            console.error('请求失败:', err);
            reject(new Error(err.errMsg || '网络请求失败'));
          },
          complete: () => {
            console.log('请求完成');
          }
        });
      });

      const res = await requestPromise;
      console.log('请求响应:', res);

      if (!res) {
        throw new Error('网络请求失败，请检查网络连接');
      }

      if (res.statusCode === 200 && res.data && res.data.code === 200) {
        // 转换后端数据格式为前端所需格式
        const workOrders = res.data.data.map(order => {
          // 格式化时间
          const createTime = new Date(order.createdAt);
          const formattedTime = `${createTime.getFullYear()}-${String(createTime.getMonth() + 1).padStart(2, '0')}-${String(createTime.getDate()).padStart(2, '0')} ${String(createTime.getHours()).padStart(2, '0')}:${String(createTime.getMinutes()).padStart(2, '0')}`;
          
          // 截取描述内容，限制显示长度
          const description = order.description.length > 50 
            ? order.description.substring(0, 50) + '...' 
            : order.description;

          return {
            id: order.workId,
            description: description,
            status: this.data.statusMap[order.status]?.text || order.status,
            createTime: formattedTime,
            buildingInfo: order.buildingInfo || '未填写楼栋信息'
          };
        });

        this.setData({
          workOrders: workOrders
        });
        console.log('工单数据加载完成:', workOrders.length, '条记录');
      } else {
        console.error('请求失败:', {
          statusCode: res.statusCode,
          data: res.data
        });
        throw new Error(res.data?.message || '加载失败');
      }
    } catch (error) {
      console.error('加载工单失败:', error);
      console.error('错误详情:', {
        message: error.message,
        stack: error.stack
      });
      
      if (error.message.includes('未登录') || error.message.includes('登录已过期')) {
        // 如果是登录相关错误，跳转到登录页
        wx.reLaunch({
          url: '/pages/login/login'
        });
      } else {
        wx.showToast({
          title: (error && error.message) || (error && error.data && error.data.message) || '加载失败，请重试',
          icon: 'none',
          duration: 2000
        });
      }
    }
  },

  // 跳转到工单详情
  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    console.log('跳转到工单详情:', id);
    wx.navigateTo({
      url: `../../workOrderDetail/workOrderDetail?id=${id}`,
      fail: (err) => {
        console.error('跳转失败:', err);
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        });
      }
    });
  },

  // 跳转到新建工单
  goToCreate() {
    console.log('跳转到新建工单');
    wx.navigateTo({
        url: '/pages/quickPhoto/quickPhoto',
        fail: (err) => {
            console.error('跳转失败:', err);
            wx.showToast({
                title: '页面跳转失败',
                icon: 'none'
            });
        }
    });
  }
}); 