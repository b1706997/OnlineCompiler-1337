console.log('Client-side code running');

const button = document.getElementById('runbutton');
button.addEventListener('click', function(e) {
  var editor = document.getElementById('editor');
  const a = editor.getValue();
  console.log(a);
});