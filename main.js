var chance;
var image;

var words;
var correct_word;
var words_to_go;
var num_words;

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 */
function r_in_r(min, max) {
  return chance.integer({min: min, max: max});
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

////////////////////////////////////////////////////////////////////////////////
//////////////////////////// Getting images ////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

function get_image(keyword) {
  $.getJSON("https://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?",
  {
    tags: keyword,
    tagmode: "any",
    format: "json",
    extras: "true"
  },
  function(data) {
    if (data.items.length > 0) {
      var chosen_img = data.items[r_in_r(0,data.items.length-1)];
      words.push({
        word: keyword,
        image: chosen_img['media']['m'].replace("_m", "_b")
      });
      if (!image) {
        image = chosen_img['media']['m'].replace("_m", "_b");
        correct_word = keyword;
        next_word();
      }
      else {
        if (words_to_go > 1) {
          next_word();
        }
        else {
          add_word_options();
        }
      }
    }
    else {
      get_word();
    }
  });
}

////////////////////////////////////////////////////////////////////////////////
//////////////////////////// Getting words /////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

function next_word() {
  words_to_go--;
  document.getElementById('loading_ind').style.width = (100-(100 * (words_to_go/num_words))).toString() + "%";
  get_word();
}

function get_word() {
  var requestStr = "https://wordsapiv1.p.mashape.com/words/?random=true";

  $.ajax({
    type: "GET",
    url: requestStr,
    headers: {
      "X-Mashape-Key": "UId3m2uPUXmshfAqc2JoAXEXw2oNp1kR3OwjsnnYSlW5DTaW0A",
      'Content-Type':'application/json'
    },
    dataType: "json",
    success: function (data) {
      console.log(data);
      if (words.indexOf(data.word) < 1) {
        get_image(data.word);
      }
    }
  });
}
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

function reset_game() {
  document.getElementById('loader').style.opacity = "1";
  document.getElementById('loading_ind').style.width = "0";
  document.getElementById('loader').style.display = "flex";
  document.getElementById('button_text').innerHTML = "Skip";
  // remove options
  var options = document.getElementById("words");
  while (options.firstChild) {
    options.removeChild(options.firstChild);
  }

  image = null;
  correct_word = null;
  words = [];
  num_words = 5;
  words_to_go = num_words;


  get_word();
}

var showing_temp_image = false;

function show_image(hover_ev,permanent) {
  if (showing_temp_image && !permanent) {
    return;
  }
  var active_option = hover_ev.target;
  if (permanent && (active_option.className != "word_button_wrong flex column center" && active_option.className != "word_button_right flex column center")) {
    active_option = hover_ev.target.parentNode;
  }
  showing_temp_image = true;
  var cur_word = active_option.getElementsByTagName('p')[0].innerHTML;
  var temp_image;

  for (var i = 0; i < words.length; i++) {
    if (words[i].word == cur_word) {
      temp_image = words[i].image;
      if (permanent) {
        image = temp_image;
      }
    }
  }

  document.getElementById('image').style.backgroundImage = "url(" + temp_image + ")";
}

function unshow_image() {
  document.getElementById('image').style.backgroundImage = "url(" + image + ")";
  showing_temp_image = false;
}

function handle_option_choice() {
  while (document.getElementsByClassName('word_button').length > 0) {
    var option = document.getElementsByClassName('word_button')[0];
    if (option.getElementsByTagName('p')[0].innerHTML == correct_word) {
      option.className = "word_button_right flex column center";
    }
    else {
      option.className = "word_button_wrong flex column center";
    }
    option.addEventListener("mouseenter",show_image);
    option.removeEventListener('click', handle_option_choice);
    option.addEventListener("click",function (click_ev) {
      show_image(click_ev,true);
    });
    option.addEventListener("mouseleave",unshow_image);
  }
  setTimeout(function () {
    document.getElementById('button_text').innerHTML = "New Game";
  }, 100);
}

function add_word_options() {
  document.getElementById('loading_ind').style.width = "100%";
  document.getElementById('image').style.backgroundImage = "url(" + image + ")";
  words = shuffle(words);
  var temp_image = document.createElement('img');
  temp_image.src = image;
  temp_image.onload = function () {
    document.getElementById('loader').style.opacity = "0";
    setTimeout(function () {
      document.getElementById('loader').style.display = "none";
      document.getElementById('button_text').innerHTML = "Skip";
    }, 500);
  }

  for (var i = 0; i < words.length; i++) {
    var option_cont = document.createElement('div');
    option_cont.className = "word_cont flex row center";

    var option = document.createElement('div');
    option.className = "word_button flex column center";
    option.addEventListener('click', handle_option_choice);

    var option_text = document.createElement('p');
    option_text.innerHTML = words[i].word;


    option.appendChild(option_text);
    option_cont.appendChild(option);
    document.getElementById('words').appendChild(option_cont);
  }
  resize();
}

function init_vars() {
  images = [];
  words = [];
}

function seed_random(inp_string) {
  inp_string = inp_string || (new Chance()).string();
  chance = new Chance(inp_string);
}

function init() {
  init_vars();
  seed_random();
  reset_game();
  resize();
  document.getElementById('button').addEventListener('click',reset_game);
}

function resize() {
  if (window.innerWidth > window.innerHeight) {
    document.getElementById('main').className = document.getElementById('main').className.replace(" column"," row");
    document.getElementById('words').style.height = null;
    document.getElementById('words').style.width = null;
    document.getElementById('words').className = document.getElementById('words').className.replace(" row"," column");
    document.getElementById('image_cont').className = document.getElementById('image_cont').className.replace(" row"," column");
    document.getElementById('image_cont').style.height = null;
    document.getElementById('image_cont').style.width = null;

    while (document.getElementsByClassName('word_cont_mob').length > 0) {
      document.getElementsByClassName('word_cont_mob')[0].className = document.getElementsByClassName('word_cont_mob')[0].className.replace(" column", " row").replace("word_cont_mob","word_cont");
    }
    document.body.style.fontSize = null;
  }
  else {
    document.getElementById('main').className = document.getElementById('main').className.replace(" row"," column");
    document.getElementById('words').style.height = "50%";
    document.getElementById('words').style.width = "100%";
    document.getElementById('words').className = document.getElementById('words').className.replace(" column"," row");
    document.getElementById('image_cont').className = document.getElementById('image_cont').className.replace(" column"," row");
    document.getElementById('image_cont').style.height = "50%";
    document.getElementById('image_cont').style.width = "100%";

    while (document.getElementsByClassName('word_cont').length > 0) {
      document.getElementsByClassName('word_cont')[0].className = document.getElementsByClassName('word_cont')[0].className.replace(" row", " column").replace("word_cont","word_cont_mob");
    }

    if (window.innerWidth > 830) document.body.style.fontSize = "2rem";
  }
}

window.onload = init;
window.onresize = resize;
