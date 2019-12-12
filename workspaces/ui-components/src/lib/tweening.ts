
import { Tween, Easing, update as updateTween } from 'es6-tween';

// import * as TWEEN from '@tweenjs/tween.js';
// const TWEEN = require('@tweenjs/tween.js');
// const { Tween, Easing } = TWEEN;
// const updateTween = update;



import { BBox, coords } from 'sharedLib';
// import { prettyPrint } from './pretty-print';

// prettyPrint({ m: 'tween.ts',  TWEEN.default, Tween: TWEEN.Tween });


export function tweenBBox(start: BBox, end: BBox, onUpdate: (bbox: BBox) => void): Promise<BBox> {
  // prettyPrint({ m: 'tweenBBox', Tween, Easing });
  const p = new Promise<BBox>((resolve) => {
    const initial = {
      x: start.x,
      y: start.y,
      width: start.width,
      height: start.height
    };
    const target = {
      x: end.x,
      y: end.y,
      width: end.width,
      height: end.height
    };

    let done = false;


    const tween = new Tween(initial)
      .to(target, 2000)
      .easing(Easing.Linear.None)
      .on('update', (st: any) => {
        const b = coords.mk.fromLtwh(st.x, st.y, st.width, st.height);
        onUpdate(b);
      })
      .on('complete', () => {
        done = true;
      })


    function animate(time: number) {
      if (done) {
        const b = coords.mk.fromLtwh(initial.x, initial.y, initial.width, initial.height);
        resolve(b);
      } else {
        requestAnimationFrame(animate);
        updateTween(time);
      }
    }

    requestAnimationFrame(animate);
    tween.start();
  })

  return p;




}
