const app = getApp();
import { workOrderApi } from '../../services/api';
import { API, formatDate } from '../../constants/index';
import { userApi } from '../../services/api';

// 添加服务器基础URL配置


Page({
  data: {
    workId: null,
    workOrder: null,
    isLoading: true,
    error: null,
    statusClass: 'pending',
    handledDesc: '',
    handledImages: [],
    userRole: '',
    showFeedbackModal: false,
    showResultModal: false
  },

  onLoad(options) {
    console.log('onLoad options:', options);
    if (options.id) {
      this.setData({ workId: options.id });
      this.loadWorkOrderDetail();
      this.getUserRole();
    } else {
      this.setData({
        isLoading: false,
        error: '工单ID不能为空'
      });
    }
  },

  // 获取用户角色
  async getUserRole() {
    try {
      const token = wx.getStorageSync('auth_token');
      console.log('getUserRole token:', token);
      const res = await userApi.getUserInfo(token);
      console.log('getUserRole res:', res);
      const role = res.role || (res.data && res.data.role) || '';
      this.setData({ userRole: (role || '').trim() });
      console.log('userRole set:', (role || '').trim());
    } catch (error) {
      console.error('获取用户角色失败', error);
    }
  },

  // 加载工单详情
  async loadWorkOrderDetail() {
    try {
      this.setData({ isLoading: true, error: null });
      const res = await workOrderApi.getWorkOrderDetail(this.data.workId);
      console.log('loadWorkOrderDetail res:', res);
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

        // 统一状态值映射
        const statusMap = {
          'unclaimed': '未领取',
          'processing': '处理中',
          'reported': '已上报',
          'completed': '处理完',
          '未领取': '未领取',
          '处理中': '处理中',
          '已上报': '已上报',
          '处理完': '处理完'
        };

        // 确保状态值统一
        workOrder.status = statusMap[workOrder.status] || workOrder.status;

        const statusClassMap = {
          '未领取': 'unclaimed',
          '处理中': 'processing',
          '已上报': 'reported',
          '处理完': 'completed'
        };

        this.setData({
          workOrder,
          statusClass: statusClassMap[workOrder.status] || 'pending'
        });
        console.log('workOrder.status:', workOrder.status);
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
      urls = (this.data.workOrder.imageUrls || []).map(url => url.startsWith('http') ? url : `${app.globalData.baseUrl}${url}`);
    } else if (type === 'handled') {
      urls = this.data.handledImages || [];
    } else if (type === 'feedback') {
      const feedback = this.data.workOrder.feedbackList[index];
      urls = (feedback.feedbackImages || []).map(url => url.startsWith('http') ? url : `${app.globalData.baseUrl}${url}`);
    }
    if (urls.length > 0) {
      wx.previewImage({
        current: urls[index],
        urls: urls
      });
    }
  },

  // 显示反馈弹窗
  showFeedbackModal() {
    this.setData({ showFeedbackModal: true });
  },

  // 隐藏反馈弹窗
  hideFeedbackModal() {
    this.setData({ showFeedbackModal: false });
  },

  // 处理反馈输入
  onHandledDescInput(e) {
    console.log('onHandledDescInput:', e.detail.value);
    this.setData({ handledDesc: e.detail.value });
  },

  // 上传处理图片（选择后立即上传到服务器，handledImages始终为服务器URL）
  async uploadHandledImages() {
    console.log('点击上传图片，当前handledImages:', this.data.handledImages);
    try {
      const res = await wx.chooseImage({
        count: 9 - this.data.handledImages.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      });
      console.log('选择图片结果:', res);
      wx.showLoading({ title: '上传中...' });
      // 立即上传到服务器
      const uploadedUrls = await this.uploadImagesToServer(res.tempFilePaths);
      this.setData({
        handledImages: [...this.data.handledImages, ...uploadedUrls]
      }, () => {
        console.log('图片已上传，handledImages:', this.data.handledImages);
      });
    } catch (err) {
      console.error('选择或上传图片失败:', err);
      wx.showToast({
        title: '选择或上传图片失败',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 删除处理图片（带日志）
  deleteImage(e) {
    const index = e.currentTarget.dataset.index;
    console.log('点击删除图片，index:', index, '当前handledImages:', this.data.handledImages);
    const handledImages = [...this.data.handledImages];
    handledImages.splice(index, 1);
    this.setData({ handledImages }, () => {
      console.log('图片已删除，handledImages:', this.data.handledImages);
    });
  },

  // 批量上传本地图片到服务器，返回图片URL数组（带日志）
  async uploadImagesToServer(localImagePaths) {
    const uploadedUrls = [];
    for (let filePath of localImagePaths) {
      console.log('准备上传图片到服务器:', filePath);
      await new Promise((resolve, reject) => {
        wx.uploadFile({
          url: `${app.globalData.baseUrl}/api/upload`,
          filePath,
          name: 'file',
          formData: {
            type: 'feedback'
          },
          header: {
            'Authorization': 'Bearer ' + wx.getStorageSync('auth_token')
          },
          success: (res) => {
            try {
              const data = JSON.parse(res.data);
              console.log('图片上传响应:', data);
              if (data.url) {
                // 确保返回完整的URL
                const fullUrl = data.url.startsWith('http') ? data.url : `${app.globalData.baseUrl}${data.url}`;
                uploadedUrls.push(fullUrl);
                resolve();
              } else {
                wx.showToast({ title: '图片上传失败', icon: 'none' });
                reject();
              }
            } catch (e) {
              console.error('解析响应失败:', e);
              wx.showToast({ title: '图片上传失败', icon: 'none' });
              reject();
            }
          },
          fail: (err) => {
            console.error('图片上传失败:', err);
            wx.showToast({ title: '图片上传失败', icon: 'none' });
            reject(err);
          }
        });
      });
    }
    console.log('所有图片上传完成，服务器URL:', uploadedUrls);
    return uploadedUrls;
  },

  // 提交反馈（handledImages已为服务器URL，直接提交）
  async submitFeedback() {
    console.log('点击提交反馈，handledDesc:', this.data.handledDesc, 'handledImages:', this.data.handledImages);
    if (!this.data.handledDesc.trim()) {
      wx.showToast({
        title: '请输入处理说明',
        icon: 'none'
      });
      return;
    }
    try {
      wx.showLoading({ title: '提交中...' });
      // handledImages已为服务器URL，直接提交
      const res = await require('../../services/api').submitFeedback({
        workId: this.data.workOrder.workId,
        handledDesc: this.data.handledDesc,
        handledImages: this.data.handledImages
      });
      console.log('提交反馈接口响应:', res);
      if (res.statusCode === 200 && res.data && res.data.code === 200) {
        wx.showToast({
          title: '提交成功',
          icon: 'success'
        });
        this.hideFeedbackModal();
        this.setData({ handledImages: [] }); // 清空图片
        this.loadWorkOrderDetail();
      } else {
        throw new Error(res.data?.msg || '提交失败');
      }
    } catch (err) {
      console.error('提交反馈失败:', err);
      wx.showToast({
        title: err.message || '提交失败，请重试',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 上报片区长
  async reportToCaptain() {
    try {
      const res = await wx.showModal({
        title: '确认上报',
        content: '确定要上报给片区长吗？',
        confirmText: '确定上报'
      });

      if (res.confirm) {
        wx.showLoading({ title: '上报中...' });
        
        const reportRes = await wx.cloud.callFunction({
          name: 'reportToCaptain',
          data: {
            workId: this.data.workOrder.workId
          }
        });

        if (reportRes.result.success) {
          wx.showToast({
            title: '上报成功',
            icon: 'success'
          });
          this.loadWorkOrderDetail();
        } else {
          throw new Error(reportRes.result.message || '上报失败');
        }
      }
    } catch (err) {
      wx.showToast({
        title: err.message || '上报失败，请重试',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 返回上一页
  goBack() {
    wx.navigateBack({
      delta: 1,
      animationType: 'slide-out-right',
      animationDuration: 300
    });
  },

  // 显示处理结果弹窗
  showResultModal() {
    this.setData({
      showResultModal: true
    });
  },

  // 隐藏处理结果弹窗
  hideResultModal() {
    this.setData({
      showResultModal: false
    });
  }
}); 