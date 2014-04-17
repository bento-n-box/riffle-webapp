var readAudio = (function(){
    var self = {

      init: function (){
        self.recorder;
        self.addAudio();
        window.recorder = self.recorder;

        $('#record').click(function(e){
          self.startRecording(e);
        });
        $('#stop').click(function(e){
          self.stopRecording(e);
        })
        self.testAudioApi()
      },

      addAudio: function(){
        var savedAudio = localStorage || '';

        $.each(savedAudio, function(index, value){
          $('#recordingslist').append('<li><audio controls src="'+ value +'"></audio></li>')
        })

      },

      startUserMedia: function(stream) {
        console.log('startmedia');
        var input = audio_context.createMediaStreamSource(stream);
        input.connect(audio_context.destination);
        self.recorder = new Recorder(input);
      },

      startRecording: function(e) {
        var button = $(e.currentTarget)[0];

        self.recorder && self.recorder.record();
        button.disabled = true;
        button.nextElementSibling.disabled = false;
        //__log('Recording...');
      },

      stopRecording: function(e) {
        var button = $(e.currentTarget)[0];
        self.recorder && self.recorder.stop();
        button.disabled = true;
        button.previousElementSibling.disabled = false;
        //__log('Stopped recording.');

        // create WAV download link using audio data blob
        self.createDownloadLink();

        //Recorder.clear();
      },

      createDownloadLink: function() {
        self.recorder && self.recorder.exportWAV(function(blob) {
          window.blob = blob
          localStorage.setItem('blob'+url, blob);
          console.log(blob);
          var url = URL.createObjectURL(blob);
          var li = document.createElement('li');
          var au = document.createElement('audio');
          var hf = document.createElement('a');
          var title = document.createElement('span')

          //$('#recordingslist').append('<li><audio controls src="'+ url'">')

          console.log(decodeURIComponent(url));
          au.controls = true;
          au.src = url;

          hf.href = url;
          title.innerHTML = $("input[name='riffle-hashtags']").val();
          hf.download = new Date().toISOString() + '.wav';
          hf.innerHTML = hf.download;
          li.appendChild(au);
          li.appendChild(hf);
          li.appendChild(title);
          recordingslist.appendChild(li);
        });

        //self.recorder && self.recorder.getBuffer([self.audioData]);
      },

      audioData: function(data){
        console.log('ran', data);

      },

      testAudioApi: function(){
        try {
          // webkit shim
          window.AudioContext = window.AudioContext || window.webkitAudioContext;
          navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
          window.URL = window.URL || window.webkitURL;

          audio_context = new AudioContext;
          //__log('Audio context set up.');
          //__log('navigator.getUserMedia ' + (navigator.getUserMedia ? 'available.' : 'not present!'));
        } catch (e) {
          alert('No web audio support in this browser!');
        }

        navigator.getUserMedia({audio: true}, self.startUserMedia, function(e) {
          //__log('No live audio input: ' + e);
        });
      }

    };

    return self;

})()

function __log(e, data) {
  log.innerHTML += "\n" + e + " " + (data || '');
}

window.onload = function init() {
  readAudio.init();
};
