

import {
  Vue,
  Component,
  // Prop,
} from "vue-property-decorator";

@Component
export default class Callback extends Vue {

  // isAuthenticated: boolean = false;

  // profile: any = {};

  created() {
    console.log('Callback created')

    this.$auth.handleAuthentication();
  }

  handleLoginEvent(data: any): void {
    console.log('callback: handleLoginEvent', data);
    this.$router.push(data.state.target || "/");
  }

}
