//


import {
  PdfPageState,
  PdfPageMutations
} from '~/components/pdf-pages/pdf-page';

export const state = () => new PdfPageState();

export const mutations = PdfPageMutations;

// export class PdfPageStateModule implements Module<PdfPageState, any> {
//   namespaced: boolean = true
//   state: PdfPageState =  new PdfPageState();
//   actions = <ActionTree<PdfPageState, any>> {}
//   mutations = <MutationTree<PdfPageState>> {
//     setHoveredText(state: PdfPageState, hoveredText: TextDataPoint[]) {
//       state.hoveredText = hoveredText;
//     },
//     setClickedText(state: PdfPageState, newVal: TextDataPoint) {
//       state.clickedText = [newVal];
//     }
//   }
//   getters = <GetterTree<PdfPageState, any>> {}
//   plugins: Plugin<PdfPageState>[] = []
//   constructor() {}
// }
