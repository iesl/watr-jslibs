import 'chai/register-should';
import '~/plugins/composition-api';

import { prettyPrint } from './pretty-print';

// import anime from 'animejs/lib/anime.es.js';
import anime from 'animejs';

// prettyPrint({ m: 'tween.test',  TWEEN });

import { tweenBBox } from './tweening';

import * as coords from '~/lib/coord-sys';

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

    const anim0 = anime({
      targets: position,
      x: 150,
      easing: 'linear',
      autoplay: false,
      update: () => {
        doUpdate(position, waypoint1)
      }
    });

    const fini = anim0.finished;
    anim0.play();

    function doUpdate(obj: any, target: object) {
      prettyPrint({ m: 'update', obj, target });
      return true;
    }

    return fini.then(() => {
      console.log('done');
    });
  });

});
