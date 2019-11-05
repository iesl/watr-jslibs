import {storiesOf} from "@storybook/vue";

const stories = storiesOf("Authentication", module);

import router from "../../routes";
import LoginPanel from "./login";

stories.add("login panel", () => ({
  router,
  template: '<v-app> <LoginPanel /> </v-app>',
  components: {LoginPanel},
}));

