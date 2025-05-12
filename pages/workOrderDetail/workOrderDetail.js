import { workOrderApi } from '../../services/api';
import { formatDate } from '../../constants/index';

Page({
  data: {
    workId: null,
    workOrder: null,
    isLoading: true,
    error: null
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ workId: options.id });
      this.loadWorkOrderDetail();
    } else {
      this.setData({
        isLoading: false,
        error: '工单ID不能为空'
      });
    }
  },

  // 加载工单详情
  async loadWorkOrderDetail() {
    console.log('=== Loading Work Order Detail Start ===');
    console.log('Work Order ID:', this.data.workId);
    
    try {
      this.setData({ isLoading: true, error: null });
      console.log('Loading state set to true');
      
      console.log('Calling API to get work order detail...');
      const res = await workOrderApi.getWorkOrderDetail(this.data.workId);
      console.log('API Response:', res);

      
      if (res && res.code === 200) {
        let workOrder = res.data;
        console.log('Raw work order data:', workOrder);
        
        // 格式化日期
        workOrder.createdAt = formatDate(workOrder.createdAt);
        workOrder.updatedAt = formatDate(workOrder.updatedAt);
        if (workOrder.feedbackTime) {
          workOrder.feedbackTime = formatDate(workOrder.feedbackTime);
        }
        
        // 格式化处理记录的时间
        if (workOrder.processingLogs) {
          console.log('Formatting processing logs...');
          workOrder.processingLogs = workOrder.processingLogs.map(log => ({
            ...log,
            createdAt: formatDate(log.createdAt)
          }));
        }
        
        // 格式化反馈记录的时间
        if (workOrder.feedbackList) {
          console.log('Formatting feedback list...');
          workOrder.feedbackList = workOrder.feedbackList.map(feedback => ({
            ...feedback,
            feedbackTime: formatDate(feedback.feedbackTime)
          }));
        }
        
        this.setData({ workOrder });
        console.log('Work order data set to state');
      } else {
        throw new Error(res?.message || '获取工单详情失败');
      }
    } catch (error) {
      console.error('=== Error Loading Work Order Detail ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      this.setData({ 
        error: error.message || '获取工单详情失败，请稍后重试'
      });
    } finally {
      this.setData({ isLoading: false });
      console.log('Loading state set to false');
      console.log('=== Loading Work Order Detail End ===');
    }
  },

  // 预览图片
  previewImage(e) {
    const { index, type } = e.currentTarget.dataset;
    let urls = [];
    
    if (type === 'workOrder') {
      urls = this.data.workOrder.imageUrls ? JSON.parse(this.data.workOrder.imageUrls) : [];
    } else if (type === 'handled') {
      urls = this.data.workOrder.handledImages ? JSON.parse(this.data.workOrder.handledImages) : [];
    } else if (type === 'feedback') {
      const feedback = this.data.workOrder.feedbackList[index];
      urls = feedback.feedbackImages ? JSON.parse(feedback.feedbackImages) : [];
    }
    
    if (urls.length > 0) {
      wx.previewImage({
        current: urls[0],
        urls: urls
      });
    }
  },

  // 返回工单列表
  goBack() {
    wx.navigateBack({
      delta: 1,
      animationType: 'slide-out-right',
      animationDuration: 300
    });
  }
}); 