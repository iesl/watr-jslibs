function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Helper functions to install/update mouse handlers
 */
import * as _ from "lodash";
import { $id } from "./tstags";
const MOUSE_EVENTS = ["mouseover", "mouseout", "mousemove", "mouseup", "mousedown", "click"];
const emptyHandlerSet = {
  mouseover() {},

  mouseout() {},

  mousemove() {},

  mouseup() {},

  mousedown() {},

  click() {}

};
export function setMouseHandlers(bindThis, targetDivId, handlers) {
  $id(targetDivId).off();

  const mouseHandlers = _.map(handlers, handler => {
    const init = _objectSpread({}, emptyHandlerSet, {}, handler(bindThis));

    return init;
  });

  _.each(MOUSE_EVENTS, eventType => {
    $id(targetDivId).on(eventType, event => {
      _.each(mouseHandlers, h => {
        h[eventType](event);
      });
    });
  });
} // export function setMouseHandlers(bindThis, targetDivId, handlers) {
//   $id(targetDivId).off();
//   let mouseHandlers = _.map(handlers, handler => {
//     const init = {
//       mouseover: function() {},
//       mouseout: function() {},
//       mousemove: function() {},
//       mouseup: function() {},
//       mousedown: function() {},
//       click: function() {}
//     };
//     Object.assign(init, handler(bindThis));
//     return init;
//   });
//   let events = [
//     'mouseover',
//     'mouseout',
//     'mousemove',
//     'mouseup',
//     'mousedown',
//     'click'
//   ];
//   _.each(events, eventType => {
//     $id(targetDivId).on(eventType, function(event) {
//       _.each(mouseHandlers, h => {
//         h[eventType](event);
//       });
//     });
//   });
// }
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9Nb3VzZUhhbmRsZXJTZXRzLnRzIl0sIm5hbWVzIjpbIl8iLCIkaWQiLCJNT1VTRV9FVkVOVFMiLCJlbXB0eUhhbmRsZXJTZXQiLCJtb3VzZW92ZXIiLCJtb3VzZW91dCIsIm1vdXNlbW92ZSIsIm1vdXNldXAiLCJtb3VzZWRvd24iLCJjbGljayIsInNldE1vdXNlSGFuZGxlcnMiLCJiaW5kVGhpcyIsInRhcmdldERpdklkIiwiaGFuZGxlcnMiLCJvZmYiLCJtb3VzZUhhbmRsZXJzIiwibWFwIiwiaGFuZGxlciIsImluaXQiLCJlYWNoIiwiZXZlbnRUeXBlIiwib24iLCJldmVudCIsImgiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7QUFJQSxPQUFPLEtBQUtBLENBQVosTUFBbUIsUUFBbkI7QUFDQSxTQUFRQyxHQUFSLFFBQWtCLFVBQWxCO0FBRUEsTUFBTUMsWUFBWSxHQUFHLENBQ25CLFdBRG1CLEVBRW5CLFVBRm1CLEVBR25CLFdBSG1CLEVBSW5CLFNBSm1CLEVBS25CLFdBTG1CLEVBTW5CLE9BTm1CLENBQXJCO0FBMkJBLE1BQU1DLGVBQWdDLEdBQUc7QUFDdkNDLEVBQUFBLFNBQVMsR0FBRyxDQUFFLENBRHlCOztBQUV2Q0MsRUFBQUEsUUFBUSxHQUFHLENBQUUsQ0FGMEI7O0FBR3ZDQyxFQUFBQSxTQUFTLEdBQUcsQ0FBRSxDQUh5Qjs7QUFJdkNDLEVBQUFBLE9BQU8sR0FBRyxDQUFFLENBSjJCOztBQUt2Q0MsRUFBQUEsU0FBUyxHQUFHLENBQUUsQ0FMeUI7O0FBTXZDQyxFQUFBQSxLQUFLLEdBQUcsQ0FBRTs7QUFONkIsQ0FBekM7QUFnQkEsT0FBTyxTQUFTQyxnQkFBVCxDQUNMQyxRQURLLEVBRUxDLFdBRkssRUFHTEMsUUFISyxFQUlMO0FBQ0FaLEVBQUFBLEdBQUcsQ0FBQ1csV0FBRCxDQUFILENBQWlCRSxHQUFqQjs7QUFFQSxRQUFNQyxhQUFnQyxHQUFHZixDQUFDLENBQUNnQixHQUFGLENBQU1ILFFBQU4sRUFBZ0JJLE9BQU8sSUFBSTtBQUNsRSxVQUFNQyxJQUFxQixxQkFDdEJmLGVBRHNCLE1BRXRCYyxPQUFPLENBQUNOLFFBQUQsQ0FGZSxDQUEzQjs7QUFJQSxXQUFPTyxJQUFQO0FBQ0QsR0FOd0MsQ0FBekM7O0FBUUFsQixFQUFBQSxDQUFDLENBQUNtQixJQUFGLENBQU9qQixZQUFQLEVBQXFCa0IsU0FBUyxJQUFJO0FBQ2hDbkIsSUFBQUEsR0FBRyxDQUFDVyxXQUFELENBQUgsQ0FBaUJTLEVBQWpCLENBQW9CRCxTQUFwQixFQUFnQ0UsS0FBRCxJQUFtQztBQUNoRXRCLE1BQUFBLENBQUMsQ0FBQ21CLElBQUYsQ0FBT0osYUFBUCxFQUF1QlEsQ0FBRCxJQUF3QjtBQUM1Q0EsUUFBQUEsQ0FBQyxDQUFDSCxTQUFELENBQUQsQ0FBYUUsS0FBYjtBQUNELE9BRkQ7QUFHRCxLQUpEO0FBS0QsR0FORDtBQU9ELEMsQ0FHRDtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEhlbHBlciBmdW5jdGlvbnMgdG8gaW5zdGFsbC91cGRhdGUgbW91c2UgaGFuZGxlcnNcbiAqL1xuXG5pbXBvcnQgKiBhcyBfIGZyb20gXCJsb2Rhc2hcIjtcbmltcG9ydCB7JGlkfSBmcm9tIFwiLi90c3RhZ3NcIjtcblxuY29uc3QgTU9VU0VfRVZFTlRTID0gW1xuICBcIm1vdXNlb3ZlclwiLFxuICBcIm1vdXNlb3V0XCIsXG4gIFwibW91c2Vtb3ZlXCIsXG4gIFwibW91c2V1cFwiLFxuICBcIm1vdXNlZG93blwiLFxuICBcImNsaWNrXCIsXG5dO1xuXG5pbnRlcmZhY2UgTW91c2VIYW5kbGVyU2V0MCB7XG4gIG1vdXNlb3ZlcihldmVudDogSlF1ZXJ5TW91c2VFdmVudE9iamVjdCk6IHZvaWQ7XG4gIG1vdXNlb3V0KGV2ZW50OiBKUXVlcnlNb3VzZUV2ZW50T2JqZWN0KTogdm9pZDtcbiAgbW91c2Vtb3ZlKGV2ZW50OiBKUXVlcnlNb3VzZUV2ZW50T2JqZWN0KTogdm9pZDtcbiAgbW91c2V1cChldmVudDogSlF1ZXJ5TW91c2VFdmVudE9iamVjdCk6IHZvaWQ7XG4gIG1vdXNlZG93bihldmVudDogSlF1ZXJ5TW91c2VFdmVudE9iamVjdCk6IHZvaWQ7XG4gIGNsaWNrKGV2ZW50OiBKUXVlcnlNb3VzZUV2ZW50T2JqZWN0KTogdm9pZDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBNb3VzZUhhbmRsZXJzIHtcbiAgbW91c2VvdmVyPyhldmVudDogSlF1ZXJ5TW91c2VFdmVudE9iamVjdCk6IHZvaWQ7XG4gIG1vdXNlb3V0PyhldmVudDogSlF1ZXJ5TW91c2VFdmVudE9iamVjdCk6IHZvaWQ7XG4gIG1vdXNlbW92ZT8oZXZlbnQ6IEpRdWVyeU1vdXNlRXZlbnRPYmplY3QpOiB2b2lkO1xuICBtb3VzZXVwPyhldmVudDogSlF1ZXJ5TW91c2VFdmVudE9iamVjdCk6IHZvaWQ7XG4gIG1vdXNlZG93bj8oZXZlbnQ6IEpRdWVyeU1vdXNlRXZlbnRPYmplY3QpOiB2b2lkO1xuICBjbGljaz8oZXZlbnQ6IEpRdWVyeU1vdXNlRXZlbnRPYmplY3QpOiB2b2lkO1xufVxuXG5jb25zdCBlbXB0eUhhbmRsZXJTZXQ6IE1vdXNlSGFuZGxlclNldCA9IHtcbiAgbW91c2VvdmVyKCkge30sXG4gIG1vdXNlb3V0KCkge30sXG4gIG1vdXNlbW92ZSgpIHt9LFxuICBtb3VzZXVwKCkge30sXG4gIG1vdXNlZG93bigpIHt9LFxuICBjbGljaygpIHt9LFxufTtcblxuXG5pbnRlcmZhY2UgTW91c2VIYW5kbGVyU2V0IGV4dGVuZHMgTW91c2VIYW5kbGVyU2V0MCAge1xuICBbSzogc3RyaW5nXTogKChldmVudDogSlF1ZXJ5TW91c2VFdmVudE9iamVjdCkgPT4gdm9pZCk7XG59XG5cbmV4cG9ydCB0eXBlIE1vdXNlSGFuZGxlckluaXQgPSAodDogYW55KSA9PiBNb3VzZUhhbmRsZXJzO1xuXG5leHBvcnQgZnVuY3Rpb24gc2V0TW91c2VIYW5kbGVyczxUPihcbiAgYmluZFRoaXM6IFQsXG4gIHRhcmdldERpdklkOiBzdHJpbmcsXG4gIGhhbmRsZXJzOiBNb3VzZUhhbmRsZXJJbml0W10sXG4pIHtcbiAgJGlkKHRhcmdldERpdklkKS5vZmYoKTtcblxuICBjb25zdCBtb3VzZUhhbmRsZXJzOiBNb3VzZUhhbmRsZXJTZXRbXSA9IF8ubWFwKGhhbmRsZXJzLCBoYW5kbGVyID0+IHtcbiAgICBjb25zdCBpbml0OiBNb3VzZUhhbmRsZXJTZXQgPSB7XG4gICAgICAuLi5lbXB0eUhhbmRsZXJTZXQsXG4gICAgICAuLi5oYW5kbGVyKGJpbmRUaGlzKVxuICAgIH07XG4gICAgcmV0dXJuIGluaXQ7XG4gIH0pO1xuXG4gIF8uZWFjaChNT1VTRV9FVkVOVFMsIGV2ZW50VHlwZSA9PiB7XG4gICAgJGlkKHRhcmdldERpdklkKS5vbihldmVudFR5cGUsIChldmVudDogSlF1ZXJ5TW91c2VFdmVudE9iamVjdCkgPT4ge1xuICAgICAgXy5lYWNoKG1vdXNlSGFuZGxlcnMsIChoOiBNb3VzZUhhbmRsZXJTZXQpID0+IHtcbiAgICAgICAgaFtldmVudFR5cGVdKGV2ZW50KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcbn1cblxuXG4vLyBleHBvcnQgZnVuY3Rpb24gc2V0TW91c2VIYW5kbGVycyhiaW5kVGhpcywgdGFyZ2V0RGl2SWQsIGhhbmRsZXJzKSB7XG4vLyAgICRpZCh0YXJnZXREaXZJZCkub2ZmKCk7XG5cbi8vICAgbGV0IG1vdXNlSGFuZGxlcnMgPSBfLm1hcChoYW5kbGVycywgaGFuZGxlciA9PiB7XG4vLyAgICAgY29uc3QgaW5pdCA9IHtcbi8vICAgICAgIG1vdXNlb3ZlcjogZnVuY3Rpb24oKSB7fSxcbi8vICAgICAgIG1vdXNlb3V0OiBmdW5jdGlvbigpIHt9LFxuLy8gICAgICAgbW91c2Vtb3ZlOiBmdW5jdGlvbigpIHt9LFxuLy8gICAgICAgbW91c2V1cDogZnVuY3Rpb24oKSB7fSxcbi8vICAgICAgIG1vdXNlZG93bjogZnVuY3Rpb24oKSB7fSxcbi8vICAgICAgIGNsaWNrOiBmdW5jdGlvbigpIHt9XG4vLyAgICAgfTtcbi8vICAgICBPYmplY3QuYXNzaWduKGluaXQsIGhhbmRsZXIoYmluZFRoaXMpKTtcbi8vICAgICByZXR1cm4gaW5pdDtcbi8vICAgfSk7XG4vLyAgIGxldCBldmVudHMgPSBbXG4vLyAgICAgJ21vdXNlb3ZlcicsXG4vLyAgICAgJ21vdXNlb3V0Jyxcbi8vICAgICAnbW91c2Vtb3ZlJyxcbi8vICAgICAnbW91c2V1cCcsXG4vLyAgICAgJ21vdXNlZG93bicsXG4vLyAgICAgJ2NsaWNrJ1xuLy8gICBdO1xuXG5cbi8vICAgXy5lYWNoKGV2ZW50cywgZXZlbnRUeXBlID0+IHtcbi8vICAgICAkaWQodGFyZ2V0RGl2SWQpLm9uKGV2ZW50VHlwZSwgZnVuY3Rpb24oZXZlbnQpIHtcbi8vICAgICAgIF8uZWFjaChtb3VzZUhhbmRsZXJzLCBoID0+IHtcbi8vICAgICAgICAgaFtldmVudFR5cGVdKGV2ZW50KTtcbi8vICAgICAgIH0pO1xuLy8gICAgIH0pO1xuLy8gICB9KTtcbi8vIH1cbiJdfQ==