// pages/party/list.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        searchValue: '',
        activityList: [],
        page: 1,
        pageSize: 10,
        hasMore: true,
        isLoading: false,
        isRefreshing: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.getActivityList();
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

    // 获取活动列表数据
    getActivityList: function(isLoadMore = false) {
        if (this.data.isLoading) return;
        
        this.setData({
            isLoading: true
        });

        // TODO: 调用后端接口获取活动列表数据
        // 这里暂时使用模拟数据
        const mockData = [
            {
                id: 1,
                title: '社区党员学习日活动',
                cover: '/assets/images/banner1.png',
                date: '2024-03-15',
                location: '社区活动中心'
            },
            {
                id: 2,
                title: '红色教育基地参观活动',
                cover: '/assets/images/banner2.png',
                date: '2024-03-20',
                location: '革命纪念馆'
            },
            {
                id: 3,
                title: '党员志愿服务日',
                cover: '/assets/images/banner3.png',
                date: '2024-03-25',
                location: '社区广场'
            }
        ];

        setTimeout(() => {
            if (isLoadMore) {
                this.setData({
                    activityList: [...this.data.activityList, ...mockData],
                    page: this.data.page + 1,
                    hasMore: this.data.page < 3, // 模拟只有3页数据
                    isLoading: false
                });
            } else {
                this.setData({
                    activityList: mockData,
                    page: 1,
                    hasMore: true,
                    isLoading: false,
                    isRefreshing: false
                });
            }
        }, 500);
    },

    // 搜索活动
    onSearch: function(e) {
        const searchValue = e.detail.value;
        this.setData({
            searchValue,
            page: 1
        });
        this.getActivityList();
    },

    // 下拉刷新
    onRefresh: function() {
        this.setData({
            isRefreshing: true
        });
        this.getActivityList();
    },

    // 上拉加载更多
    onLoadMore: function() {
        if (this.data.hasMore && !this.data.isLoading) {
            this.getActivityList(true);
        }
    },

    // 点击活动项
    onActivityTap: function(e) {
        const { id } = e.currentTarget.dataset;
        wx.navigateTo({
            url: `/pages/party/detail?id=${id}`
        });
    }
})