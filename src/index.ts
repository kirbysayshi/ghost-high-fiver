import { set, get } from 'idb-keyval';

enum Routes {
  ENCOUNTER = 'ENCOUNTER',
  SETTINGS = 'SETTINGS',
  SPLASHHELP = 'SPLASHHELP',
}

(async function() {

  let route = await get('route');

  if (route === undefined) {
    route = Routes.SPLASHHELP;
    await set('route', route);
  }

  console.log('route', route);

  // dispatch?
  // Or just... document.getElementById(route).style.display = 'block' ??? lol.

}())

console.log('hello!');