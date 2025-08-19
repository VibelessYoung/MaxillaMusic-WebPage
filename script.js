//DATA

const tracks = document.querySelectorAll(".track");
let currentAudio = null;
let currentSource = null;
let currentAnalyser = null;
let currentCanvas = null;
let ctx = null;
let audioCtx = null;

tracks.forEach(track => {
  const btn = track.querySelector(".play-btn");
  const canvas = track.querySelector(".visualizer");
  const title = track.querySelector(".title");
  let audio = new Audio(track.dataset.src);

  btn.addEventListener("click", () => {
    if (currentAudio && currentAudio !== audio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      const oldBtn = document.querySelector(".play-btn.playing");
      if (oldBtn) oldBtn.textContent = "▶";
      cancelAnimationFrame(drawVisual);
    }

    if (audio.paused) {
      audio.play();
      btn.textContent = "⏸";
      btn.classList.add("playing");

      // Web Audio API
      if (!audioCtx) audioCtx = new AudioContext();
      const source = audioCtx.createMediaElementSource(audio);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyser.connect(audioCtx.destination);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      ctx = canvas.getContext("2d");

      function draw() {
        drawVisual = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        ctx.fillStyle = "#222";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 2.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = dataArray[i] / 2;
          ctx.fillStyle = "#a020f0";
          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
          x += barWidth + 1;
        }
      }
      draw();

      currentAudio = audio;
    } else {
      audio.pause();
      btn.textContent = "▶";
      btn.classList.remove("playing");
    }
  });

  audio.addEventListener("ended", () => {
    btn.textContent = "▶";
    btn.classList.remove("playing");
  });
});
