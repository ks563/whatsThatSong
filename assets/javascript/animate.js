var el = document.querySelectorAll('.record');

var spin = anime({
    targets:  el,
    rotate: {
        value: 360,
        duration: 1800,
        easing: "easeInOutSine"
      },
    loop: true,
});


// el.addEventListener('change', function() {  
//   // console.log(value);
//   // console.log(pos);
//   var value = this.value;
//   anime.speed = value/20;
//   // console.log(block);
// })