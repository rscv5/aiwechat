import { API } from '../constants/index'
// 网络请求工具函数
// 封装请求方法 使用Promise
const request = (options) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${API.BASE_URL}${options.url}`,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'content-type': 'application/json',
        ...options.header
      },
      timeout: API.TIMEOUT, 
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data)
        } else {
          reject(res)
        }
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

export default request 