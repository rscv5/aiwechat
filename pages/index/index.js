// index.js
const app = getApp()

Page({
  data: {
    // 社区信息
    communityInfo: {
      name: '明发社区',
      address: '福建省厦门市思明区明发路1号',
      description:'智慧社区示范点'
    },
    // 活动列表
    activities: [
      {
        id: 1,
        cover: '/assets/images/banner1.png',
        title: '社区活动1',
        date:'2025-01-01',
        location:'社区活动室'
      },
      {
        id: 2,
        cover: '/assets/images/banner2.png',
        title: '社区活动2',
        date:'2025-01-02',
        location:'社区广场'
      },
      {
        id: 3,
        cover: '/assets/images/banner3.png',
        title: '社区活动3',
        date:'2025-01-03',
        location:'社区会议室'
      }
      //...可继续添加
    ],
    // 公示列表
    notices: [
      {
        id: 1,
        cover: '/assets/images/banner1.png',
        title: '社区公示1',
        date:'2025-01-01',
        desc:'党建之星公示。'
      },
      {
        id: 2,
        cover: '/assets/images/banner2.png',
        title: '社区公示2',
        date:'2025-01-02',
        desc:'文明家庭公示。'
      },
      {
        id: 3,
        cover: '/assets/images/banner3.png',
        title: '社区公示3',
        date:'2025-01-03',
        desc:'社区建设进展公示。'
      }
    ]
  },

  onLoad() {
    // 获取全局社区信息
    this.setData({
      communityInfo: app.globalData.communityInfo
    })
  },

  // 导航到社区活动页面
  navigateToActivity() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  },

  // 导航到社区公示页面
  navigateToNotice() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  }
})
