/* DATA */

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


/* DATA */

const txtareaEL = document.querySelector(".form__textarea");
const counterEl = document.querySelector(".counter");
const formEl = document.querySelector(".form");
const feedsEL = document.querySelector(".feedbacks");
const submitEL = document.querySelector(".submit-btn");

/* FUNCTIONS */

//CHECK MAX CHARACTER
const inputhandler = () => {
  const typedChars = txtareaEL.value.length;
  const maxChars = 150;
  const charsLeft = maxChars - typedChars;
  counterEl.textContent = charsLeft;
};

txtareaEL.addEventListener("input", inputhandler);

//CONTROL FORM INPUTS
const formhandler = (event) => {
  event.preventDefault();
  const txt = txtareaEL.value;

  if (txtareaEL.value.length < 5 || !txtareaEL.value.includes("#")) {
    [...formEl.elements].forEach((el) => (el.disabled = true));
    setTimeout(() => {
      [...formEl.elements].forEach((el) => (el.disabled = false));
    }, 2000);
  }

  if (txt.includes("#")) {
    formEl.classList.add("form--valid");
    setTimeout(() => {
      formEl.classList.remove("form--valid");
    }, 3000);
  } else {
    formEl.classList.add("form--invalid");
    setTimeout(() => {
      formEl.classList.remove("form--invalid");
    }, 3000);
    txtareaEL.focus();
    return;
  }

  //ADD TWITTES
  const hashtag = txt.split(" ").find((word) => word.includes("#"));
  const company = hashtag.substring(1);
  const date = 0;
  const upvote = 0;
  const letter = company.substring(0, 1).toUpperCase();
  const feedItem = `
    <li class="feedback">
            <button class="upvote">
                <i class="fa-solid fa-caret-up upvote__icon"></i>
                <span class="upvote__count">${upvote}</span>
            </button>
            <section class="feedback__badge">
                <p class="feedback__letter">${letter}</p>
            </section>
            <div class="feedback__content">
                <p class="feedback__company">${company}</p>
                <p class="feedback__text">${txt}</p>
            </div>
            <p class="feedback__date">${date === 0 ? "New" : `${date}d`}</p>
        </li>
    `;

  feedsEL.insertAdjacentHTML("beforeend", feedItem);
  txtareaEL.value = "";
  submitEL.blur();
  counterEl.textContent = 150;
};

formEl.addEventListener("submit", formhandler);

//CONTROL VOTES
const clickhandler = (event) => {
  const clickedEL = event.target;
  const upvoteEL = clickedEL.className.includes("upvote");

  if (upvoteEL) {
    const upvotebtnEL = clickedEL.closest(".upvote");
    upvotebtnEL.disabled = true;

    const votecountEL = upvotebtnEL.querySelector(".upvote__count");
    let votecount = +upvotebtnEL.textContent;
    votecountEL.textContent = ++votecount;
  } else {
    clickedEL.closest(".feedback").classList.toggle("feedback--expand");
  }
};

