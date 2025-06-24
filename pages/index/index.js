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

        cover:'https://img.picgo.net/2025/06/03/123jizhi7a52140969699dd4.jpg',
        title: '1+2+3工作机制',
      },
      {
        id: 2,
        cover:'https://img.picgo.net/2025/06/03/zuzhijiagou6ba5fca00a9c3c7c.jpg',
        //cover: '/assets/images/zuzhijiagou.jpg',
        title: '组织架构图',
      }
    ],

    // 网格+物业联动工作风采
    gridGallery:[
      {
        title:"安全走访",
        images:[
          { 
            src:"https://img.picgo.net/2025/06/12/74526ccfa8788cc1b986dcb1f70f59f553fb620ad024b449.jpg",
            caption:"网格员和物业管家一起检查弱电箱杂物"
          },
          {
            src:"https://img.picgo.net/2025/06/12/e38fbae726ccfe18b3b808689b389eb05294d94ec0b35e96.jpg",
            caption:"网管员和物业一起巡查小区路桩"
          }
        ],
      },
      {
        title:"拆除违建",
        images:[
          {
            src:"https://img.picgo.net/2025/06/12/1124e62970f977c14e9.jpg",
            caption:"拆除112栋一楼违建"
          },
          {
            src:"https://img.picgo.net/2025/06/12/143ff447d51dc3bc82a.jpg",
            caption:"拆除143楼顶违建"
          }
        ],
      },
      {
        title:"关爱老人",
        images:[
          {
            src:"https://img.picgo.net/2025/06/12/863ad96f4099877426e9544902d5d2633c0c37d73b9c4b91.jpg",
            caption:"网格员和物业管家走访独居老人"
          },
          {
            src:"https://img.picgo.net/2025/06/12/a80c9ceac63b23360a64f793e902dc487eb2b297c32b297c.jpg",
            caption:"网格员和物业管家走访独居老人"
          }
        ],
      },
      {
        title:"小区整治",
        images:[
          {
            src:"https://img.picgo.net/2025/06/12/4f78bbbe084c675a4962b8e16bc2b14876881f838cfdcdd9.jpg",
            caption:"网格员和物业管家共同清理楼道杂物"
          },
          {
            src:"https://img.picgo.net/2025/06/12/34a6a9d08ae1cc7596649dbacac972b3e52ece88f3bc8c04.jpg",
            caption:"网格员和物业管家共同巡查小区"
          }
        ],
      },
      {
        title:"议事协商",
        images:[
          {
            src:"https://img.picgo.net/2025/06/24/_20250624084311f67adc80c1c782ba.jpg",
            caption:"2024年10月10日一期房屋渗水维修施工单位选聘"
          },
          {
            src:"https://img.picgo.net/2025/06/12/202541431a9d074ccbe4415.jpg",
            caption:"2025年4月14日一期管委会消防电系统会议"
          }
        ]
      }
    ],
    
    // 今昔对比图列表
    compareList:[
      {
        id: 1,
        before: 'https://img.picgo.net/2025/06/12/9e567cf09dac76baa99c0bd4810405de621e309d9ad262a5.jpg',
        after: 'https://img.picgo.net/2025/06/12/36f11c1538bc749638286f3fca9349f703d7b4eccc5807e2.jpg',
        title: '105栋西边围墙整改',
      },
      {
        id: 2,
        before: 'https://img.picgo.net/2025/06/12/2b9bf7fd27315ec054624d7b8cf164d2be9c5cd13ce3fdef.jpg',
        after: 'https://img.picgo.net/2025/06/12/1eca936205391186b2224851159acd07521fc943bfff0bbf.jpg',
        title: '110栋西边围墙',
      },  
      {
        id: 3,
        before: 'https://img.picgo.net/2025/06/12/ce6fdc01e1f8d3714879117fbc01392455aff90943afae25.png',
        after: 'https://img.picgo.net/2025/06/12/a5e48bb6b9539357e03ca5b11c24967d6ec7b997497f38f5.png',
        title: '115栋侧面绿化及路面改造',
      },
      {
        id:4,
        before:'https://img.picgo.net/2025/06/12/215feaac734a55f208575b747a6fb4a86bfd97e34f85c89a.png',
        after:'https://img.picgo.net/2025/06/12/1f935a990787f60900ec1e53e9d6fbc7e515a013208b047e.png',
        title:'128栋宅间道绿化和花坛改造',
      },
      {
        id:5,
        before:'https://img.picgo.net/2025/06/12/dd726c7fcc7d2ceed9c8ff268af5ff01cb899c6a47989887.png',
        after:'https://img.picgo.net/2025/06/12/f41f380961cc44647bf7e7707b7b70acc7e3a11506000082.jpg',
        title:'135栋前停车位改造'
      },
      {
        id:6,
        before:'https://img.picgo.net/2025/06/12/a2648876bddb49857949bd2978f95b1a9d422acb68a37482.png',
        after:'https://img.picgo.net/2025/06/12/c35fffd33b38da8b85eb09866a056e00c64b3358f87d617f.png',
        title:'138栋前休闲区改造'
      },
      {
        id:7,
        before:'https://img.picgo.net/2025/06/12/1748b4d14b03bf3cfa1d26543f1b61d87074ae6272309eb1.png',
        after:'https://img.picgo.net/2025/06/12/02405289b3fa7485a4e39fe57c2fb94c65985bd40dbf0aae.jpg',
        title:'161栋增加电动车棚'
      },
      {
        id:8,
        before:'https://img.picgo.net/2025/06/12/a5ba5f26f29bdcf9cb707a078112bc4ac30d13416c015e98.png',
        after:'https://img.picgo.net/2025/06/12/5c5d4d6da3b189edf5944500d4d2a0a40ce7d000112b1ab8.jpg',
        title:'网球场旁河道改造'
      }
    ],
    // 活动列表
    activities: [
      {
        id: 1,
        cover: 'https://img.picgo.net/2025/06/12/b01fc0c80957386a713d11f8a0676a813a23ece1835092e2.jpg',
        images:[
          {src:'https://img.picgo.net/2025/06/12/5ee236670dea066f2b0bdf9ba2d2c38a0c660b383c61c843.jpg'},
          {src:'https://img.picgo.net/2025/06/12/292802b157434ac26e1856eb334161930ffb0f6e29e9dcff.jpg'},
          {src: 'https://img.picgo.net/2025/06/12/1c29b3b9e37a8797a.jpg'},
        ],
        title: '雷锋日活动',
        date:'2025-01-01',
        location:'明发社区活动点',
        desc:'网格员和三期南物业开展雷锋日活动'
      },
      {
        id: 2,
        cover: 'https://img.picgo.net/2025/06/12/1738a9fb86b25f02b.jpg',
        images:[
          {src:'https://img.picgo.net/2025/06/12/56a21668b2bafe4e3517826d95a04bbceee96c43380df8cb.jpg'}
        ],
        title: '迎春文艺汇演活动',
        date:'2025-01-02',
        location:'社区广场',
        desc:'网格员和物业开展迎春文艺汇演活动'
      },
      {
        id: 3,
        cover: 'https://img.picgo.net/2025/06/12/51875a8fe40187283f118bf7c6eb756340c2d2cbc7a28963.jpg',
        images:[],
        title: '义卖活动',
        date:'2025-01-03',
        location:'明发社区',
        desc:'网格员和一期物业开展义卖活动'
      },
      {
        id: 4,
        cover: 'https://img.picgo.net/2025/06/12/dc95bbc09635717a32ac6e9eeea00b94aaf85432a33f305b.jpg',
        images:[
          {src:'https://img.picgo.net/2025/06/12/5b318b48f3d20ec99acf1a9717b3aa092ad38edbfb122e9c.jpg'},
        ],
        title: '写春联活动',
        date:'2025-01-03',
        location:'明发社区',
        desc:'网格员和物业开展写春联活动'
      },
      {
        id:5,
        cover: 'https://img.picgo.net/2025/06/12/4e4afbd963df986721d3f489c1e19516ab344c1357113d59.jpg',
        images:[],
        title: '便民活动',
        date:'2025-01-03',
        location:'明发社区',
        desc:'网格员和物业开展便民活动'
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

  // //跳转到今昔对比网页
  // onMoreCompare(){
  //   wx.navigateTo({
  //     url: 'pages/index/indexdetail/comparedetail',
  //   })
  // },

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
      url: '/pages/index/indexdetail/actlist'
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
      url: `/pages/index/indexdetail/activities?id=${id}`
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
