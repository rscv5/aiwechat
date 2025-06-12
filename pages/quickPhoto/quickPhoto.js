const app = getApp();
import { API, formatDate } from '../../constants/index';
import config from '../../config/api';
const auth = require('../../utils/auth');

// 坐标转换工具函数
// 百度坐标 (BD-09) 转换为 国测局坐标 (GCJ-02)
const x_pi = 3.14159265358979324 * 3000.0 / 180.0;
function bd09togcj02(bd_lon, bd_lat) {
    const x = bd_lon - 0.0065;
    const y = bd_lat - 0.006;
    const z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
    const theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
    const gg_lng = z * Math.cos(theta);
    const gg_lat = z * Math.sin(theta);
    return {
        latitude: gg_lat,
        longitude: gg_lng
    };
}

// 明发社区的地理边界（多边形顶点坐标，使用GCJ-02坐标系）
const MINGFA_BOUNDARY = {
    name: "明发社区",
    points: [
        // 从上到下，顺时针采集的14个点 (百度坐标BD-09，微信小程序wx.getLocation为GCJ-02，通常可以忽略小范围误差)
        { latitude: 32.142425, longitude: 118.748561 },
        { latitude: 32.141844, longitude: 118.752119 },
        { latitude: 32.140805, longitude: 118.755748 },
        { latitude: 32.139857, longitude: 118.758551 },
        { latitude: 32.137472, longitude: 118.756467 },
        { latitude: 32.133956, longitude: 118.752801 },
        { latitude: 32.131204, longitude: 118.750538 },
        { latitude: 32.127106, longitude: 118.746118 },
        { latitude: 32.12781, longitude: 118.744214 },
        { latitude: 32.131724, longitude: 118.745651 },
        { latitude: 32.132152, longitude: 118.746909 },
        { latitude: 32.133283, longitude: 118.74716 },
        { latitude: 32.136127, longitude: 118.747376 },
        { latitude: 32.139337, longitude: 118.747915 }
    ]
};

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
        phoneAuth: false,
        isInCommunity: false,  // 新增：是否在社区范围内
        convertedBoundaryPoints: [] // 新增：存储转换后的边界点
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        console.log('=== quickPhoto onLoad ===', options);
        // 检查是否已登录
        const isLoggedIn = auth.checkLogin();
        console.log('登录状态检查结果:', isLoggedIn);
        
        if (!isLoggedIn) {
            console.log('用户未登录，准备跳转到登录页');
                    wx.redirectTo({
                url: '/pages/login/login'
            });
            return;
        }

        // 转换明发社区边界坐标为GCJ-02
        const convertedPoints = MINGFA_BOUNDARY.points.map(point => {
            return bd09togcj02(point.longitude, point.latitude);
        });
        this.setData({
            convertedBoundaryPoints: convertedPoints
        });
        console.log('转换后的社区边界 (GCJ-02):', JSON.stringify(this.data.convertedBoundaryPoints, null, 2));

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
        // 不再重复检查登录状态
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
    async uploadSingleImage(filePath) {
        console.log('=== 开始上传单张图片 (云存储) ===', filePath);
        const app = getApp();
        
        // 获取文件扩展名
        const fileExtension = filePath.substring(filePath.lastIndexOf('.'));
        // 生成唯一的云文件路径 (例如：workorder/timestamp_random.ext)
        const cloudPath = `workorder/${Date.now()}_${Math.floor(Math.random() * 1000)}${fileExtension}`;

        try {
            const uploadRes = await wx.cloud.uploadFile({
                cloudPath: cloudPath, // 云端路径
                filePath: filePath, // 小程序临时文件路径
                config:{
                    env: config.cloudEnvId
                }
            });

            console.log('云存储图片上传响应:', uploadRes);

            if (uploadRes.fileID) {
                // 上传成功后获取临时下载链接
                const getUrlRes = await wx.cloud.getTempFileURL({
                    fileList: [uploadRes.fileID]
                });
                
                console.log('获取临时下载链接响应:', getUrlRes);

                if (getUrlRes.fileList && getUrlRes.fileList.length > 0 && getUrlRes.fileList[0].tempFileURL) {
                    const imageUrl = getUrlRes.fileList[0].tempFileURL;
                    console.log('图片上传成功，下载链接:', imageUrl);
                    return imageUrl;
                } else {
                    throw new Error(getUrlRes.errMsg || '获取图片下载链接失败');
                }
                        } else {
                throw new Error(uploadRes.errMsg || '图片上传失败');
                        }
        } catch (error) {
            console.error('图片上传至云存储失败:', error);
            throw new Error(error.message || '图片上传失败，请重试');
        }
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

    // 判断点是否在多边形内（射线法）
    isPointInPolygon(point, polygon) {
        console.log('=== 开始判断点是否在多边形内 ===');
        console.log('待判断的点:', point);
        console.log('多边形顶点:', polygon);
        
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i].longitude, yi = polygon[i].latitude;
            const xj = polygon[j].longitude, yj = polygon[j].latitude;
            
            console.log(`判断边 ${j}->${i}:`, {
                '边起点': { latitude: yj, longitude: xj },
                '边终点': { latitude: yi, longitude: xi },
                '待判断点': point
            });
            
            // 修改判断条件，增加容错率
            const intersect = ((yi > point.latitude) !== (yj > point.latitude))
                && (point.longitude <= (xj - xi) * (point.latitude - yi) / (yj - yi) + xi);
            
            console.log(`边 ${j}->${i} 的判断结果:`, intersect);
            if (intersect) inside = !inside;
        }
        
        // 添加容错判断
        const tolerance = 0.001; // 约100米的容错范围
        const isNearBoundary = polygon.some((vertex, i) => {
            const nextVertex = polygon[(i + 1) % polygon.length];
            const distance = Math.sqrt(
                Math.pow(vertex.latitude - point.latitude, 2) +
                Math.pow(vertex.longitude - point.longitude, 2)
            );
            return distance < tolerance;
        });
        
        console.log('是否在边界附近:', isNearBoundary);
        console.log('最终判断结果:', inside || isNearBoundary);
        
        return true; //测试始终在
        //return inside || isNearBoundary;
    },

    // 修改获取位置信息方法
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
            console.log('获取到的原始位置信息:', locationRes);

            if (!locationRes || !locationRes.latitude || !locationRes.longitude) {
                throw new Error('获取位置信息失败');
            }

            // 检查是否在明发社区范围内
            const userPoint = {
                latitude: locationRes.latitude,
                longitude: locationRes.longitude
            };
            console.log('=== 位置判断信息 ===');
            console.log('用户当前位置 (GCJ-02):', JSON.stringify(userPoint));
            console.log('明发社区边界 (GCJ-02):', JSON.stringify(this.data.convertedBoundaryPoints, null, 2));
            console.log('边界点数量:', this.data.convertedBoundaryPoints.length);
            
            // 添加位置精度检查
            console.log('位置精度:', locationRes.accuracy);
            if (locationRes.accuracy > 100) { // 如果精度大于100米
                console.log('位置精度较低，使用容错判断');
            }
            
            const isInCommunity = this.isPointInPolygon(userPoint, this.data.convertedBoundaryPoints);
            console.log('是否在社区范围内:', isInCommunity);
            
            if (!isInCommunity) {
                console.log('用户不在社区范围内，准备返回');
                this.setData({ 
                    location: '',
                    locationLoading: false,
                    isInCommunity: false
                });
                wx.showModal({
                    title: '提示',
                    content: '您当前不在明发社区范围内，无法创建工单',
                    showCancel: false,
                    success: () => {
                        wx.navigateBack();
                    }
                });
                return;
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
                    locationLoading: false,
                    isInCommunity: true
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
                locationLoading: false,
                isInCommunity: false
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
        //console.log('=== 内容输入 ===', e.detail.value);
        this.setData({
            content: e.detail.value
        }, () => {
            this.validateForm();
        });
    },

    onBuildingInput(e) {
        //console.log('=== 楼栋输入 ===', e.detail.value);
        // 只允许输入数字
        const value = e.detail.value.replace(/[^\d]/g, '');
        this.setData({
            building: value
        }, () => {
            this.validateForm();
        });
    },

    onPhoneInput(e) {
        //console.log('=== 电话输入 ===', e.detail.value);
        this.setData({
            phone: e.detail.value
        }, () => {
            this.validateForm();
        });
    },

    // 表单验证
    validateForm() {
        //console.log('=== 表单验证 ===');
        const { images, content, location, building, phone, isInCommunity } = this.data;
        //console.log('当前表单数据:', { images, content, location, building, phone, isInCommunity });
        
        const isValid = 
            images.length > 0 && 
            images.length <= 3 &&
            content.length >= 0 &&
            content.length <= 200 &&
            location &&
            building &&
            /^1[3-9]\d{9}$/.test(phone) &&
            isInCommunity;  // 添加社区范围检查

        //console.log('表单验证结果:', isValid);
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

        // 测试，始终允许
        this.data.locationAuth = true;

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
                console.log('userInfo.openid:', userInfo?.openid);
                console.log('user_openid from storage:', wx.getStorageSync('user_openid'));
                
                // 检查用户是否已登录 (根据userId或token判断)
                if (!userInfo || !userInfo.userId) { // 修改这里，从openid改为userId
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
                    userOpenid: userInfo.openid || wx.getStorageSync('user_openid'),
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
                console.log('请求URL:', `${app.globalData.baseUrl}/api/workorder/create`);
                console.log('请求方法:', 'POST');
                console.log('请求头:', {
                    'content-type': 'application/json',
                    'Authorization': `Bearer ${wx.getStorageSync('auth_token')}`
                });
                console.log('请求数据:', orderData);

                const response = await new Promise((resolve, reject) => {
                    wx.cloud.callContainer({
                        config: {
                            env: config.cloudEnvId // 微信云托管环境ID
                        },
                        path: '/api/workorder/create', // 后端API路径
                        method: 'POST',
                        header: {
                            'content-type': 'application/json',
                            'Authorization': `Bearer ${wx.getStorageSync('auth_token')}`,
                            'X-WX-SERVICE': config.cloudServiceName // 微信云托管服务名称
                        },
                        data: orderData,
                        success: (res) => {
                            console.log('工单提交响应 (success):', res);
                            resolve(res);
                        },
                        fail: (err) => {
                            console.error('工单提交失败 (fail callback):', err);
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