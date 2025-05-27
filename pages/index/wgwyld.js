// pages/index/wgwyld.js
Page({
    data: {
      img: '',
      title: ''
    },
    onLoad(options) {
      if (!options.img || !options.title) {
        wx.showToast({
          title: '参数错误',
          icon: 'none'
        });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
        return;
      }

      this.setData({
        img: decodeURIComponent(options.img),
        title: decodeURIComponent(options.title)
      });
    },

    // 图片加载失败处理
    onImageError() {
      wx.showToast({
        title: '图片加载失败',
        icon: 'none'
      });
    },

    // 预览图片方法
    previewImage() {
      wx.previewImage({
        current: this.data.img, // 当前显示图片的链接
        urls: [this.data.img]   // 需要预览的图片链接列表
      });
    }
});