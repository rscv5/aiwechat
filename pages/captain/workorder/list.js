import request from '../../../utils/request';
import { formatDate } from '../../../constants/index';

const app = getApp();

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
        },
        isSuperAdmin: false
    },

    onLoad() {
        this.checkSuperAdmin();
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
            // 添加日志，确认当前活跃的Tab类型
            console.log('当前活跃的Tab:', this.data.activeTab);

            const res = await request.request({
                url: '/api/captain/workorders',
                method: 'GET',
                data: {
                    type: this.data.activeTab
                }
            });
            
            // 添加日志，确认从后端收到的原始数据
            console.log('从后端收到的原始工单数据 (res):', res);

            // 确保 res 是一个数组，即使后端返回空数组或 null，也将其视为空数组
            const ordersData = Array.isArray(res.data) ? res.data : [];
            console.log('处理后的工单数据 (ordersData):', ordersData);

            // 格式化时间和状态映射
            const orders = ordersData.map(order => {
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
                    // 兼容iOS日期格式，将横线替换为斜线
                    const aDateString = (a.updatedAt || a.createdAt).replace(/-/g, '/');
                    const bDateString = (b.updatedAt || b.createdAt).replace(/-/g, '/');
                    const aTime = new Date(aDateString).getTime();
                    const bTime = new Date(bDateString).getTime();
                    return bTime - aTime;
                });

                this.setData({ orders });
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
    },

    // 检查是否是超级管理员
    checkSuperAdmin() {
        try {
            const userInfo = wx.getStorageSync('userInfo');
            console.log('当前用户信息:', JSON.stringify(userInfo, null, 2));
            
            // 检查用户信息中的 isSuperAdmin 字段
            const isSuperAdmin = userInfo && userInfo.isSuperAdmin === true;
            console.log('是否是超级管理员:', isSuperAdmin);
            console.log('isSuperAdmin 字段类型:', typeof userInfo?.isSuperAdmin);
            
            this.setData({
                isSuperAdmin: isSuperAdmin
            });
            
            // 如果是片区长但没有 isSuperAdmin 字段，可能需要重新获取用户信息
            if (userInfo && userInfo.role === '片区长' && userInfo.isSuperAdmin === undefined) {
                console.log('片区长缺少 isSuperAdmin 字段，尝试重新获取用户信息');
                this.refreshUserInfo();
            }
        } catch (error) {
            console.error('检查超级管理员状态失败:', error);
            this.setData({
                isSuperAdmin: false
            });
        }
    },

    // 刷新用户信息
    async refreshUserInfo() {
        try {
            const token = wx.getStorageSync('auth_token');
            if (!token) {
                console.log('未找到 token，无法刷新用户信息');
                return;
            }

            console.log('开始请求用户信息, token:', token);
            const app = getApp();
            const res = await app.call({
                path: '/api/user/info',
                method: 'GET',
                header: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            // app.call 成功返回的是业务数据，无需再判断 statusCode 和 res.data
            if (res) {
                console.log('获取到新的用户信息:', res);
                // 更新存储的用户信息
                const updatedUserInfo = {
                    ...wx.getStorageSync('userInfo'),
                    ...res
                };
                console.log('更新后的用户信息:', updatedUserInfo);
                wx.setStorageSync('userInfo', updatedUserInfo);
                
                // 更新页面状态
                this.setData({
                    isSuperAdmin: res.isSuperAdmin === true
                });
                console.log('页面状态已更新, isSuperAdmin:', res.isSuperAdmin);
            } else {
                console.error('获取用户信息失败:', res);
                // 如果是未登录或token过期，app.call会跳转到登录页
                // 这里无需额外处理403，因为getApp().call()会统一处理
            }
        } catch (error) {
            console.error('刷新用户信息失败:', error);
            wx.showToast({
                title: error.message || '刷新用户信息失败',
                icon: 'none',
                duration: 2000
            });
        }
    },

    // 跳转到网格员管理页面
    navigateToGridManage() {
        wx.navigateTo({
            url: '/pages/gridUserManage/gridUserManage'
        });
    }
}); 