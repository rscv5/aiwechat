import { formatDate } from '../../constants/index';

Page({
  data: {
    order: {},
    maskedPhone: ''
  },

  onLoad(options) {
    // 1. 获取工单ID
    const id = options.id;
    // 2. 加载本地工单数据（后端上线后可替换为API请求）
    const orders = wx.getStorageSync('workOrders') || [];
    let order = orders.find(o => o.id == id) || {};
    // 3. 处理手机号脱敏
    let maskedPhone = order.phone || '';
    if (maskedPhone.length === 11) {
      maskedPhone = maskedPhone.substr(0, 3) + '****' + maskedPhone.substr(7, 4);
    }
    // 4. 格式化时间
    if (order.createTime) {
      order.createTime = formatDate(order.createTime);
    }
    this.setData({
      order,
      maskedPhone
    });
  },

  // 图片预览
  previewImage(e) {
    const index = e.currentTarget.dataset.index;
    wx.previewImage({
      current: this.data.order.images[index],
      urls: this.data.order.images
    });
  },

  // 返回工单列表，保留筛选状态
  goBack() {
    wx.navigateBack({
      delta: 1,
      animationType: 'slide-out-right',
      animationDuration: 300
    });
  }
}); 