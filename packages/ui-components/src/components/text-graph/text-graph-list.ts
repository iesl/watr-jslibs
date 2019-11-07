import _ from 'lodash';
import $ from 'jquery';

import Vue from 'vue'
import Component from 'nuxt-class-component'

// import {
//   Vue,
//   Component,
// } from "vue-property-decorator";

import TextGraph from "./text-graph";

import {
  // coords,
  // MouseHandlerSets as mhs,
  // MouseHandlers,
  GridTypes,
  // Point,
  // BBox,
  // tstags,
  // d3x,
  // getOrDie
} from "sharedLib";

@Component({
  components: {TextGraph},
})
export default class TextGraphList extends Vue {

  loaded: boolean = false;


  get textgrids(): GridTypes.Textgrid[] {
    if (this.loaded && this._grids) {
      const pages = this._grids.pages;
      const textgrids = _.map(pages, p => p.textgrid);
      return textgrids;
    }
    return [];
  }

  private _grids?: GridTypes.Grid;

  initialCandidates(): void {

    $.getJSON('http://localhost:3100/textgrids/textgrid-00.json', (textgrid: GridTypes.Grid) => {
      this._grids = textgrid
      this.loaded = true;

    }, (err) => {
      console.log('err', err);
    });

  }
  mounted() {
    this.initialCandidates();
  }
}
