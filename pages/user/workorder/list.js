const app = getApp();
const auth = require('../../../utils/auth');

// Mock 数据
const mockWorkOrders = [
  {
    id: 1,
    title: '小区路灯损坏',
    description: '3号楼前的路灯不亮了，影响夜间出行安全',
    status: '待处理',
    createTime: '2024-03-15 14:30',
    location: '3号楼前'
  },
  {
    id: 2,
    title: '垃圾箱清理不及时',
    description: '5号楼下的垃圾箱已经满了，需要及时清理',
    status: '处理中',
    createTime: '2024-03-14 09:15',
    location: '5号楼'
  },
  {
    id: 3,
    title: '小区健身器材维修',
    description: '健身区的跑步机出现故障，需要维修',
    status: '已解决',
    createTime: '2024-03-13 16:45',
    location: '小区健身区'
  }
];

Page({
  data: {
    activeTab: 0,
    tabs: ['全部', '待处理', '处理中', '已解决'],
    workOrders: [],
    isLoading: true,
    statusMap: {
      '待处理': { color: '#ff9800', text: '待处理' },
      '处理中': { color: '#2196f3', text: '处理中' },
      '已解决': { color: '#4caf50', text: '已解决' }
    }
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
      // 使用 mock 数据进行测试
      const status = this.data.activeTab === 0 ? '' : this.data.tabs[this.data.activeTab];
      console.log('当前筛选状态:', status);
      
      let filteredOrders = [...mockWorkOrders];
      if (status) {
        filteredOrders = mockWorkOrders.filter(order => order.status === status);
      }

      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 500));

      // 更新页面数据
      this.setData({
        workOrders: filteredOrders
      });
      console.log('工单数据加载完成');

      /* 后端接口准备好后，替换为以下代码
      const token = wx.getStorageSync('auth_token');
      const res = await wx.request({
        url: `${app.globalData.baseUrl}/api/workorders/user`,
        method: 'GET',
        header: {
          'Authorization': `Bearer ${token}`
        },
        data: { status }
      });

      if (res.statusCode === 200) {
        this.setData({
          workOrders: res.data.data
        });
      } else {
        throw new Error(res.data.message || '加载失败');
      }
      */
    } catch (error) {
      console.error('加载工单失败:', error);
      wx.showToast({
        title: error.message || '加载失败',
        icon: 'none'
      });
    }
  },

  // 跳转到工单详情
  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    console.log('跳转到工单详情:', id);
    wx.navigateTo({
      url: `/pages/workOrderDetail/workOrderDetail?id=${id}`
    });
  },

  // 跳转到新建工单
  goToCreate() {
    console.log('跳转到新建工单');
    wx.navigateTo({
      url: '/pages/quickPhoto/quickPhoto'
    });
  }
}); 