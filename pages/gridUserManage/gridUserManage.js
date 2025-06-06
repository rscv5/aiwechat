const app = getApp();
import { formatDate } from '../../constants/index';

Page({
    data: {
        gridUsers: [],
        isSuperAdmin: false,
        showAddModal: false,
        newUser: {
            username: '',
            phoneNumber: ''
        },
        isLoading: true,
        error: null
    },

    onLoad() {
        this.checkSuperAdmin();
        this.loadGridUsers();
    },

    // 检查是否是超级管理员
    async checkSuperAdmin() {
        try {
            const userInfo = wx.getStorageSync('userInfo');
            console.log('当前用户信息:', userInfo);
            const isSuperAdmin = userInfo && userInfo.isSuperAdmin === true;
            console.log('是否是超级管理员:', isSuperAdmin);
            
            this.setData({
                isSuperAdmin: isSuperAdmin
            });

            if (!isSuperAdmin) {
                wx.showToast({
                    title: '无权限访问',
                    icon: 'none',
                    duration: 2000
                });
                setTimeout(() => {
                    wx.navigateBack();
                }, 2000);
            }
        } catch (error) {
            console.error('检查超级管理员状态失败:', error);
        }
    },

    // 加载网格员列表
    async loadGridUsers() {
        try {
            this.setData({ isLoading: true, error: null });
            console.log('开始加载网格员列表');
            
            const token = wx.getStorageSync('auth_token');
            if (!token) {
                throw new Error('未找到认证信息');
            }

            const res = await new Promise((resolve, reject) => {
                wx.request({
                    url: `${app.globalData.baseUrl}/api/grid-users`,
                    method: 'GET',
                    header: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    success: (res) => {
                        console.log('获取网格员列表响应:', res);
                        resolve(res);
                    },
                    fail: (err) => {
                        console.error('获取网格员列表失败:', err);
                        reject(err);
                    }
                });
            });

            if (res.statusCode === 200) {
                console.log('成功获取网格员列表:', res.data);
                // 处理时间格式
                const gridUsers = res.data.map(user => ({
                    ...user,
                    createTime: user.createTime ? formatDate(user.createTime) : '暂无',
                    lastLoginTime: user.lastLoginTime ? formatDate(user.lastLoginTime) : '暂无'
                }));
                this.setData({
                    gridUsers,
                    isLoading: false
                });
            } else {
                throw new Error(res.data?.message || '获取网格员列表失败');
            }
        } catch (error) {
            console.error('加载网格员列表失败:', error);
            this.setData({
                error: error.message || '加载失败，请重试',
                isLoading: false
            });
            wx.showToast({
                title: error.message || '加载失败',
                icon: 'none',
                duration: 2000
            });
        }
    },

    // 显示添加网格员弹窗
    showAddModal() {
        this.setData({
            showAddModal: true,
            newUser: {
                username: '',
                phoneNumber: ''
            }
        });
    },

    // 关闭添加网格员弹窗
    hideAddModal() {
        this.setData({
            showAddModal: false
        });
    },

    // 输入事件处理
    onUsernameInput(e) {
        this.setData({
            'newUser.username': e.detail.value
        });
    },

    onPhoneInput(e) {
        this.setData({
            'newUser.phoneNumber': e.detail.value
        });
    },

    // 添加网格员
    async addGridUser() {
        const { username, phoneNumber } = this.data.newUser;
        if (!username || !phoneNumber) {
            wx.showToast({
                title: '请填写完整信息',
                icon: 'none',
                duration: 2000
            });
            return;
        }

        try {
            const result = await new Promise((resolve, reject) => {
                wx.request({
                    url: `${app.globalData.baseUrl}/api/grid-users`,
                    method: 'POST',
                    header: {
                        'Authorization': `Bearer ${wx.getStorageSync('auth_token')}`,
                        'Content-Type': 'application/json'
                    },
                    data: {
                        username,
                        phoneNumber,
                        role: '网格员'
                    },
                    success: (res) => {
                        console.log('添加网格员响应:', res);
                        resolve(res);
                    },
                    fail: (err) => {
                        console.error('添加网格员请求失败:', err);
                        reject(err);
                    }
                });
            });

            if (result.statusCode === 200 && result.data.code === 200) {
                wx.showModal({
                    title: '添加成功',
                    content: `网格员账号已创建，初始密码为：Mf654321`,
                    showCancel: false,
                    success: () => {
                        this.hideAddModal();
                        this.loadGridUsers();
                    }
                });
            } else {
                throw new Error(result.data?.message || '添加失败');
            }
        } catch (error) {
            console.error('添加网格员失败:', error);
            wx.showToast({
                title: error.message || '添加失败',
                icon: 'none',
                duration: 2000
            });
        }
    },

    // 删除网格员
    async deleteGridUser(e) {
        const userId = e.currentTarget.dataset.id;
        wx.showModal({
            title: '确认停用',
            content: '确定要停用该网格员账号吗？停用后该账号将无法登录，但历史工单记录将被保留。',
            success: async (res) => {
                if (res.confirm) {
                    try {
                        const result = await new Promise((resolve, reject) => {
                            wx.request({
                                url: `${app.globalData.baseUrl}/api/grid-users/${userId}`,
                                method: 'DELETE',
                                header: {
                                    'Authorization': `Bearer ${wx.getStorageSync('auth_token')}`,
                                    'Content-Type': 'application/json'
                                },
                                success: (res) => {
                                    console.log('停用网格员响应:', res);
                                    resolve(res);
                                },
                                fail: (err) => {
                                    console.error('停用网格员请求失败:', err);
                                    reject(err);
                                }
                            });
                        });

                        if (result.statusCode === 200) {
                            wx.showToast({
                                title: '停用成功',
                                icon: 'success',
                                duration: 2000
                            });
                            // 重新加载列表
                            await this.loadGridUsers();
                        } else {
                            throw new Error(result.data?.message || '停用失败');
                        }
                    } catch (error) {
                        console.error('停用网格员失败:', error);
                        wx.showToast({
                            title: error.message || '停用失败',
                            icon: 'none',
                            duration: 2000
                        });
                    }
                }
            }
        });
    },

    // 重置密码
    async resetPassword(e) {
        const userId = e.currentTarget.dataset.id;
        wx.showModal({
            title: '确认重置',
            content: '确定要重置该网格员的密码吗？重置后密码将变为：Mf654321',
            success: async (res) => {
                if (res.confirm) {
                    try {
                        const result = await new Promise((resolve, reject) => {
                            wx.request({
                                url: `${app.globalData.baseUrl}/api/grid-users/${userId}/reset-password`,
                                method: 'POST',
                                header: {
                                    'Authorization': `Bearer ${wx.getStorageSync('auth_token')}`,
                                    'Content-Type': 'application/json',
                                    'Accept': 'application/json'
                                },
                                success: (res) => {
                                    console.log('重置密码响应:', res);
                                    resolve(res);
                                },
                                fail: (err) => {
                                    console.error('重置密码请求失败:', err);
                                    reject(err);
                                }
                            });
                        });

                        if (result.statusCode === 200 && result.data.code === 200) {
                            wx.showModal({
                                title: '重置成功',
                                content: '密码已重置为：Mf654321',
                                showCancel: false
                            });
                        } else {
                            throw new Error(result.data?.message || '重置失败');
                        }
                    } catch (error) {
                        console.error('重置密码失败:', error);
                        wx.showToast({
                            title: error.message || '重置失败',
                            icon: 'none',
                            duration: 2000
                        });
                    }
                }
            }
        });
    }
}); 