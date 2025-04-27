项目根目录
├── app.js                // 小程序全局逻辑入口，定义全局数据、生命周期等
├── app.json              // 小程序全局配置，包含页面路由、窗口样式、tabBar配置、权限声明等
│   ├── pages            // 页面路由配置
│   ├── window          // 全局窗口样式
│   ├── tabBar          // 底部导航栏配置
│   ├── permission      // 权限声明配置
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
│       ├── community-header/   // 社区头部信息组件
│       │   ├── index.js
│       │   ├── index.json
│       │   ├── index.wxml
│       │   └── index.wxss
│       ├── section-title/     // 板块标题组件
│       │   ├── index.js
│       │   ├── index.json
│       │   ├── index.wxml
│       │   └── index.wxss
│       ├── activity-card-list/ // 活动卡片横滑组件
│       │   ├── index.js
│       │   ├── index.json
│       │   ├── index.wxml
│       │   └── index.wxss
│       └── notice-card-list/   // 公示卡片横滑组件
│           ├── index.js
│           ├── index.json
│           ├── index.wxml
│           └── index.wxss
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
│   ├── index/          // 首页
│   │   ├── index.js    // 首页逻辑
│   │   ├── index.json  // 首页配置
│   │   ├── index.wxml  // 首页结构
│   │   └── index.wxss  // 首页样式
│   └── quickPhoto/     // 随手拍页面
│       ├── quickPhoto.js      // 页面逻辑：处理拍照、表单提交、定位等功能
│       ├── quickPhoto.json    // 页面配置：设置导航栏标题等
│       ├── quickPhoto.wxml    // 页面结构：包含拍照上传、问题描述、地址信息等模块
│       └── quickPhoto.wxss    // 页面样式：定义渐变背景、卡片布局、按钮样式等
│
├── package.json         // 项目依赖配置
└── project.config.json  // 项目配置文件
    ├── appid           // 小程序AppID
    ├── setting         // 项目设置
    │   ├── packNpmManually      // 手动构建npm
    │   └── packNpmRelationList  // npm包关系配置
    └── editorSetting   // 编辑器设置