/*!
*  Howler.js Audio Player Demo
*  howlerjs.com
*
*  (c) 2013-2020, James Simpson of GoldFire Studios
*  goldfirestudios.com
*
*  MIT License


Modified by Thomas Bourgeois.
I have made quite a few changes for things I wanted/prefered.

*/

// ******************************************** Constants ********************************************
const audioPath = "../audio/"      // File path to audio files

// ******************************************** Variables & Constants ********************************************
let songState = false; // state for whether song is playing or not.
let volState = false;
let volumeLevel = 0;
const keys = ["Escape", "Enter", "k", " "];


// custom features
document.addEventListener('keydown', btnPress); // checking if key is pressed.
function btnPress() { // Function to close popup window
  let keyName = event.key;
  console.log(keyName);
  if (keys.includes(keyName)) {
    if (songState) {
      player.pause();
      songState = false;
    } else {
      player.play();
      songState = true;
    }
  } else if (keyName == "l" || keyName == "ArrowRight") {
    player.skip("next");
  } else if (keyName == "j" || keyName == "ArrowLeft") {
    player.skip("prev");
  } else if (keyName == "p") {
    player.togglePlaylist();
  } else if (keyName == "v") {
    if (volState) {
      volState = false;
    } else {
      volState = true;
    }
    player.toggleVolume();
  } else if ((keyName == "ArrowUp" || keyName == "ArrowDown")) {
    if (keyName == "ArrowUp") {
      keyVolume(true);
    } else {
      keyVolume(false);
    }
  }
};

function keyVolume(direc) { // Function for changing volume with
  let temp = volumeLevel;

  if (direc) {
    if (temp < .99) {
      temp += 0.05;
    }
  } else {
    if (temp > 0.01) {
      temp -= 0.05;
    }
  }

  volumeLevel = Math.round(temp * 100) / 100;
  player.volume(volumeLevel);
}


// Cache references to DOM elements.
let elms = ['lyrics', 'track', 'timer', 'duration', 'playBtn', 'pauseBtn', 'prevBtn', 'nextBtn', 'playlistBtn', 'volumeBtn', 'progress','loading', 'playlist', 'list', 'volume', 'barEmpty', 'barFull', 'sliderBtn'];
elms.forEach(function(elm) {
  window[elm] = document.getElementById(elm);
});

let songs = ["song1", "song2", "song3", "song4", "song5", "song6", "song7", "song8", "song9", "song10", "song11", "song12"];
songs.forEach(function(song) {
  window[song] = document.getElementById(song);
});

function changeLyrics(val) { // Function to update lyrics when song changes.
  $(".song").css("display", "none");

  switch (val) {
    case 0:
    $("#song4").css("display", "block");
    break;
    case 1:
    $("#song3").css("display", "block");
    break;
    case 2:
    $("#song11").css("display", "block");
    break;
    case 3:
    $("#song2").css("display", "block");
    break;
    case 4:
    $("#song7").css("display", "block");
    break;
    case 5:
    $("#song9").css("display", "block");
    break;
    case 6:
    $("#song8").css("display", "block");
    break;
    case 7:
    $("#song6").css("display", "block");
    break;
    case 8:
    $("#song1").css("display", "block");
    break;
    case 9:
    $("#song12").css("display", "block");
    break;
    case 10:
    $("#song10").css("display", "block");
    break;
    case 11:
    $("#song5").css("display", "block");
    break;

  }




}


/**
* Player class containing the state of our playlist and where we are in it.
* Includes all methods for playing, skipping, updating the display, etc.
* @param {Array} playlist Array of objects with playlist song details ({title, file, howl}).
*/
let Player = function(playlist) {
  this.playlist = playlist;
  this.index = 0;

  // Display the title of the first track.
  track.innerHTML = playlist[0].title;
  $("#song4").css("display", "block");


  // Setup the playlist display.
  playlist.forEach(function(song) {
    let div = document.createElement('li');
    div.className = 'list-song';
    div.innerHTML = song.title;
    div.onclick = function() {
      player.skipTo(playlist.indexOf(song));
    };
    list.appendChild(div);
  });
};
Player.prototype = {
  /**
  * Play a song in the playlist.
  * @param  {Number} index Index of the song in the playlist (leave empty to play the first or current).
  */
  play: function(index) {
    let self = this;
    let sound;


    index = typeof index === 'number' ? index : self.index;
    let data = self.playlist[index];

    // If we already loaded this track, use the current one.
    // Otherwise, setup and load a new Howl.
    if (data.howl) {
      sound = data.howl;
    } else {
      sound = data.howl = new Howl({
        src: [audioPath+ data.file + '.mp3'],
        html5: true, // Force to HTML5 so that the audio can stream in (best for large files).
        onplay: function() {
          // Display the duration.
          duration.innerHTML = self.formatTime(Math.round(sound.duration()));

          // Start updating the progress of the track.
          requestAnimationFrame(self.step.bind(self));

          pauseBtn.style.display = 'block';
        },
        onload: function() {
          loading.style.display = 'none';
        },
        onend: function() {
          self.skip('next');
        },
        onseek: function() {
          // Start updating the progress of the track.
          requestAnimationFrame(self.step.bind(self));
        }
      });
    }

    // Begin playing the sound.
    sound.play();

    // Update the track display.
    track.innerHTML = data.title;
    changeLyrics(index);


    // Show the pause button.
    if (sound.state() === 'loaded') {
      playBtn.style.display = 'none';
      pauseBtn.style.display = 'block';
    } else {
      loading.style.display = 'block';
      playBtn.style.display = 'none';
      pauseBtn.style.display = 'none';
    }

    // Keep track of the index we are currently playing.
    self.index = index;
  },

  /**
  * Pause the currently playing track.
  */
  pause: function() {
    let self = this;

    // Get the Howl we want to manipulate.
    let sound = self.playlist[self.index].howl;

    // Pause the sound.
    sound.pause();

    // Show the play button.
    playBtn.style.display = 'block';
    pauseBtn.style.display = 'none';
  },

  /**
  * Skip to the next or previous track.
  * @param  {String} direction 'next' or 'prev'.
  */
  skip: function(direction) {
    let self = this;

    // Get the next track based on the direction of the track.
    let index = 0;
    if (direction === 'prev') {
      index = self.index - 1;
      if (index < 0) {
        index = self.playlist.length - 1;
      }
    } else {
      index = self.index + 1;
      if (index >= self.playlist.length) {
        index = 0;
      }
    }

    self.skipTo(index);
  },

  /**
  * Skip to a specific track based on its playlist index.
  * @param  {Number} index Index in the playlist.
  */
  skipTo: function(index) {
    let self = this;

    // Stop the current track.
    if (self.playlist[self.index].howl) {
      self.playlist[self.index].howl.stop();
    }

    // Reset progress.
    progress.style.width = '0%';

    // Play the new track.
    self.play(index);
  },

  /**
  * Set the volume and update the volume slider display.
  * @param  {Number} val Volume between 0 and 1.
  */
  volume: function(val) {
    let self = this;

    // Update the global volume (affecting all Howls).
    Howler.volume(val);
    volumeLevel = val;

    // Update the display on the slider.
    let barWidth = (val * 90) / 100;
    barFull.style.width = (barWidth * 100) + '%';
    sliderBtn.style.left = (window.innerWidth * barWidth + window.innerWidth * 0.05 - 25) + 'px';
  },

  /**
  * Seek to a new position in the currently playing track.
  * @param  {Number} per Percentage through the song to skip.
  */
  seek: function(per) {
    let self = this;

    // Get the Howl we want to manipulate.
    let sound = self.playlist[self.index].howl;

    // Convert the percent into a seek position.
    if (sound.playing()) {
      sound.seek(sound.duration() * per);
    }
  },

  /**
  * The step called within requestAnimationFrame to update the playback position.
  */
  step: function() {
    let self = this;

    // Get the Howl we want to manipulate.
    let sound = self.playlist[self.index].howl;

    // Determine our current seek position.
    let seek = sound.seek() || 0;
    timer.innerHTML = self.formatTime(Math.round(seek));
    progress.style.width = (((seek / sound.duration()) * 100) || 0) + '%';

    // If the sound is still playing, continue stepping.
    if (sound.playing()) {
      requestAnimationFrame(self.step.bind(self));
    }
  },

  /**
  * Toggle the playlist display on/off.
  */
  togglePlaylist: function() {
    let self = this;
    let display = (playlist.style.display === 'block') ? 'none' : 'block';

    setTimeout(function() {
      playlist.style.display = display;
    }, (display === 'block') ? 0 : 500);
    playlist.className = (display === 'block') ? 'fadein' : 'fadeout';
  },

  /**
  * Toggle the volume display on/off.
  */
  toggleVolume: function() {
    let self = this;
    let display = (volume.style.display === 'block') ? 'none' : 'block';

    setTimeout(function() {
      volume.style.display = display;
    }, (display === 'block') ? 0 : 500);
    volume.className = (display === 'block') ? 'fadein' : 'fadeout';
  },

  /**
  * Format the time from seconds to M:SS.
  * @param  {Number} secs Seconds to format.
  * @return {String}      Formatted time.
  */
  formatTime: function(secs) {
    let minutes = Math.floor(secs / 60) || 0;
    let seconds = (secs - minutes * 60) || 0;

    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
  }
};

// Setup our new audio player class and pass it the playlist.
let player = new Player([{
  title: 'Any Kind a Man',
  file: 'Any Kind A Man',
  howl: null
},
{
  title: 'Deke Lion March',
  file: 'Deke Lion March',
  howl: null
},
{
  title: 'Delta Kappa Epsilon',
  file: 'Delta Kappa Epsilon',
  howl: null
},
{
  title: 'Friends from the Heart',
  file: 'Friends From The Heart',
  howl: null
},
{
  title: 'Marching Song',
  file: 'Marching Song',
  howl: null
},
{
  title: 'O Drink to DKE',
  file: 'O Drink To DKE',
  howl: null
},
{
  title: 'Oh The Red Hot Spot',
  file: 'Oh The Red Hot Spot',
  howl: null
},
{
  title: 'Phi Marching Song',
  file: 'Phi Marching Song',
  howl: null
},
{
  title: 'Son of a DKE',
  file: 'Son Of A DKE',
  howl: null
},
{
  title: 'The Darling Maid',
  file: 'The Darling Maid',
  howl: null
},
{
  title: 'Vive La DKE',
  file: 'Vive La DKE',
  howl: null
},
{
  title: 'We Hail the Holy Goddess',
  file: 'We Hail The Holy Goddess',
  howl: null
}
]);


// Bind our player controls.
playBtn.addEventListener('click', function() {
  songState = true;
  player.play();
});
pauseBtn.addEventListener('click', function() {
  songState = false;
  player.pause();
});
prevBtn.addEventListener('click', function() {
  player.skip('prev');
});
nextBtn.addEventListener('click', function() {
  player.skip('next');
});
playlistBtn.addEventListener('click', function() {
  player.togglePlaylist();
});
playlist.addEventListener('click', function() {
  player.togglePlaylist();
});
volumeBtn.addEventListener('click', function() {
  player.toggleVolume();
});
volume.addEventListener('click', function() {
  player.toggleVolume();
});

// Setup the event listeners to enable dragging of volume slider.
barEmpty.addEventListener('click', function(event) {
  let per = event.layerX / parseFloat(barEmpty.scrollWidth);
  player.volume(per);
});
sliderBtn.addEventListener('mousedown', function() {
  window.sliderDown = true;
});
sliderBtn.addEventListener('touchstart', function() {
  window.sliderDown = true;
});
volume.addEventListener('mouseup', function() {
  window.sliderDown = false;
});
volume.addEventListener('touchend', function() {
  window.sliderDown = false;
});

let move = function(event) {
  if (window.sliderDown) {
    let x = event.clientX || event.touches[0].clientX;
    let startX = window.innerWidth * 0.05;
    let layerX = x - startX;
    let per = Math.min(1, Math.max(0, layerX / parseFloat(barEmpty.scrollWidth)));
  }
};

volume.addEventListener('mousemove', move);
volume.addEventListener('touchmove', move);
