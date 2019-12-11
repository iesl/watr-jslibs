import 'chai/register-should';
import '~/plugins/composition-api';

import { prettyPrint } from './pretty-print';

import { Tween, Easing, update as updateTween } from '@tweenjs/tween.js';
// import TWEEN from '@tweenjs/tween.js';

import { tweenBBox } from './tweening';

import { coords } from 'sharedLib';

describe('Tweening support',  () => {
  it.only('tweens bbox', async () => {
    const b1 = coords.mk.fromLtwh(10, 10, 100, 200);
    const b2 = coords.mk.fromLtwh(20, 30, 40, 40);
    const p = tweenBBox(b1, b2, (curr) => {
      prettyPrint({ m: 'Current', curr });
    }).then(b => {
      prettyPrint({ m: 'Ending', b });
    });

    return p;
  });

  it('smokescreen', async () => {

    let position = {x: 100};
    const waypoint1 = {x: 150};
    const waypoint2 = {x: 125};

    let done = false;
    function init() {
      // target = document.getElementById('target');
      const tween = new Tween(position)
        .to(waypoint1, 2000)
        .easing(Easing.Linear.None)
        .onUpdate((st) => doUpdate(st, waypoint1));

      const tweenBack = new Tween(position)
        .to(waypoint2, 2000)
        .easing(Easing.Linear.None)
        .onUpdate((st) => doUpdate(st, waypoint2))
        .onComplete(() => {
          done = true;
          prettyPrint({ m: 'tweenBack complete'});
        })
      ;

      tween.chain(tweenBack);
      return tween.start();
    }


    function doUpdate(obj: any, target: object) {
      prettyPrint({ m: 'update', obj, target });
      return true;
    }

    const p = new Promise((resolve) => {
      init();
      function animate(time: number) {
        var id = requestAnimationFrame(animate);
        updateTween();
        prettyPrint({ m: 'animate', time });
        if (done) {
          cancelAnimationFrame(id);
          prettyPrint({ m: 'Promise complete'});
          resolve();
        }
      }
      requestAnimationFrame(animate);
    })

    return p;
  });

});
