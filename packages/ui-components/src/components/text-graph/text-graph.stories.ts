import {storiesOf} from "@storybook/vue";

import TextGraphDev from "./text-graph.dev.vue";

import store from "~/../.storybook/store";


storiesOf("TextGraphDev", module).add("basic", () => ({
  store,
  components: {TextGraphDev},
  template: "<TextGraphDev />",
  methods: {},
}));
