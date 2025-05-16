import request from '../../../utils/request';
import { formatDate } from '../../../constants/index';

Page({
    data: {
        orders: [],
        isLoading: true,
        error: null,
        activeTab: 'all', // 默认显示所有工单
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
            '处理完': 'completed'
        }
    },

    onLoad() {
        this.loadOrders();
    },

    onShow() {
        // 每次显示页面时刷新数据
        this.loadOrders();
    },

    onPullDownRefresh() {
        this.loadOrders();
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
                url: '/api/captain/workorders',
                method: 'GET',
                data: {
                    type: this.data.activeTab
                }
            });
            
            if (res && res.code === 200) {
                // 格式化时间和状态映射
                const orders = res.data.map(order => {
                    let statusEn = this.data.statusEnMap[order.status] || 'unclaimed';
                    let statusCn = this.data.statusMap[statusEn] || order.status;
                    return {
                        ...order,
                        createdAt: formatDate(order.createdAt),
                        updatedAt: order.updatedAt ? formatDate(order.updatedAt) : '',
                        deadline: order.deadline ? formatDate(order.deadline) : '',
                        statusEn,
                        statusCn
                    };
                });

                // 排序逻辑
                orders.sort((a, b) => {
                    // 已上报排最前
                    if (a.statusEn === 'reported' && b.statusEn !== 'reported') return -1;
                    if (a.statusEn !== 'reported' && b.statusEn === 'reported') return 1;
                    // 处理完排最后
                    if (a.statusEn === 'completed' && b.statusEn !== 'completed') return 1;
                    if (a.statusEn !== 'completed' && b.statusEn === 'completed') return -1;
                    // 其他状态按更新时间降序
                    const aTime = new Date(a.updatedAt || a.createdAt).getTime();
                    const bTime = new Date(b.updatedAt || b.createdAt).getTime();
                    return bTime - aTime;
                });

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

    // 查看工单详情
    goToDetail(e) {
        const { id } = e.currentTarget.dataset;
        wx.navigateTo({
            url: `/pages/workOrderDetail/workOrderDetail?id=${id}`
        });
    },

    // 重新分配工单
    handleReassign(e) {
        const { id } = e.currentTarget.dataset;
        wx.navigateTo({
            url: `/pages/captain/workorder/reassign?id=${id}`
        });
    }
}); 