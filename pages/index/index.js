// index.js
const app = getApp()
const auth = require('../../utils/auth');

Page({
  data: {
    // 社区信息
    communityInfo: {
      name: '明发社区',
      description:'明发滨江新城一期坐落于滨江大道1号，南京长江大桥北堡下...',
      alldesc:'明发滨江新城一期坐落于滨江大道1号，南京长江大桥北堡下。小区交付于2006年，共有63栋楼房，建筑面积56万平方米，共3973户，划分为9个网格。2024年，社区不断探索小区和谐治理新模式，以“党建引领、多元共治、民主协商、科技赋能”为主线，建立“网格+物业”融合联动工作机制，明发一期物业在社区党委指导下，在融合服务党支部协助下，积极推进网格+物业全方位融合，实现网格员和物业管家联动互动融动，通过首问负责制、居民代表会商制等方式，努力做到小事不出楼栋，大事不出小区，难事不出社区。',
      
    },
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
    // 今昔对比图列表
    compareList:[
      {
        id: 1,
        before: '/assets/images/jingxi/105be.jpg',
        after: '/assets/images/jingxi/105af.jpg',
        title: '105号楼',
      },
      {
        id: 2,
        before: '/assets/images/jingxi/107be.jpg',
        after: '/assets/images/jingxi/107af.jpg',
        title: '107号楼',
      },  
      {
        id: 3,
        before: 'https://img.picui.cn/free/2025/05/26/68347314aed96.jpg',
        after: 'https://img.picui.cn/free/2025/05/26/68347314aed96.jpg',
        title: '今昔对比图',
      }
    ],
    // 活动列表
    activities: [
      {
        id: 1,
        cover: '/assets/images/huodong/hd3.jpg',
        title: '雷锋日活动',
        date:'2025-01-01',
        location:'社区活动室'
      },
      {
        id: 2,
        cover: '/assets/images/huodong/hd5.jpg',
        title: '迎春文艺汇演活动',
        date:'2025-01-02',
        location:'社区广场'
      },
      {
        id: 3,
        cover: '/assets/images/huodong/hd4.jpg',
        title: '写春联活动',
        date:'2025-01-03',
        location:'明发社区'
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

  // 导航到网格+物业联动页面
  onMoreParty() {
    wx.navigateTo({
      url: '/pages/index/wgwyld'
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
