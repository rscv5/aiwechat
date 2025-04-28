const { formatDate } = require('../../constants/index');

Page({
  data: {
    statusTabs: [
      { label: '全部', value: 'all' },
      { label: '待处理', value: 'pending' },
      { label: '处理中', value: 'processing' },
      { label: '已完成', value: 'done' }
    ],
    activeStatus: 'all',
    workOrders: [],
    statusMap: {
      pending: '待处理',
      processing: '处理中',
      done: '已完成'
    },
    emptyTitle: '',
    emptySubtitle: ''
  },

  onShow() {
    this.fetchWorkOrders();
  },

  onStatusChange(e) {
    const activeStatus = e.detail;
    this.setData({ activeStatus }, () => {
      this.fetchWorkOrders();
    });
  },

  fetchWorkOrders() {
    // 模拟请求，实际应调用后端API
    const allOrders = wx.getStorageSync('workOrders') || [];
    let filtered = allOrders;
    if (this.data.activeStatus !== 'all') {
      filtered = allOrders.filter(o => o.status === this.data.activeStatus);
    }
    // 格式化时间
    filtered = filtered.map(order => ({
      ...order,
      createTime: formatDate(order.createTime)
    }));
    this.setData({ workOrders: filtered }, () => {
      this.updateEmptyState();
    });
  },

  // 智能空状态提示
  updateEmptyState() {
    const allOrders = wx.getStorageSync('workOrders') || [];
    const { activeStatus } = this.data;
    let emptyTitle = '';
    let emptySubtitle = '';

    if (activeStatus === 'all') {
      emptyTitle = '您还没有提交过工单';
      emptySubtitle = '点击提交工单反馈您的问题';
    } else if (activeStatus === 'pending') {
      emptyTitle = '您没有待处理的工单';
      const processingCount = allOrders.filter(o => o.status === 'processing').length;
      if (processingCount > 0) {
        emptySubtitle = `您有${processingCount}个工单正在处理中`;
      } else {
        emptySubtitle = '';
      }
    } else if (activeStatus === 'processing') {
      emptyTitle = '您没有工单在处理';
      const pendingCount = allOrders.filter(o => o.status === 'pending').length;
      if (pendingCount > 0) {
        emptySubtitle = `您有${pendingCount}个工单等待处理`;
      } else {
        emptySubtitle = '';
      }
    } else if (activeStatus === 'done') {
      emptyTitle = '您没有已完成的工单';
      const pendingCount = allOrders.filter(o => o.status === 'pending').length;
      const processingCount = allOrders.filter(o => o.status === 'processing').length;
      if (pendingCount > 0) {
        emptySubtitle = `您有${pendingCount}个工单等待处理`;
      } else if (processingCount > 0)  {
        emptySubtitle = `您有${processingCount}个工单正在处理中`;
      } else {
        emptySubtitle = '';
      }
    }
    this.setData({ emptyTitle, emptySubtitle });
  },

  // 跳转至工单详情页面
  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/workOrderDetail/workOrderDetail?id=${id}`,
      animationType: 'slide-in-right',
      animationDuration: 300
    });
  },

  // 跳转至随手拍页面
  goToQuickPhoto() {
    wx.navigateTo({
      url: '/pages/quickPhoto/quickPhoto',
      animationType: 'slide-in-up',
      animationDuration: 300
    });
  }
}); 