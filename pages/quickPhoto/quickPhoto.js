// pages/quickPhoto/quickPhoto.js
import { API, formatDate } from '../../constants/index';

Page({

    /**
     * 页面的初始数据
     */
    data: {
        images: [],
        content: '',
        location: '',
        building: '',
        phone: '',
        canSubmit: false,
        submitting: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        // 检查是否已登录
        const userInfo = wx.getStorageSync('userInfo');
        if (!userInfo) {
            wx.showModal({
                title: '提示',
                content: '请先登录后再使用随手拍功能',
                showCancel: false,
                success: () => {
                    wx.switchTab({
                        url: '/pages/index/index'
                    });
                    setTimeout(() => {
                        wx.navigateTo({
                            url: '/pages/login/login'
                        });
                    }, 100);
                }
            });
            return;
        }
        this.getLocation();
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    },

    // 拍照或选择图片
    async takePhoto() {
        try {
            // 检查相机权限
            const auth = await wx.getSetting();
            if (!auth.authSetting['scope.camera']) {
                await wx.authorize({ scope: 'scope.camera' });
            }

            // 调用相机
            const res = await wx.chooseMedia({
                count: 3 - this.data.images.length,
                mediaType: ['image'],
                sourceType: ['camera'],  // 只允许使用相机
                camera: 'back',
                sizeType: ['compressed']
            });

            // 更新图片列表
            const newImages = [...this.data.images, ...res.tempFiles.map(file => file.tempFilePath)];
            this.setData({ images: newImages }, () => {
                this.validateForm();
            });
        } catch (error) {
            if (error.errMsg.includes('authorize:fail')) {
                wx.showModal({
                    title: '需要相机权限',
                    content: '请在设置中允许使用相机',
                    confirmText: '去设置',
                    success: (res) => {
                        if (res.confirm) {
                            wx.openSetting();
                        }
                    }
                });
            } else {
                wx.showToast({
                    title: '操作失败，请重试',
                    icon: 'none'
                });
            }
        }
    },

    // 预览图片
    previewImage(e) {
        const index = e.currentTarget.dataset.index;
        wx.previewImage({
            current: this.data.images[index],
            urls: this.data.images
        });
    },

    // 删除图片
    removeImage(e) {
        const index = e.currentTarget.dataset.index;
        const images = [...this.data.images];
        images.splice(index, 1);
        this.setData({ images }, () => {
            this.validateForm();
        });
    },

    // 获取位置信息
    async getLocation() {
        this.setData({ locationLoading: true });
        try {
            // 先检查位置权限
            const auth = await wx.getSetting();
            if (!auth.authSetting['scope.userLocation']) {
                try {
                    await wx.authorize({ scope: 'scope.userLocation' });
                } catch (authError) {
                    wx.showModal({
                        title: '需要位置权限',
                        content: '请在设置中允许使用位置信息',
                        confirmText: '去设置',
                        success: (res) => {
                            if (res.confirm) {
                                wx.openSetting();
                            }
                        }
                    });
                    throw new Error('用户拒绝授权位置信息');
                }
            }

            // 获取位置信息
            const locationRes = await new Promise((resolve, reject) => {
                wx.getLocation({
                    type: 'gcj02',
                    success: resolve,
                    fail: reject
                });
            });

            if (!locationRes || !locationRes.latitude || !locationRes.longitude) {
                throw new Error('获取位置信息失败');
            }

            // 使用微信内置的逆地址解析，获取更详细的地址信息
            const addressRes = await new Promise((resolve, reject) => {
                wx.request({
                    url: `https://apis.map.qq.com/ws/geocoder/v1/?location=${locationRes.latitude},${locationRes.longitude}&key=${API.MAP_KEY}&get_poi=1`,
                    method: 'GET',
                    success: resolve,
                    fail: reject
                });
            });

            if (!addressRes || !addressRes.data) {
                throw new Error('获取地址信息失败');
            }

            if (addressRes.data.status === 0 && addressRes.data.result) {
                const result = addressRes.data.result;
                let address = result.address;
                
                // 如果有周边POI信息，添加到地址中
                if (result.pois && result.pois.length > 0) {
                    const nearestPoi = result.pois[0];
                    address = `${address}（${nearestPoi.title}）`;
                }

                this.setData({ 
                    location: address,
                    locationLoading: false
                }, () => {
                    this.validateForm();
                });
            } else {
                throw new Error(addressRes.data.message || '获取地址失败');
            }
        } catch (error) {
            console.error('Location error:', error);
            this.setData({ 
                location: '',
                locationLoading: false
            });
            wx.showToast({
                title: error.message || '获取位置失败，请重试',
                icon: 'none',
                duration: 2000
            });
        }
    },

    // 输入事件处理
    onContentInput(e) {
        this.setData({
            content: e.detail.value
        }, () => {
            this.validateForm();
        });
    },

    onBuildingInput(e) {
        // 只允许输入数字
        const value = e.detail.value.replace(/[^\d]/g, '');
        this.setData({
            building: value
        }, () => {
            this.validateForm();
        });
    },

    onPhoneInput(e) {
        this.setData({
            phone: e.detail.value
        }, () => {
            this.validateForm();
        });
    },

    // 表单验证
    validateForm() {
        const { images, content, location, building, phone } = this.data;
        const isValid = 
            images.length > 0 && 
            images.length <= 3 &&
            content.length >= 0 &&
            content.length <= 200 &&
            location &&
            building &&
            /^1[3-9]\d{9}$/.test(phone);

        this.setData({ canSubmit: isValid });
    },

    // 提交工单
    async submit() {
        if (this.data.submitting) return;
        this.setData({ submitting: true });
        wx.showLoading({
            title: '提交中...',
            mask: true
        });

        try {
            // 1. 获取用户信息
            const userInfo = wx.getStorageSync('userInfo');
            if (!userInfo || !userInfo.openid) {
                throw new Error('请先登录');
            }

            // 2. 上传图片（如果有）
            let imageUrls = [];
            if (this.data.images.length > 0) {
                // TODO: 实现图片上传逻辑
                // 这里需要调用文件上传接口
                // 暂时使用本地路径
                imageUrls = this.data.images;
            }

            // 3. 构造工单数据
            const orderData = {
                userOpenid: userInfo.openid,
                title: this.data.content.substring(0, 50), // 取前50个字符作为标题
                description: this.data.content,
                imageUrls: imageUrls.join(','), // 将图片URL数组转换为逗号分隔的字符串
                address: this.data.location, // 使用address字段存储地址字符串
                buildingInfo: this.data.building,
                status: '未领取' // 使用正确的状态值
            };

            // 4. 调用后端API提交工单
            const response = await wx.request({
                url: 'http://127.0.0.1:8080/api/workorder/create',
                method: 'POST',
                header: {
                    'content-type': 'application/json',
                    'Authorization': `Bearer ${wx.getStorageSync('auth_token')}`
                },
                data: orderData
            });

            // 5. 处理响应
            if (response.statusCode === 200 && response.data.code === 200) {
                wx.hideLoading();
                wx.showToast({
                    title: '提交成功',
                    icon: 'success'
                });
                setTimeout(() => {
                    wx.navigateBack();
                }, 1500);
            } else {
                throw new Error(response.data.message || '提交失败');
            }
        } catch (error) {
            console.error('Submit error:', error);
            wx.hideLoading();
            wx.showToast({
                title: (error && error.message) || (error && error.data && error.data.message) || '提交失败，请重试',
                icon: 'none'
            });
        } finally {
            this.setData({ submitting: false });
        }
    }
})