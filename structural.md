项目根目录
├── app.js                // 小程序全局逻辑入口，定义全局数据、生命周期等
├── app.json              // 小程序全局配置，包含页面路由、窗口样式、tabBar配置、权限声明等
│   ├── pages            // 页面路由配置
│   │   ├── index/index          // 首页（展示页面）
│   │   ├── party/index          // 党建首页
│   │   ├── party/list           // 党建活动列表
│   │   ├── party/detail         // 党建活动详情
│   │   ├── login/login          // 登录页面
│   │   ├── user/index/index     // 用户中心
│   │   ├── grid/index/index     // 网格员中心
│   │   ├── quickPhoto/quickPhoto // 随手拍页面
│   │   ├── workOrderList/workOrderList // 工单列表
│   │   └── workOrderDetail/workOrderDetail // 工单详情
│   ├── window          // 全局窗口样式
│   ├── tabBar          // 底部导航栏配置
│   │   ├── 首页（展示页面）
│   │   └── 随手拍（需要登录）
│   ├── permission      // 权限声明配置
│   │   └── 位置权限（用于随手拍定位）
│   └── style           // 全局样式版本
├── app.wxss              // 小程序全局样式
│
├── assets/               // 静态资源目录
│   ├── icons/           // 存放所有图标
│   │   ├── home.png            // 首页未选中图标
│   │   ├── home-active.png     // 首页选中图标
│   │   ├── camera.png          // 随手拍未选中图标
│   │   └── camera-active.png   // 随手拍选中图标
│   └── images/          // 存放图片资源
│
├── components/           // 公共组件目录
│   └── common/          // 通用组件
│       ├── community-header/   // 社区头部信息组件：展示社区名称、简介等，提升归属感，
                                 首页和工单页均可复用
│       │   ├── index.js
│       │   ├── index.json
│       │   ├── index.wxml
│       │   └── index.wxss
│       ├── section-title/     // 板块标题组件：支持主标题和"更多"按钮，适用于各分区标题，
                                    结构清晰，风格统一
│       │   ├── index.js
│       │   ├── index.json
│       │   ├── index.wxml
│       │   └── index.wxss
│       ├── activity-card-list/ // 活动卡片横滑组件：横向滑动展示社区活动卡片，支持点击事件，首页常用
│       │   ├── index.js
│       │   ├── index.json
│       │   ├── index.wxml
│       │   └── index.wxss
│       ├── notice-card-list/   // 公示卡片横滑组件：横向滑动展示社区公示信息，支持点击事件，首页常用
│       │   ├── index.js
│       │   ├── index.json
│       │   ├── index.wxml
│       │   └── index.wxss
│       ├── status-tab/         // 状态筛选tab组件：横向滚动tab，支持筛选、动画、全局复用
│       │   ├── index.js
│       │   ├── index.json
│       │   ├── index.wxml
│       │   └── index.wxss
│       └── common/          // 通用组件
│
├── constants/            // 常量定义目录
│   └── index.js         // 各类常量（如API、路由、资源路径等）
│
├── services/            // API服务目录
│   └── api.js           // 封装所有后端接口
│
├── utils/               // 工具函数目录
│   └── request.js       // 网络请求封装
│
├── pages/               // 页面目录
│   ├── index/          // 首页（展示页面）
│   │   ├── index.js    // 首页逻辑：展示社区信息、党建活动、社区活动、公示信息等
│   │   ├── index.json  // 首页配置
│   │   ├── index.wxml  // 首页结构
│   │   └── index.wxss  // 首页样式
│   ├── party/          // 党建相关页面
│   │   ├── index.js    // 党建首页逻辑
│   │   ├── list.js     // 党建活动列表逻辑
│   │   └── detail.js   // 党建活动详情逻辑
│   └── quickPhoto/     // 随手拍页面
│       ├── quickPhoto.js      // 页面逻辑：处理拍照、表单提交、定位等功能，包含登录检查
│       ├── quickPhoto.json    // 页面配置：设置导航栏标题等
│       ├── quickPhoto.wxml    // 页面结构：包含拍照上传、问题描述、地址信息等模块
│       └── quickPhoto.wxss    // 页面样式：定义渐变背景、卡片布局、按钮样式等
│
├── workOrderList/     // 工单列表页面
│   ├── workOrderList.js      // 工单列表逻辑，状态管理、跳转、筛选
│   ├── workOrderList.json    // 页面配置，引用tab组件
│   ├── workOrderList.wxml    // 页面结构，卡片列表、空状态、悬浮按钮
│   └── workOrderList.wxss    // 页面样式，卡片、按钮、动画等
│
├── workOrderDetail/   // 工单详情页面
│   ├── workOrderDetail.js      // 工单详情逻辑，图片浏览、脱敏、进度、返回
│   ├── workOrderDetail.json    // 页面配置
│   ├── workOrderDetail.wxml    // 页面结构，图片浏览、详情、进度、返回
│   └── workOrderDetail.wxss    // 页面样式，卡片、图片、按钮等
│
├── package.json         // 项目依赖配置
└── project.config.json  // 项目配置文件
    ├── appid           // 小程序AppID
    ├── setting         // 项目设置
    │   ├── packNpmManually      // 手动构建npm
    │   └── packNpmRelationList  // npm包关系配置
    └── editorSetting   // 编辑器设置

更新说明：
1. 页面路由调整：
   - 首页（index）作为展示页面，展示社区信息、党建活动等
   - 随手拍（quickPhoto）作为 tabBar 入口，需要登录才能使用
   - 党建相关页面（party）放在首页之后，方便用户访问

2. 功能变更：
   - 随手拍页面添加登录检查，未登录用户会提示并跳转到登录页面
   - 首页作为展示页面，不需要登录即可访问
   - 党建活动页面作为展示内容的一部分，增强社区文化建设

3. 权限配置：
   - 保留位置权限配置，用于随手拍功能
   - 其他权限根据实际需求配置