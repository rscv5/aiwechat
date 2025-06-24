Component({
  properties: {
    tabs: Array,
    active: String
  },
  methods: {
    onTabTap(e) {
      this.triggerEvent('change', e.currentTarget.dataset.value);
    }
  }
}); 