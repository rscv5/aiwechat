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
                    // 兼容iOS日期格式，将横线替换为斜线
                    const aDateString = (a.updatedAt || a.createdAt).replace(/-/g, '/');
                    const bDateString = (b.updatedAt || b.createdAt).replace(/-/g, '/');
                    const aTime = new Date(aDateString).getTime();
                    const bTime = new Date(bDateString).getTime();
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
            const res = await new Promise((resolve, reject) => {
                wx.request({
                    url: `${getApp().globalData.baseUrl}/api/user/info`,
                    method: 'GET',
                    header: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    success: (res) => {
                        console.log('请求成功，状态码:', res.statusCode);
                        console.log('响应数据:', res.data);
                        resolve(res);
                    },
                    fail: (err) => {
                        console.error('请求失败:', err);
                        reject(err);
                    }
                });
            });

            if (res.statusCode === 200 && res.data) {
                console.log('获取到新的用户信息:', res.data);
                // 更新存储的用户信息
                const updatedUserInfo = {
                    ...wx.getStorageSync('userInfo'),
                    ...res.data
                };
                console.log('更新后的用户信息:', updatedUserInfo);
                wx.setStorageSync('userInfo', updatedUserInfo);
                
                // 更新页面状态
                this.setData({
                    isSuperAdmin: res.data.isSuperAdmin === true
                });
                console.log('页面状态已更新, isSuperAdmin:', res.data.isSuperAdmin);
            } else {
                console.error('获取用户信息失败:', res);
                if (res.statusCode === 403) {
                    // token 可能过期，尝试重新登录
                    wx.redirectTo({
                        url: '/pages/login/login'
                    });
                }
            }
        } catch (error) {
            console.error('刷新用户信息失败:', error);
            wx.showToast({
                title: '获取用户信息失败',
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