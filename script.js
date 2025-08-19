const tracks = document.querySelectorAll(".track");
let currentAudio = null;
let audioCtx = null;
let drawVisual;

tracks.forEach(track => {
  const btn = track.querySelector(".play-btn");
  const canvas = track.querySelector(".visualizer");
  const title = track.querySelector(".title");
  const volumeSlider = track.querySelector(".volume"); // 🎯 ولوم هر ترک
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

      if (!audioCtx) audioCtx = new AudioContext();
      const source = audioCtx.createMediaElementSource(audio);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyser.connect(audioCtx.destination);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const ctx = canvas.getContext("2d");

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

  volumeSlider.addEventListener("input", (e) => {
    audio.volume = e.target.value;
  });

  audio.addEventListener("ended", () => {
    btn.textContent = "▶";
    btn.classList.remove("playing");
  });
});

const volumeSliders = document.querySelectorAll(".volume");

volumeSliders.forEach(slider => {
  function updateSliderBg(e) {
    const value = (e.target.value - e.target.min) / (e.target.max - e.target.min) * 100;
    e.target.style.background = `linear-gradient(90deg, #a020f0 ${value}%, #333 ${value}%)`;
  }

  updateSliderBg({ target: slider });

  slider.addEventListener("input", updateSliderBg);
});
