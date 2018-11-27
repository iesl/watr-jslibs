//
import {storiesOf} from "@storybook/vue";
// import { action } from '@storybook/addon-actions';
// import { linkTo } from '@storybook/addon-links';

import FilterEngineDev from "./filter-engine.dev.vue";

import store from "../../store";

storiesOf("FilterWidget", module).add("basic", () => ({
  store,
  components: {FilterEngineDev},
  template: "<FilterEngineDev />",
  methods: {},
}));
