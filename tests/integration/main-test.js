import { module, test } from 'qunit';
import {setupApplicationTest} from 'ember-qunit';
import { visit, find, findAll, click, waitUntil } from '@ember/test-helpers';

module('Acceptance | Main', function(hooks) {
  setupApplicationTest(hooks);

  test('visiting /75', async function(assert) {
    await visit('/75');

    assert.equal(await findAll('.loading-slider').length, 1, "The component's element exists");
    assert.equal(await findAll('.loading-slider span').length, 1, 'The component has inserted one span');
    assert.equal(await find('.loading-slider span').clientWidth, 0, 'The stripe has finished animating and is width 0');
  });

  test('testing animation', async function(assert) {
    assert.expect(0);

    await visit('/');

    click('[data-test-expanding-animation-button]')

    await waitUntil(() => findAll('.loading-slider span')[1]?.clientWidth > 0, {
      timeout: 500,
      timeoutMessage: 'The slider has not animated'
    })

    await waitUntil(() =>  findAll('.loading-slider span').length === 0, {
      timeout: 1500,
      timeoutMessage: 'The slider has not reset'
    })
  });

  test('testing multi-color centered animation', async function(assert) {
    assert.expect(0);
    await visit('/');

    click('[data-test-multi-expanding-animation-button]')

    await waitUntil(() =>  findAll('.loading-slider span')[1]?.clientWidth > 0, {
      timeout: 500,
      timeoutMessage: 'The slider has not animated'
    });

    await waitUntil(() =>  findAll('.loading-slider span').length > 2, {
      timeout: 1500,
      timeoutMessage: 'There are no multiple sliders'
    });

    await waitUntil(() =>  findAll('.loading-slider span').length === 0, {
      timeout: 5500,
      timeoutMessage: 'The slider has not reset'
    });
  });
});

