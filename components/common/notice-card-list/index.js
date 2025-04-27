// components/common/notice-card-list/index.js
// 公示卡片横滑组件
Component({
  properties: {
    notices: Array // 公示数据数组
  },
  methods: {
    // 点击卡片时触发事件，传递公示id
    onCardTap(e) {
      const { id } = e.currentTarget.dataset;
      this.triggerEvent('cardTap', { id });
    }
  }
}); 