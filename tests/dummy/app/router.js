import EmberRouter from '@ember/routing/router';
import config from 'dummy/config/environment';

class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function() {
  this.route('two');
  this.route('75');
  this.route('orange');
});

export default Router;
