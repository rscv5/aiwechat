import request from '../../../utils/request';

Page({
    data: {
        workId: null,
        gridWorkers: [], // 网格员列表
        selectedWorker: null,
        deadline: '',
        isLoading: false,
        error: null
    },

    onLoad(options) {
        if (options.id) {
            this.setData({ workId: options.id });
            this.loadGridWorkers();
        }
    },

    // 加载网格员列表
    async loadGridWorkers() {
        try {
            this.setData({ isLoading: true, error: null });
            const res = await request.request({
                url: '/api/users/grid-workers',
                method: 'GET'
            });
            
            if (res && res.code === 200) {
                this.setData({ gridWorkers: res.data });
            } else {
                throw new Error(res?.message || '获取网格员列表失败');
            }
        } catch (error) {
            this.setData({ 
                error: error.message || '获取网格员列表失败，请稍后重试'
            });
        } finally {
            this.setData({ isLoading: false });
        }
    },

    // 选择网格员
    onWorkerChange(e) {
        this.setData({
            selectedWorker: e.detail.value
        });
    },

    // 选择截止时间
    onDeadlineChange(e) {
        this.setData({
            deadline: e.detail.value
        });
    },

    // 提交重新分配
    async handleSubmit() {
        if (!this.data.selectedWorker) {
            wx.showToast({
                title: '请选择网格员',
                icon: 'none'
            });
            return;
        }

        try {
            this.setData({ isLoading: true, error: null });
            const res = await request.request({
                url: '/api/captain/reassign',
                method: 'POST',
                data: {
                    workId: this.data.workId,
                    gridWorkerOpenid: this.data.selectedWorker,
                    deadline: this.data.deadline
                }
            });
            
            if (res && res.code === 200) {
                wx.showToast({
                    title: '重新分配成功',
                    icon: 'success'
                });
                // 返回上一页并刷新
                setTimeout(() => {
                    const pages = getCurrentPages();
                    const prevPage = pages[pages.length - 2];
                    prevPage.loadOrders();
                    wx.navigateBack();
                }, 1500);
            } else {
                throw new Error(res?.message || '重新分配失败');
            }
        } catch (error) {
            this.setData({ 
                error: error.message || '重新分配失败，请稍后重试'
            });
        } finally {
            this.setData({ isLoading: false });
        }
    }
}); 