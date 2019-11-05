
import {storiesOf} from "@storybook/vue";

import FilterEngineDev from "../components/filter-engine/filter-engine.dev.vue";

import store from '../store';

storiesOf("PDF + Text", module)
  .add("TODO", () => ({
    store,
    components: {FilterEngineDev},
    template: "<span>TODO</span>",
    methods: {},
  }));
