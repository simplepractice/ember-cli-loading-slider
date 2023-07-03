import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { once, later } from '@ember/runloop';

export default Component.extend({
  tagName: 'div',
  classNames: ['loading-slider'],
  classNameBindings: 'expanding',
  progressBarClass: null,

  loadingSlider: service(),

  init() {
    this._super(...arguments);

    if (isFastBoot()) { return; }

    once(this, function() {
      this.get('loadingSlider').on('startLoading', this, this._startLoading);
      this.get('loadingSlider').on('endLoading', this, this._endLoading);
      this.get('loadingSlider').on('changeAttrs', this, this._changeAttrs);
    });
  },

  didReceiveAttrs() {
    this._super(...arguments);

    if (isFastBoot()) { return; }

    this.setProperties({
      isLoading: this.getAttr('isLoading'),
      duration: this.getAttr('duration'),
      expanding: this.getAttr('expanding'),
      speed: this.getAttr('speed'),
      color: this.getAttr('color')
    });

    this.manage();
  },

  willDestroyElement() {
    once(this, function() {
      this.get('loadingSlider').off('startLoading', this, this._startLoading);
      this.get('loadingSlider').off('endLoading', this, this._endLoading);
      this.get('loadingSlider').off('changeAttrs', this, this._changeAttrs);
    });
  },

  _startLoading() {
    this.set('isLoading', true);
    this.manage();
  },

  _endLoading() {
    this.set('isLoading', false);
  },

  _changeAttrs(attrs) {
    this.setProperties(attrs);
    this.manage();
  },

  manage() {
    if (!this.element) {
      return;
    }

    if (this.get('isLoading')) {
      if (this.get('expanding')) {
        this.expandingAnimate.call(this);
      } else {
        this.animate.call(this);
      }
    } else {
      this.set('isLoaded', true);
    }
  },

  animate() {
    this.set('isLoaded', false);
    let self = this,
        elapsedTime = 0,
        inner = document.createElement('span'),
        outer = this.element,
        duration = this.get('duration') ?? 300,
        innerWidth = 0,
        outerWidth = this.element.getBoundingClientRect().width,
        stepWidth = Math.round(outerWidth / 50),
        color = this.get('color');

    inner.classList.add('loading-slider__progress', this.get('progressBarClass'))
    outer.appendChild(inner);
    if (color) {
      inner.style.backgroundColor = color;
    }

    let interval = window.setInterval(function() {
      elapsedTime = elapsedTime + 10;
      innerWidth = innerWidth + stepWidth;
      inner.style.width = innerWidth + 'px';

      // slow the animation if we used more than 75% the estimated duration
      // or 66% of the animation width
      if (elapsedTime > (duration * 0.75) || innerWidth > (outerWidth * 0.66)) {
        // don't stop the animation completely
        if (stepWidth > 1) {
          stepWidth = stepWidth * 0.97;
        }
      }

      if (innerWidth > outerWidth) {
        later(function() {
          outer.innerHTML = '';
          window.clearInterval(interval);
        }, 50);
      }

      // the activity has finished
      if (self.get('isLoaded')) {
        // start with a sizable pixel step
        if (stepWidth < 10) {
          stepWidth = 10;
        }
        // accelerate to completion
        stepWidth = stepWidth + stepWidth;
      }
    }, 10);
  },

  expandingAnimate() {
    let self = this,
        outer = this.element,
        speed = this.get('speed') ?? 1000,
        colorQueue = this.get('color');

    if ('object' === typeof colorQueue) {
      (function updateFn() {
        if (self.isDestroyed || self.isDestroying) {
          return;
        }
        let color = colorQueue.shift();
        colorQueue.push(color);
        self.expandItem.call(self, color);
        if ( ! self.get('isLoading')) {
          outer.innerHTML = '';
        } else {
          window.setTimeout(updateFn, speed);
        }
      })();
    } else {
      this.expandItem.call(this, colorQueue, true);
    }
  },

  expandItem(color, cleanUp) {
    let inner = document.createElement('span'),
        outer = this.element,
        innerWidth = 0,
        outerWidth = outer.getBoundingClientRect().width,
        stepWidth = Math.round(outerWidth / 50);

    inner.style.backgroundColor = color;
    outer.appendChild(inner);

    let interval = window.setInterval(function() {
      let step = (innerWidth = innerWidth + stepWidth);
      if (innerWidth > outerWidth) {
        window.clearInterval(interval);
        if (cleanUp) {
          outer.innerHTML = '';
        }
      }
      inner.style.width = step + 'px';
      inner.style.marginLeft = '-' + step / 2 + 'px';
    }, 10);
  },

  didInsertElement() {
    let spanElement = document.createElement('span');
    let color = this.get('color');

    this.element.appendChild(spanElement)
    if (color) {
      spanElement.style.backgroundColor = color;
    }

    if (this.get('runManageInitially')) {
      this._startLoading();
    }
  }
});

function isFastBoot() {
  return typeof FastBoot !== 'undefined';
}
