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
    this.loadWorkOrders();
  },

  // 页面显示时触发，每次页面显示都会触发
  onShow() {
    console.log('=== 页面显示 onShow ===');
    // 不再重复检查登录状态和加载数据
  },

  // 下拉刷新时触发
  onPullDownRefresh() {
    console.log('=== 下拉刷新 ===');
    this.loadWorkOrders().then(() => {
      wx.stopPullDownRefresh();
    });
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
    this.setData({ isLoading: true });
    
    try {
      const token = wx.getStorageSync('auth_token');
      if (!token) {
        console.log('未检测到token，跳转到登录页');
        wx.redirectTo({
          url: '/pages/login/login'
        });
        return;
      }

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
        status: status,
        // baseUrl: app.globalData.baseUrl // 不再需要，将通过内网调用
      });
      
      // const url = `${app.globalData.baseUrl}/api/workorder/user`; // 不再需要
      // console.log('发送请求到:', url);
      
      // 使用 getApp().call() 替代 wx.request
      const app = getApp();
      const res = await app.call({
        path: '/api/workorder/user', // 相对路径
        method: 'GET',
        header: {
          'Authorization': `Bearer ${token}`,
        },
        data: { status: status } // 传递状态参数
      });

      console.log('请求响应:', res);

      if (!res) {
        throw new Error('网络请求失败，请检查网络连接');
      }

      // 从 res.data 中获取 workOrders 数组
      const workOrdersData = res.data || []; // 修改为从 res.data 中获取

      const workOrders = workOrdersData.map(order => {
        // 格式化时间（保持原有格式，不做转换）
        const createTime = order.createdAt ? order.createdAt.substring(0, 16).replace('T', ' ') : '未知时间';

        return {
          id: order.workId,
          description: order.description || '无描述',
          status: this.data.statusMap[order.status]?.text || order.status,
          createTime: createTime,
          buildingInfo: order.buildingInfo || '未填写楼栋信息'
        };
      });

      this.setData({
        workOrders: workOrders,
        isLoading: false
      });
      console.log('处理后的工单数据:', workOrders);
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