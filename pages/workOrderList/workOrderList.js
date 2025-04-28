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
    }
  },

  onShow() {
    this.fetchWorkOrders();
  },

  onStatusChange(e) {
    this.setData({ activeStatus: e.detail }, this.fetchWorkOrders);
  },

  fetchWorkOrders() {
    // 模拟请求，实际应调用后端API
    const allOrders = wx.getStorageSync('workOrders') || [];
    let filtered = allOrders;
    if (this.data.activeStatus !== 'all') {
      filtered = allOrders.filter(o => o.status === this.data.activeStatus);
    }
    this.setData({ workOrders: filtered });
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