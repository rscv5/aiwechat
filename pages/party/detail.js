Page({
  data: {
    activity: {
      id: 1,
      title: '党建活动1',
      date: '2025-01-01',
      location: '社区党员活动室',
      content: '<p>这里是活动详情内容，支持富文本格式。</p><p>可以包含多段文字、图片等内容。</p>',
      images: [
        '/assets/images/banner1.png',
        '/assets/images/banner2.png',
        '/assets/images/banner3.png'
      ]
    }
  },

  onLoad(options) {
    // 获取传递的参数
    const { id } = options
    // 根据id获取活动详情
    this.getActivityDetail(id)
  },

  // 获取活动详情
  getActivityDetail(id) {
    // 模拟获取数据
    const mockData = {
      1: {
        id: 1,
        title: '党建活动1',
        date: '2025-01-01',
        location: '社区党员活动室',
        content: '<p>这里是活动详情内容，支持富文本格式。</p><p>可以包含多段文字、图片等内容。</p>',
        images: [
          '/assets/images/banner1.png',
          '/assets/images/banner2.png',
          '/assets/images/banner3.png'
        ]
      },
      2: {
        id: 2,
        title: '党建活动2',
        date: '2025-01-02',
        location: '社区会议室',
        content: '<p>这里是活动详情内容，支持富文本格式。</p><p>可以包含多段文字、图片等内容。</p>',
        images: [
          '/assets/images/banner1.png',
          '/assets/images/banner2.png',
          '/assets/images/banner3.png'
        ]
      },
      3: {
        id: 3,
        title: '党建活动3',
        date: '2025-01-03',
        location: '社区活动中心',
        content: '<p>这里是活动详情内容，支持富文本格式。</p><p>可以包含多段文字、图片等内容。</p>',
        images: [
          '/assets/images/banner1.png',
          '/assets/images/banner2.png',
          '/assets/images/banner3.png'
        ]
      }
    }

    this.setData({
      activity: mockData[id] || mockData[1]
    })
  },

  // 预览图片
  previewImage(e) {
    const { url } = e.currentTarget.dataset
    wx.previewImage({
      current: url,
      urls: this.data.activity.images
    })
  }
}) 