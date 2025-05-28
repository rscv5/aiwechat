// pages/index/indexdetail/comparedetail.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        title: '',
        beforeImage: '',
        afterImage: '',
        description: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        if (options.title) {
            this.setData({
                title: decodeURIComponent(options.title)
            });
        }
        if (options.img) {
            this.setData({
                beforeImage: decodeURIComponent(options.img)
            });
        }
        // Get the after image from the compareList in the parent page
        const pages = getCurrentPages();
        const prevPage = pages[pages.length - 2];
        const compareList = prevPage.data.compareList;
        const currentItem = compareList.find(item => item.before === this.data.beforeImage);
        if (currentItem) {
            this.setData({
                afterImage: currentItem.after,
                description: currentItem.title
            });
        }
    },



    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    },

    // Preview before image
    previewBeforeImage() {
        wx.previewImage({
            current: this.data.beforeImage,
            urls: [this.data.beforeImage]
        });
    },

    // Preview after image
    previewAfterImage() {
        wx.previewImage({
            current: this.data.afterImage,
            urls: [this.data.afterImage]
        });
    }
})