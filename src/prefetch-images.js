import { allTiny } from './assets/images';

var head = document.head;

for (var i = 0; i < allTiny.length; i++) {
  var hint = document.createElement("link");
  hint.rel = "prefetch";
  hint.as = "image";
  hint.href = allTiny[i];
  head.appendChild(hint);
}
