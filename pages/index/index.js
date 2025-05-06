// index.js
const app = getApp()
const auth = require('../../utils/auth');

Page({
  data: {
    // 社区信息
    communityInfo: {
      name: '明发社区',
      address: '福建省厦门市思明区明发路1号',
      description:'智慧社区示范点'
    },
    // 党建活动列表
    partyActivities: [
      {
        id: 1,
        cover: '/assets/images/banner1.png',
        title: '党建活动1',
        date:'2025-01-01',
        location:'社区党员活动室'
      },
      {
        id: 2,
        cover: '/assets/images/banner2.png',
        title: '党建活动2',
        date:'2025-01-02',
        location:'社区会议室'
      },
      {
        id: 3,
        cover: '/assets/images/banner3.png',
        title: '党建活动3',
        date:'2025-01-03',
        location:'社区活动中心'
      }
    ],
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

  // 导航到党建活动页面
  onMoreParty() {
    wx.navigateTo({
      url: '/pages/party/list'
    })
  },

  // 党建活动卡片点击
  onPartyTap(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/party/detail?id=${id}`
    })
  },

  // 导航到社区活动页面
  onMoreActivity() {
    wx.navigateTo({
      url: '/pages/empty/index?title=社区活动'
    })
  },

  // 导航到社区公示页面
  onMoreNotice() {
    wx.navigateTo({
      url: '/pages/empty/index?title=社区公示'
    })
  },

  // 活动卡片点击
  onActivityTap(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/empty/index?title=活动详情&id=${id}`
    })
  },

  // 公示卡片点击
  onNoticeTap(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/empty/index?title=公示详情&id=${id}`
    })
  },

  // 处理随手拍点击
  handleCreateWorkorder: function() {
    if (auth.checkLogin()) {
      auth.redirectToWorkorder();
    }
  },
})
