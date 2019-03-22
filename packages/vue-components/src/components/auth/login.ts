
import {
  Vue,
  Component,
  // Prop,
} from "vue-property-decorator";

@Component
export default class LoginPanel extends Vue {

  isAuthenticated: boolean = false;

  profile: any = {};

  async created() {
    try {
      console.log('renew');
      await this.$auth.renewTokens();
      console.log('renew..ed');
    } catch (e) {
      console.log('ex', e);
    }
  }

  login() {
    this.$auth.login();
  }
  logout() {
    this.$auth.logOut();
    this.$router.push({ path: "/" });
  }

  handleLoginEvent(data: any): void {
    console.log('handleLoginEvent', data);
    this.isAuthenticated = data.loggedIn;
    this.profile = data.profile;
  }

}
