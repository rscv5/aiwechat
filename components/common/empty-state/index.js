Component({
  properties: {
    title: String,
    subtitle: String,
    showBtn: { type: Boolean, value: false },
    btnText: { type: String, value: '去反馈' }
  },
  methods: {
    onAction() {
      this.triggerEvent('action');
    }
  }
}); 