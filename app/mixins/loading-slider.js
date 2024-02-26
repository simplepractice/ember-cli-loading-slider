import { inject as service } from '@ember/service';
import Mixin from '@ember/object/mixin';

export default Mixin.create({
  loadingSlider: service(),
  router: service(),

  actions: {
    loading() {
      let loadingSliderService = this.get('loadingSlider');
      loadingSliderService.startLoading();
      this.router.one('routeDidChange', function() {
        loadingSliderService.endLoading();
      });
      if (this.get('bubbleLoadingSlider')) {
        return true;
      }
    },

    finished() {
      this.get('loadingSlider').endLoading();
    }
  }
});
