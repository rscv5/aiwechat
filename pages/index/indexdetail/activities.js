// pages/index/indexdetail/activities.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        activity: null,
        allImages: [] // 存储所有图片的数组
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        const activityId = options.id;
        if (activityId) {
            // Get the activities list from the parent page (index page)
            const pages = getCurrentPages();
            const prevPage = pages[pages.length - 2];
            const activities = prevPage.data.activities;
            const currentActivity = activities.find(item => item.id == activityId);
            
            if (currentActivity) {
                // 处理图片数组
                const allImages = [currentActivity.cover];
                if (currentActivity.images && currentActivity.images.length > 0) {
                    currentActivity.images.forEach(img => {
                        allImages.push(img.src);
                    });
                }

                this.setData({
                    activity: currentActivity,
                    allImages: allImages
                });
            }
        }
    },


    previewImage(e) {
        const src = e.currentTarget.dataset.src;
        wx.previewImage({
            current: src,
            urls: this.data.allImages
        });
    }
})