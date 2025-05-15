// pages/grid/workorder/list.js
import request from '../../../utils/request';
import { formatDate } from '../../../constants/index';

Page({

    /**
     * 页面的初始数据
     */
    data: {
        orders: [],
        isLoading: true,
        error: null,
        activeTab: 'today', // 默认显示今日工单
        statusMap: {
          unclaimed: '未领取',
          processing: '处理中',
          reported: '已上报',
          completed: '处理完'
        },
        statusEnMap: {
          '未领取': 'unclaimed',
          '处理中': 'processing',
          '已上报': 'reported',
          '处理完': 'completed',
          'unclaimed': 'unclaimed',
          'processing': 'processing',
          'reported': 'reported',
          'completed': 'completed'
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.loadOrders();
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        // 每次显示页面时刷新数据
        this.loadOrders();
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {
        this.loadOrders();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    },

    // 切换标签
    switchTab(e) {
        const tab = e.currentTarget.dataset.tab;
        if (tab === this.data.activeTab) return;
        
        this.setData({ activeTab: tab });
        this.loadOrders();
    },

    // 加载工单列表
    async loadOrders() {
        try {
            this.setData({ isLoading: true, error: null });
            const res = await request.request({
                url: '/api/gridworker/orders',
                method: 'GET',
                data: {
                    type: this.data.activeTab
                }
            });
            
            if (res && res.code === 200) {
                console.log('原始工单数据:', res.data);
                // 格式化时间和状态映射
                const orders = res.data.map(order => {
                    // 强制映射英文状态
                    let statusEn = this.data.statusEnMap[order.status] || 'unclaimed';
                    let statusCn = this.data.statusMap[statusEn] || order.status;
                    return {
                        ...order,
                        createdAt: formatDate(order.createdAt),
                        updatedAt: order.updatedAt ? formatDate(order.updatedAt) : '',
                        statusEn,
                        statusCn
                    };
                });
                // 排序逻辑用英文
                orders.sort((a, b) => {
                    // 未领取排最前
                    if (a.statusEn === 'unclaimed' && b.statusEn !== 'unclaimed') return -1;
                    if (a.statusEn !== 'unclaimed' && b.statusEn === 'unclaimed') return 1;
                    // 处理完排最后
                    if (a.statusEn === 'completed' && b.statusEn !== 'completed') return 1;
                    if (a.statusEn !== 'completed' && b.statusEn === 'completed') return -1;
                    // 处理中/已上报按 updatedAt 降序
                    if (a.statusEn === b.statusEn) {
                        const aTime = new Date(a.updatedAt || a.createdAt).getTime();
                        const bTime = new Date(b.updatedAt || b.createdAt).getTime();
                        return bTime - aTime;
                    }
                    return 0;
                });
                console.log('处理后的工单数据:', orders);
                this.setData({ orders });
            } else {
                throw new Error(res?.message || '获取工单列表失败');
            }
        } catch (error) {
            this.setData({ 
                error: error.message || '获取工单列表失败，请稍后重试'
            });
        } finally {
            this.setData({ isLoading: false });
            wx.stopPullDownRefresh();
        }
    },

    // 认领工单
    async handleClaim(e) {
        const { id } = e.currentTarget.dataset;
        try {
            wx.showLoading({ title: '认领中...' });
            const res = await request.request({
                url: '/api/gridworker/claim-order',
                method: 'POST',
                data: { workId: id }
            });
            
            if (res && res.code === 200) {
                wx.showToast({ 
                    title: '认领成功', 
                    icon: 'success' 
                });
                // 刷新列表
                this.loadOrders();
            } else {
                throw new Error(res?.message || '认领失败');
            }
        } catch (error) {
            wx.showToast({ 
                title: error.message || '认领失败，请重试', 
                icon: 'error' 
            });
        } finally {
            wx.hideLoading();
        }
    },

    // 处理工单
    handleProcess(e) {
        const { id } = e.currentTarget.dataset;
        wx.navigateTo({
            url: `/pages/workOrderDetail/workOrderDetail?id=${id}`
        });
    },

    // 查看工单详情
    goToDetail(e) {
        const { id } = e.currentTarget.dataset;
        wx.navigateTo({
            url: `/pages/workOrderDetail/workOrderDetail?id=${id}`
        });
    }
})