import {storiesOf} from "@storybook/vue";

import FilterEngineDev from "./graph-paper.dev.vue";

import store from "../../store";

storiesOf("FilterWidget", module).add("basic", () => ({
  store,
  components: {FilterEngineDev},
  template: "<FilterEngineDev />",
  methods: {},
}));
