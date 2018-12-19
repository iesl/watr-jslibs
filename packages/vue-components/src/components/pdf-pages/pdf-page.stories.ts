import {storiesOf} from "@storybook/vue";

import PdfPage from "./pdf-page.vue";

import store from "@/store";

storiesOf("Pdf Page(s)", module)
  .add("basic", () => ({
    store,
    components: {PdfPage},
    template: "<PdfPage />",
    methods: {},
  }))
;
