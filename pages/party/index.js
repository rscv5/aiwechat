Page({
  data: {
    searchValue: '',
    activityList: [
      {
        id: 1,
        title: '社区党员学习日活动',
        cover: '/images/party/activity1.jpg',
        date: '2024-03-15',
        location: '社区活动中心',
        status: '进行中'
      },
      {
        id: 2,
        title: '红色教育基地参观活动',
        cover: '/images/party/activity2.jpg',
        date: '2024-03-20',
        location: '革命纪念馆',
        status: '报名中'
      },
      {
        id: 3,
        title: '党员志愿服务日',
        cover: '/images/party/activity3.jpg',
        date: '2024-03-25',
        location: '社区广场',
        status: '即将开始'
      }
    ]
  },

  onLoad: function(options) {
    // 页面加载时获取活动列表数据
    this.getActivityList();
  },

  // 获取活动列表数据
  getActivityList: function() {
    // TODO: 调用后端接口获取活动列表数据
    // 这里暂时使用模拟数据
  },

  // 搜索活动
  onSearch: function(e) {
    const searchValue = e.detail.value;
    this.setData({
      searchValue
    });
    // TODO: 根据搜索关键词过滤活动列表
  },

  // 点击活动项
  onActivityTap: function(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/party/detail?id=${id}`
    });
  },

  // 点击更多按钮
  onMoreParty: function() {
    wx.navigateTo({
      url: '/pages/party/list'
    });
  }
}); 