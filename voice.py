<!DOCTYPE html>
<html>
<head>
<title>TTS App</title>
<style>
body{
    max-width:600px;
    margin:auto;
    padding:20px;
    font-family:Arial;
}
textarea{
    width:100%;
    height:150px;
}
</style>
</head>
<body>

<h2>Text To Speech</h2>

<textarea id="text"></textarea>

<br><br>

<select id="voice"></select>

<br><br>

Pitch
<input type="range" id="pitch" min="0" max="2" step="0.1" value="1">

<br><br>

Speed
<input type="range" id="rate" min="0.5" max="2" step="0.1" value="1">

<br><br>

<button onclick="speak()">Speak</button>

<script>

const voiceSelect = document.getElementById("voice");

function loadVoices() {

    const voices = speechSynthesis.getVoices();

    voiceSelect.innerHTML = "";

    voices.forEach((voice,index)=>{

        const option = document.createElement("option");

        option.value=index;
        option.textContent =
            voice.name + " (" + voice.lang + ")";

        voiceSelect.appendChild(option);
    });
}

speechSynthesis.onvoiceschanged = loadVoices;

loadVoices();

function speak() {

    const utterance =
        new SpeechSynthesisUtterance(
            document.getElementById("text").value
        );

    const voices =
        speechSynthesis.getVoices();

    utterance.voice =
        voices[voiceSelect.value];

    utterance.pitch =
        parseFloat(
            document.getElementById("pitch").value
        );

    utterance.rate =
        parseFloat(
            document.getElementById("rate").value
        );

    speechSynthesis.speak(utterance);
}

</script>

</body>
</html>
