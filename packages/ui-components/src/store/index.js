export default {
  async GET_USERS() {
    const r = await this.$axios.get(`${process.env.USERS_ENDPOINT}`)
    return r
  },
  async GET_COMMENTS() {
    const r = await this.$axios.get(`${process.env.COMMENTS_ENDPOINT}`)
    return r
  }
}
