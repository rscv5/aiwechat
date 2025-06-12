const config = {
  // 改为后端公网地址
  //baseURL: 'http://localhost:8080',
  baseURL:'https://nbk-166874-7-1363275395.sh.run.tcloudbase.com',
  cloudEnvId: 'prod-2gkqpkkx34c0e2f2', // 您的云托管环境ID
  cloudServiceName: 'nbk', // 您的云托管服务名称
  appId: 'wxf64337e0a929c126', // 您小程序的AppID
  api: {
    login: '/api/user/login',
    userInfo: '/api/user/info'
  }
}

export default config 