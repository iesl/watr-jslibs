
import { Tween, Easing, update as updateTween } from '@tweenjs/tween.js';
// import * as TWEEN from '@tweenjs/tween.js';
// const { Tween, Easing, update } = TWEEN;
import { BBox, coords } from 'sharedLib';
// import { prettyPrint } from './pretty-print';

export function tweenBBox(start: BBox, end: BBox, onUpdate: (bbox: BBox) => void): Promise<BBox> {

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
      .onUpdate((st: any) => {
        const b = coords.mk.fromLtwh(st.x, st.y, st.width, st.height);
        onUpdate(b);
      })
      .onComplete(() => {
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
