const app = getApp();
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
        submitting: false,
        showPrivacyPopup: false,
        hasPrivacyAuthorized: false,
        locationAuth: false,
        phoneAuth: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        console.log('=== quickPhoto onLoad ===', options);
        // 检查是否已登录
        const userInfo = wx.getStorageSync('userInfo');
        console.log('当前用户信息:', userInfo);
        
        if (!userInfo) {
            console.log('用户未登录，准备跳转到登录页');
            wx.showModal({
                title: '提示',
                content: '请先登录后再使用随手拍功能',
                showCancel: false,
                success: () => {
                    console.log('用户确认跳转');
                    // 修改导航逻辑，使用 redirectTo 替代 switchTab + navigateTo
                    wx.redirectTo({
                        url: '/pages/login/login',
                        success: () => {
                            console.log('跳转到登录页成功');
                        },
                        fail: (err) => {
                            console.error('跳转到登录页失败:', err);
                            // 如果跳转失败，尝试使用 reLaunch
                            wx.reLaunch({
                                url: '/pages/login/login',
                                fail: (reLaunchErr) => {
                                    console.error('reLaunch 到登录页也失败:', reLaunchErr);
                                    wx.showToast({
                                        title: '页面跳转失败，请重试',
                                        icon: 'none'
                                    });
                                }
                            });
                        }
                    });
                }
            });
            return;
        }

        // 检查是否已经授权过
        this.checkPrivacyAuthorization();
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {
        console.log('=== quickPhoto onReady ===');
        console.log('当前页面数据:', this.data);
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        console.log('=== quickPhoto onShow ===');
        console.log('当前页面数据:', this.data);
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {
        console.log('=== quickPhoto onHide ===');
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {
        console.log('=== quickPhoto onUnload ===');
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
        console.log('=== 开始拍照或选择图片 ===');
        try {
            // 检查相机权限
            console.log('检查相机权限');
            const auth = await wx.getSetting();
            console.log('当前权限设置:', auth);
            
            if (!auth.authSetting['scope.camera']) {
                console.log('请求相机权限');
                await wx.authorize({ scope: 'scope.camera' });
            }

            // 调用相机
            console.log('准备调用相机');
            const res = await wx.chooseMedia({
                count: 3 - this.data.images.length,
                mediaType: ['image'],
                sourceType: ['camera'],  // 只允许使用相机
                camera: 'back',
                sizeType: ['compressed']
            });
            console.log('相机返回结果:', res);

            // 更新图片列表
            const newImages = [...this.data.images, ...res.tempFiles.map(file => file.tempFilePath)];
            console.log('更新后的图片列表:', newImages);
            
            this.setData({ images: newImages }, () => {
                console.log('图片列表更新完成');
                this.validateForm();
            });
        } catch (error) {
            console.error('拍照或选择图片失败:', error);
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

    // 上传单张图片，返回Promise
    uploadSingleImage(filePath) {
        console.log('=== 开始上传单张图片 ===', filePath);
        return new Promise((resolve, reject) => {
            wx.uploadFile({
                url: `${app.globalData.baseUrl}/api/upload`,
                filePath,
                name: 'file',
                formData: {
                    type: 'workorder'
                },
                header: {
                    'Authorization': `Bearer ${wx.getStorageSync('auth_token')}`
                },
                success: (res) => {
                    console.log('图片上传响应:', res);
                    try {
                        const data = JSON.parse(res.data);
                        if (data.code === 200 && data.url) {
                            resolve(data.url);
                        } else if (data.url) {
                            resolve(data.url);
                        } else {
                            reject(new Error(data.message || '上传失败'));
                        }
                    } catch (e) {
                        reject(new Error('图片上传响应解析失败'));
                    }
                },
                fail: reject
            });
        });
    },

    // 预览图片
    previewImage(e) {
        console.log('=== 预览图片 ===', e.currentTarget.dataset.index);
        const index = e.currentTarget.dataset.index;
        wx.previewImage({
            current: this.data.images[index],
            urls: this.data.images
        });
    },

    // 删除图片
    removeImage(e) {
        console.log('=== 删除图片 ===', e.currentTarget.dataset.index);
        const index = e.currentTarget.dataset.index;
        const images = [...this.data.images];
        images.splice(index, 1);
        console.log('删除后的图片列表:', images);
        this.setData({ images }, () => {
            this.validateForm();
        });
    },

    // 获取位置信息
    async getLocation() {
        console.log('=== 开始获取位置信息 ===');
        this.setData({ locationLoading: true });
        try {
            // 先检查位置权限
            console.log('检查位置权限');
            const auth = await wx.getSetting();
            console.log('当前权限设置:', auth);
            
            if (!auth.authSetting['scope.userLocation']) {
                try {
                    console.log('请求位置权限');
                    await wx.authorize({ scope: 'scope.userLocation' });
                } catch (authError) {
                    console.error('位置权限请求失败:', authError);
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
            console.log('开始获取位置');
            const locationRes = await new Promise((resolve, reject) => {
                wx.getLocation({
                    type: 'gcj02',
                    success: resolve,
                    fail: reject
                });
            });
            console.log('位置信息:', locationRes);

            if (!locationRes || !locationRes.latitude || !locationRes.longitude) {
                throw new Error('获取位置信息失败');
            }

            // 使用微信内置的逆地址解析，获取更详细的地址信息
            console.log('开始逆地址解析');
            const addressRes = await new Promise((resolve, reject) => {
                wx.request({
                    url: `https://apis.map.qq.com/ws/geocoder/v1/?location=${locationRes.latitude},${locationRes.longitude}&key=${API.MAP_KEY}&get_poi=1`,
                    method: 'GET',
                    success: resolve,
                    fail: reject
                });
            });
            console.log('逆地址解析结果:', addressRes);

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

                console.log('最终地址信息:', address);
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
            console.error('获取位置信息失败:', error);
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
        console.log('=== 内容输入 ===', e.detail.value);
        this.setData({
            content: e.detail.value
        }, () => {
            this.validateForm();
        });
    },

    onBuildingInput(e) {
        console.log('=== 楼栋输入 ===', e.detail.value);
        // 只允许输入数字
        const value = e.detail.value.replace(/[^\d]/g, '');
        this.setData({
            building: value
        }, () => {
            this.validateForm();
        });
    },

    onPhoneInput(e) {
        console.log('=== 电话输入 ===', e.detail.value);
        this.setData({
            phone: e.detail.value
        }, () => {
            this.validateForm();
        });
    },

    // 表单验证
    validateForm() {
        console.log('=== 表单验证 ===');
        const { images, content, location, building, phone } = this.data;
        console.log('当前表单数据:', { images, content, location, building, phone });
        
        const isValid = 
            images.length > 0 && 
            images.length <= 3 &&
            content.length >= 0 &&
            content.length <= 200 &&
            location &&
            building &&
            /^1[3-9]\d{9}$/.test(phone);

        console.log('表单验证结果:', isValid);
        this.setData({ canSubmit: isValid });
    },

    // 检查隐私授权状态
    async checkPrivacyAuthorization() {
        const hasPrivacyAuthorized = wx.getStorageSync('privacy_authorized');
        if (!hasPrivacyAuthorized) {
            this.setData({ showPrivacyPopup: true });
            return;
        }

        // 如果已经授权，检查具体权限
        const auth = await wx.getSetting();
        this.setData({
            hasPrivacyAuthorized: true,
            locationAuth: auth.authSetting['scope.userLocation'] || false,
            phoneAuth: auth.authSetting['scope.phoneNumber'] || false
        });

        // 如果已授权位置权限，获取位置
        if (auth.authSetting['scope.userLocation']) {
            this.getLocation();
        }
    },

    // 同意隐私政策
    async acceptPrivacy() {
        this.setData({ 
            showPrivacyPopup: false,
            hasPrivacyAuthorized: true
        });
        wx.setStorageSync('privacy_authorized', true);
        
        // 请求位置权限
        try {
            await wx.authorize({ scope: 'scope.userLocation' });
            this.setData({ locationAuth: true });
            this.getLocation();
        } catch (err) {
            console.error('位置权限请求失败:', err);
        }
    },

    // 拒绝隐私政策
    rejectPrivacy() {
        wx.showModal({
            title: '提示',
            content: '需要同意隐私政策才能使用随手拍功能',
            showCancel: false,
            success: () => {
                wx.navigateBack();
            }
        });
    },

    // 修改提交方法，添加权限检查
    async submit() {
        if (!this.data.hasPrivacyAuthorized) {
            this.setData({ showPrivacyPopup: true });
            return;
        }

        if (!this.data.locationAuth) {
            wx.showModal({
                title: '需要位置权限',
                content: '请允许获取位置信息以便准确定位问题',
                confirmText: '去设置',
                success: (res) => {
                    if (res.confirm) {
                        wx.openSetting();
                    }
                }
            });
            return;
        }

        if (!this.data.phone) {
            wx.showModal({
                title: '提示',
                content: '请输入手机号码',
                showCancel: false
            });
            return;
        }

        console.log('baseUrl:', app.globalData.baseUrl);
        console.log('=== 开始提交工单 ===');
        if (this.data.submitting) {
            console.log('正在提交中，忽略本次提交');
            return;
        }
        
        // 防抖处理
        if (this.submitTimer) {
            console.log('清除之前的提交定时器');
            clearTimeout(this.submitTimer);
        }
        
        this.submitTimer = setTimeout(async () => {
            console.log('开始执行提交操作');
            this.setData({ submitting: true });
            wx.showLoading({
                title: '提交中...',
                mask: true
            });

            try {
                // 1. 获取用户信息
                const userInfo = wx.getStorageSync('userInfo');
                console.log('当前用户信息:', userInfo);
                
                if (!userInfo || !userInfo.openid) {
                    throw new Error('请先登录');
                }

                // 2. 上传图片（如果有）
                let imageUrls = [];
                if (this.data.images.length > 0) {
                    console.log('准备上传图片:', this.data.images);
                    // 并发上传所有图片，imageUrls 只用后端返回的url
                    imageUrls = await Promise.all(
                        this.data.images.map(path => this.uploadSingleImage(path))
                    );
                    console.log('上传后的图片URL数组:', imageUrls);
                }

                // 3. 构造工单数据
                const orderData = {
                    userOpenid: userInfo.openid,
                    description: this.data.content,
                    imageUrls: imageUrls,
                    address: this.data.location,
                    buildingInfo: this.data.building,
                    status: '未领取',
                    phone: this.data.phone
                };
                console.log('准备提交的工单数据:', orderData);

                // 4. 调用后端API提交工单
                console.log('开始调用后端API');
                const response = await new Promise((resolve, reject) => {
                    wx.request({
                        url: `${app.globalData.baseUrl}/api/workorder/create`,
                        method: 'POST',
                        header: {
                            'content-type': 'application/json',
                            'Authorization': `Bearer ${wx.getStorageSync('auth_token')}`
                        },
                        data: orderData,
                        success: (res) => {
                            console.log('工单提交响应:', res);
                            resolve(res);
                        },
                        fail: (err) => {
                            console.error('工单提交失败:', err);
                            reject(new Error(err.errMsg || '网络请求失败'));
                        }
                    });
                });

                // 5. 处理响应
                if (response.statusCode === 200 && response.data && response.data.code === 200) {
                    console.log('工单提交成功');
                    wx.hideLoading();
                    wx.showToast({
                        title: '提交成功',
                        icon: 'success'
                    });
                    setTimeout(() => {
                        wx.navigateBack();
                    }, 1500);
                } else {
                    console.error('工单提交失败:', response);
                    // 处理重复提交的情况
                    if (response.data?.message?.includes('Duplicate entry')) {
                        wx.showToast({
                            title: '您已在该地址提交过工单',
                            icon: 'none',
                            duration: 1500
                        });
                        // 直接跳转到工单列表页
                        wx.switchTab({
                            url: '/pages/workOrderList/workOrderList'
                        });
                    } else {
                        throw new Error(response.data?.message || '提交失败');
                    }
                }
            } catch (error) {
                console.error('工单提交错误:', error);
                wx.hideLoading();
                wx.showToast({
                    title: error.message || '提交失败，请重试',
                    icon: 'none',
                    duration: 2000
                });
            } finally {
                this.setData({ submitting: false });
            }
        }, 1000);
    }
})