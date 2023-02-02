import { ref, reactive } from 'vue'
import Graffiti from '../../graffiti.js'

export default {
  install(app, options) {

    const graffitiURL = options && 'url' in options?
      options.url : 'https://graffiti.garden'

    // Initialize graffiti
    const graffiti = new Graffiti(graffitiURL, ()=>reactive({}))

    // These ID need to change after opening
    app.config.globalProperties.$graffitiID = ref(null)
    graffiti.waitTilOpen().then(()=> {
      app.config.globalProperties.$graffitiID.value = graffiti.myID
    })

    // Add logging in and out
    app.config.globalProperties.$graffitiToggleLogIn =
      graffiti.toggleLogIn.bind(graffiti)

    // A composable for subscribing and
    // unsubscribing to tags that returns
    // a reactive array of the results
    app.component('GraffitiObjects', {

      props: ['tags'],

      watch: {
        tags: {
          async handler(newTags, oldTags=[]) {
            // Subscribe to the new tags
            await graffiti.subscribe(...newTags)
            // Unsubscribe to the existing tags
            await graffiti.unsubscribe(...oldTags)
          },
          immediate: true,
          deep: true
        }
      },

      // Handle unmounting too
      unmount() {
        graffiti.unsubscribe(this.tags)
      },

      computed: {
        objects() {
          return graffiti.objectsByTags(...this.tags)
        }
      },

      template: '<slot :objects="objects"></slot>'
    })

  }
}
