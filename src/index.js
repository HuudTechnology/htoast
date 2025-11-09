import Htoast from './components/Htoast.vue'
import useHtoast from './composables/useHtoast'

// Auto-install when vue is found (e.g., in browser via <script> tag)
let GlobalVue = null
if (typeof window !== 'undefined') {
  GlobalVue = window.Vue
} else if (typeof global !== 'undefined') {
  GlobalVue = global.Vue
}

if (GlobalVue) {
  GlobalVue.component('Htoast', Htoast)
}

export { Htoast, useHtoast }
export default Htoast