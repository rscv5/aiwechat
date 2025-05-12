// 社区相关常量
const COMMUNITY = {
  NAME: '明发社区',
  ADDRESS: '示例地址',
  DESCRIPTION: '智慧社区示范点'
}

// API相关常量
const API = {
  BASE_URL: 'http://127.0.0.1:8080',
  TIMEOUT: 5000,
  MAP_KEY: '3JDBZ-UF5WT-CYFXS-LRPKS-22BLO-7AFBN' // 我的腾讯地图 key
}

// 本地存储键名
const STORAGE_KEYS = {
  USER_INFO: 'userInfo',
  TOKEN: 'token',
  COMMUNITY_INFO: 'communityInfo'
}

// 页面路径
const ROUTES = {
  INDEX: '/pages/index/index',
  QUICK_PHOTO: '/pages/quickPhoto/quickPhoto',
  ACTIVITY: '/pages/activity/activity',
  NOTICE: '/pages/notice/notice'
}

// 图片资源路径
const ASSETS = {
  ICONS: {
    HOME: '/assets/icons/home.png',
    HOME_ACTIVE: '/assets/icons/home-active.png',
    CAMERA: '/assets/icons/camera.png',
    CAMERA_ACTIVE: '/assets/icons/camera-active.png',
    ACTIVITY: '/assets/icons/activity.png',
    NOTICE: '/assets/icons/notice.png'
  },
  IMAGES: {
    BANNER1: '/assets/images/banner1.png',
    BANNER2: '/assets/images/banner2.png',
    BANNER3: '/assets/images/banner3.png'
  }
}

// 时间格式化函数
function formatDate(date) {
  if (!date) return '';
  
  // 处理字符串日期
  if (typeof date === 'string') {
    // 将日期字符串转换为 iOS 兼容的格式
    date = date.replace(/-/g, '/');
  }
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const pad = n => n < 10 ? '0' + n : n;
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

module.exports = {
  COMMUNITY,
  API,
  STORAGE_KEYS,
  ROUTES,
  ASSETS,
  formatDate
} 