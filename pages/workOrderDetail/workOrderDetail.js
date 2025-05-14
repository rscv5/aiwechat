import { workOrderApi } from '../../services/api';
import { formatDate } from '../../constants/index';

Page({
  data: {
    workId: null,
    workOrder: null,
    isLoading: true,
    error: null,
    statusClass: 'pending'
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
    try {
      this.setData({ isLoading: true, error: null });
      const res = await workOrderApi.getWorkOrderDetail(this.data.workId);

      if (res && res.code === 200) {
        let workOrder = res.data;

        // 格式化主工单的时间字段
        workOrder.createdAt = formatDate(workOrder.createdAt);
        workOrder.updatedAt = formatDate(workOrder.updatedAt);
        if (workOrder.feedbackTime) {
          workOrder.feedbackTime = formatDate(workOrder.feedbackTime);
        }

        // 格式化处理记录的时间
        if (workOrder.processingLogs) {
          workOrder.processingLogs = workOrder.processingLogs.map(log => ({
            ...log,
            createdAt: formatDate(log.createdAt),
            updatedAt: formatDate(log.updatedAt)
          }));
        }

        // 格式化反馈记录的时间
        if (workOrder.feedbackList) {
          workOrder.feedbackList = workOrder.feedbackList.map(feedback => ({
            ...feedback,
            feedbackTime: formatDate(feedback.feedbackTime)
          }));
        }

        const statusClassMap = {
          '未领取': 'unclaimed',
          '处理中': 'processing',
          '已完成': 'done',
          // 其他状态...
        };
        this.setData({
          workOrder,
          statusClass: statusClassMap[workOrder.status] || 'pending'
        });
      } else {
        throw new Error(res?.message || '获取工单详情失败');
      }
    } catch (error) {
      this.setData({ 
        error: error.message || '获取工单详情失败，请稍后重试'
      });
    } finally {
      this.setData({ isLoading: false });
    }
  },

  // 预览图片
  previewImage(e) {
    const { index, type } = e.currentTarget.dataset;
    let urls = [];
    if (type === 'workOrder') {
      urls = this.data.workOrder.imageUrls || [];
    } else if (type === 'handled') {
      urls = this.data.workOrder.handledImages || [];
    } else if (type === 'feedback') {
      const feedback = this.data.workOrder.feedbackList[index];
      urls = feedback.feedbackImages || [];
    }
    if (urls.length > 0) {
      wx.previewImage({
        current: urls[index],
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