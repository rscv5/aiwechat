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
        locationLoading: false,
        building: '',
        phone: '',
        canSubmit: false,
        submitting: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
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
            // 本地开发：直接将工单数据保存到本地Storage，后续可切换为后端接口
            // 1. 获取本地已有工单列表
            let orders = wx.getStorageSync('workOrders') || [];

            // 2. 构造新工单数据
            const orderData = {
                images: this.data.images, // 本地开发直接存图片路径，后端时可存imageUrls
                content: this.data.content,
                location: this.data.location,
                building: this.data.building,
                phone: this.data.phone,
                createTime: formatDate(new Date()), // 使用标准格式
                status: 'pending', // 默认待处理
                id: Date.now() // 用时间戳做唯一ID
            };

            // 3. 添加到工单列表
            orders.unshift(orderData);

            // 4. 存回本地
            wx.setStorageSync('workOrders', orders);

            // 5. 提示成功并返回
            wx.hideLoading();
            wx.showToast({
                title: '提交成功',
                icon: 'success'
            });
            setTimeout(() => {
                wx.navigateBack();
            }, 1500);

            // ====== 后端接口上线后可替换为如下伪代码 =====
            // 1. 上传图片（如有）
            // 2. 调用后端API提交工单
            // await request({
            //   url: '/orders',
            //   method: 'POST',
            //   data: orderData
            // });
        } catch (error) {
            console.error('Submit error:', error);
            wx.hideLoading();
            wx.showToast({
                title: '提交失败，请重试',
                icon: 'none'
            });
        } finally {
            this.setData({ submitting: false });
        }
    }
})