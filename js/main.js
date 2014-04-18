var readAudio = (function(){
    var BASE_URL = 'file:///127.0.0.1:8080/';
    var Local_BASE_URL = 'file:///127.0.0.1:8080/';

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
        //input.connect(audio_context.destination);
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
        self.uploadRecordedAudio();

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

      uploadRecordedAudio: function() {
        self.recorder.exportWAV(function (blob) {
          var url = (window.URL || window.webkitURL).createObjectURL(blob);	// Set the recorded url to the player so that recorded sound can be heard by Gourav on 03/20/2014
          $("audio").attr("src", url);
          //$("audio#RecordingPlayer_speaking").get()[0].load();
            var xhr = new XMLHttpRequest();
            filename = "abc";
            xhr.open('POST', "upload.php", true);
            xhr.onload = function (e) {
                e.stopImmediatePropagation();
                var result = e.target.result;
            };
            xhr.onreadystatechange = function () {
              if (xhr.readyState == 4 && xhr.status == 200) {
                fileAndFolderName = xhr.responseText;
                var splitFileAndFolderName = fileAndFolderName.split("|");
                UserFolder = splitFileAndFolderName[1];

                var generateUrl = Local_BASE_URL + "/" +  splitFileAndFolderName[0];
                $("#filename").val(generateUrl);
                $("#play").css("display", "");
                $("#player_audio").css("display", "");
                $("#player_src").attr("src", generateUrl);
                //$("#player_audio").get()[0].load();

                //var generateUrl = SOUND_URL + "/" + UserFolder + "/" + splitFileAndFolderName[0];

                }
            }
            xhr.send(blob);
          });
        },

      // audioData: function(data){
      //   console.log('ran', data);
      //
      // },

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
