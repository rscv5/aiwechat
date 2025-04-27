// components/common/section-title/index.js
// 板块标题组件，带"更多"按钮
Component({
  properties: {
    title: String,      // 标题文本
    moreText: String   // 右侧"更多"按钮文本
  },
  methods: {
    // 点击更多按钮时触发事件
    onMoreTap() {
      this.triggerEvent('moreTap');
    }
  }
}); 