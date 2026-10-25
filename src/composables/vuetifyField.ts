/** `defineField` config that maps VeeValidate errors to Vuetify `error-messages`. */
export const vuetifyFieldConfig = {
  props: (state: { errors: string[] }) => ({ 'error-messages': state.errors }),
};
