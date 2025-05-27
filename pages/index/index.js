// index.js
const app = getApp()
const auth = require('../../utils/auth');


Page({
  data: {
    
    showIntro: false, // 控制简介弹窗显示状态
    // 网格+物业联动结构图列表
    partyActivities: [
      {
        id: 1,
        cover: '/assets/images/123jizhi.jpg',
        title: '1+2+3工作机制',
      },
      {
        id: 2,
        cover: '/assets/images/zuzhijiagou.jpg',
        title: '组织架构图',
      }
    ],

    // 网格+物业联动工作风采
    gridGallery:[
      {
        title:"安全走访",
        images:[
          { 
            src:"https://img.picui.cn/free/2025/05/27/68356a6e63016.jpg",
            caption:"网格员和物业管家一起检查弱电箱杂物"
          },
          {
            src:"https://img.picui.cn/free/2025/05/27/68356b6b16584.jpg",
            caption:"网管员和物业一起巡查小区路桩"
          }
        ],
      },
      {
        title:"拆除违建",
        images:[
          {
            src:"https://img.picui.cn/free/2025/05/27/68356c2e8dbb8.jpg",
            caption:"拆除112栋一楼违建"
          },
          {
            src:"https://img.picui.cn/free/2025/05/27/68356c87c013c.jpg",
            caption:"拆除143楼顶违建"
          }
        ],
      },
      {
        title:"关爱老人",
        images:[
          {
            src:"https://img.picui.cn/free/2025/05/27/68357f103e9fa.jpg",
            caption:"网格员和物业管家走访独居老人"
          },
          {
            src:"https://img.picui.cn/free/2025/05/27/68356dcfa741e.jpg",
            caption:"网格员和物业管家走访独居老人"
          }
        ],
      },
      {
        title:"小区整治",
        images:[
          {
            src:"https://img.picui.cn/free/2025/05/27/68356e5c89502.jpg",
            caption:"网格员和物业管家共同清理楼道杂物"
          },
          {
            src:"https://img.picui.cn/free/2025/05/27/68356e5b5b2a2.jpg",
            caption:"网格员和物业管家共同巡查小区"
          }
        ],
      },
      {
        title:"议事协商",
        images:[
          {
            src:"https://img.picui.cn/free/2025/05/27/68356eddb810e.jpg",
            caption:"2024年10月10日一期房屋渗水维修施工单位选聘"
          },
          {
            src:"https://img.picui.cn/free/2025/05/27/68356edc5f90e.jpg",
            caption:"2025年4月14日一期管委会消防电系统会议"
          }
        ]
      }
    ],
    
    // 今昔对比图列表
    compareList:[
      {
        id: 1,
        before: 'https://img.picui.cn/free/2025/05/27/683571b7c5509.jpg',
        after: 'https://img.picui.cn/free/2025/05/27/683571ba345e4.jpg',
        title: '105栋西边围墙整改',
      },
      {
        id: 2,
        before: 'https://img.picui.cn/free/2025/05/27/683572787ef95.jpg',
        after: 'https://img.picui.cn/free/2025/05/27/6835727c5b8b3.jpg',
        title: '110栋西边围墙',
      },  
      {
        id: 3,
        before: 'https://img.picui.cn/free/2025/05/27/68357308e3c7d.png',
        after: 'https://img.picui.cn/free/2025/05/27/683572ca130a4.png',
        title: '115栋侧面绿化及路面改造',
      },
      {
        id:4,
        before:'https://img.picui.cn/free/2025/05/27/68357354dc00c.png',
        after:'https://img.picui.cn/free/2025/05/27/6835735754b69.png',
        title:'128栋宅间道绿化和花坛改造',
      },
      {
        id:5,
        before:'https://img.picui.cn/free/2025/05/27/683573fe18f81.png',
        after:'https://img.picui.cn/free/2025/05/27/683573d4966c4.jpg',
        title:'135栋前停车位改造'
      },
      {
        id:6,
        before:'https://img.picui.cn/free/2025/05/27/68357496da0b0.png',
        after:'https://img.picui.cn/free/2025/05/27/68357497ece17.png',
        title:'138栋前休闲区改造'
      },
      {
        id:7,
        before:'https://img.picui.cn/free/2025/05/27/6835752d51842.png',
        after:'https://img.picui.cn/free/2025/05/27/6835752f52a6c.jpg',
        title:'161栋增加电动车棚'
      },
      {
        id:8,
        before:'https://img.picui.cn/free/2025/05/27/683575cb58056.png',
        after:'https://img.picui.cn/free/2025/05/27/683575cdbdfae.jpg',
        title:'网球场旁河道改造'
      }
    ],
    // 活动列表
    activities: [
      {
        id: 1,
        cover: 'https://img.picui.cn/free/2025/05/27/68357976848f3.jpg',
        title: '雷锋日活动',
        date:'2025-01-01',
        location:'明发社区活动点'
      },
      {
        id: 2,
        cover: 'https://img.picui.cn/free/2025/05/27/6835794bf2994.jpg',
        title: '迎春文艺汇演活动',
        date:'2025-01-02',
        location:'社区广场'
      },
      {
        id: 3,
        cover: 'https://img.picui.cn/free/2025/05/27/683579c2bacda.jpg',
        title: '义卖活动',
        date:'2025-01-03',
        location:'明发社区'
      },
      {
        id: 4,
        cover: 'https://img.picui.cn/free/2025/05/27/68357a33377cd.jpg',
        title: '写春联活动',
        date:'2025-01-03',
        location:'明发社区'
      },
      {
        id:5,
        conver: 'https://img.picui.cn/free/2025/05/27/68357a6e7658c.jpg',
        title: '便民活动',
        date:'2025-01-03',
        location:'明发社区'
      }
    ],
    // 公示列表
    notices: [
      {
        id: 1,
        cover: 'none',
        title: '社区公示1',
        date:'2025-01-01',
        desc:'党建之星公示。'
      },
    ],

  },

  
  // 显示小区简介弹窗
  showCommunityIntroModal() {
    this.setData({ showIntro: true });
  },
  
  // 隐藏小区简介弹窗
  hideCommunityIntroModal() {
    this.setData({ showIntro: false });
  },
  
  // 禁止背景滚动
  preventTouchMove() {},


  onLoad() {
    // 获取全局社区信息
    this.setData({
      communityInfo: app.globalData.communityInfo
    })
  },



  // 网格+物业图片点击
  onPartyTap(e) {
    const id = e.currentTarget.dataset.id;
    // 找到当前卡片对应的数据
    const item = this.data.partyActivities.find(i => i.id === id);
    if (item) {
      // 跳转并传递图片地址（可用 query 或全局变量/缓存）
      wx.navigateTo({
        url: `/pages/index/wgwyld?img=${encodeURIComponent(item.cover)}&title=${encodeURIComponent(item.title)}`
      });
    }
  },


  // 预览图片方法
  previewImage(e) {
    const src = e.currentTarget.dataset.src;
    wx.previewImage({
      current: src,
      urls:[src]
    });
  },

  //跳转到今昔对比网页
  onMoreCompare(){
    wx.navigateTo({
      url: 'pages/index/indexdetail/comparedetail',
    })
  },

  //今昔对比跳转
  onCompareTap(e) {
    const id = e.currentTarget.dataset.id;
    // 找到当前卡片对应的数据
    const item = this.data.compareList.find(i => i.id === id);
    if (item) {
      //跳转今昔对比页面
      wx.navigateTo({
        url: `/pages/index/indexdetail/comparedetail?img=${encodeURIComponent(item.before)}&title=${encodeURIComponent(item.title)}`
      });
    }
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

  // 处理 tabBar 点击
  onTabItemTap(item) {
    if (item.text === '随手拍') {
      this.handleCreateWorkorder();
    }
  }
})
