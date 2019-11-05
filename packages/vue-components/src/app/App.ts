import {Vue, Component, Prop} from "vue-property-decorator";

import LoginPanel from "../components/auth/login";
import Callback from "../components/auth/callback";

@Component({
  components: {
    LoginPanel,
    Callback
  }
})
export default class App extends Vue {
  @Prop() source!: string;

  get items() {
    return [
      {icon: "lightbulb", text: "Browse"},
      {icon: "touch_app", text: "Curate"},
      {divider: true},
      {heading: "Labels"},
      {icon: "add", text: "Create new label"},
      {divider: true},
      {icon: "archive", text: "Archive"},
      {icon: "delete", text: "Trash"},
    ];
  }

  drawer: boolean = true;
}
