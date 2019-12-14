// Install Composition Api

import Vue from 'vue';
import VueCompositionApi from '@vue/composition-api';

Vue.use(VueCompositionApi);



// import requireContext from 'require-context.macro'; // <- add this
// function globalRegisterStories() {
//   // const requireContext = require('require-context.macro'); // <- add this

//   // https://webpack.js.org/guides/dependency-management/#require-context
//   const requireComponent = requireContext(
//     // Look for files in the current directory
//     './src/components/',
//     // look in subdirectories?
//     true,
//     // Match names
//     /[\w-]+\.vue$/
//   );

//   // For each matching file name...
//   requireComponent.keys().forEach((fileName: string) => {
//     // Get the component config
//     const componentConfig = requireComponent(fileName)
//     // Get the PascalCase version of the component name
//     const componentName = fileName
//     // Remove the "./_" from the beginning
//       .replace(/^\.\/_/, '')
//     // Remove the file extension from the end
//       .replace(/\.\w+$/, '')
//     // Split up kebabs
//       .split('-')
//     // Upper case
//       .map((kebab) => kebab.charAt(0).toUpperCase() + kebab.slice(1))
//     // Concatenated
//       .join('')

//     console.log('globalRegisterStories', componentName);

//     // Globally register the component
//     // Vue.component(componentName, componentConfig.default || componentConfig)
//   })

// }


// globalRegisterStories();
