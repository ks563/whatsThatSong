var el = document.querySelectorAll('.record');

var spin = anime({
    targets:  el,
    rotate: {
        value: 360,
        duration: 2500,
        easing: "linear"
      },
    loop: true,
});

$(".results-container").hide();

$("#submit").click(function(){
    $(".record-container").hide();
});
  
$("#submit").click(function(){
    $(".results-container").show();
});