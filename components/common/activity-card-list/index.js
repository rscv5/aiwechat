// components/common/activity-card-list/index.js
// 活动卡片横滑组件
Component({
  properties: {
    activities: Array // 活动数据数组
  },
  methods: {
    // 点击卡片时触发事件，传递活动id
    onCardTap(e) {
      const { id } = e.currentTarget.dataset;
      this.triggerEvent('cardTap', { id });
    }
  }
}); 