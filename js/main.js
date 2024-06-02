document.addEventListener("DOMContentLoaded", () => {
  // Get elements

  const circles = [...document.querySelectorAll(".shop-by-models__circle")];
  let circleTexts = [...document.querySelectorAll(".shop-by-models__svg")];

  const slidesContainer = document.querySelector(".carousel__slides");
  const prevButton = document.querySelector(".carousel__button--prev");
  const nextButton = document.querySelector(".carousel__button--next");

  const prevProgress = document.querySelector(".progress__position-previous");
  const currProgress = document.querySelector(".progress__position-current");
  const totalProgress = document.querySelector(".progress__position-total");
  const progressBarFill = document.querySelector(".progress-bar__fill");

  // *Data
  const initialChildren = slidesContainer.childElementCount;
  const slidesToShow = 2;
  const gap = parseInt(getComputedStyle(slidesContainer).gap);
  totalProgress.textContent = initialChildren;

  let currentIndex = 0;
  let isTransitioning = false;
  let previousDisplayIndex = 0;

  // *Utility functions
  const fade = (element, duration, fadeIn = true) => {
    const steps = duration / 100;
    const deltaOpacity = 1 / steps;
    let opacity = fadeIn ? 0 : 1;

    const updateOpacity = () => {
      opacity += fadeIn ? deltaOpacity : -deltaOpacity;
      element.style.opacity = Math.max(0, Math.min(1, opacity));
      if ((fadeIn && opacity < 1) || (!fadeIn && opacity > 0)) {
        setTimeout(updateOpacity, 100);
      }
    };
    updateOpacity();
  };

  // *Carousels
  const cloneSlides = (start, end) => {
    const slides = [...slidesContainer.children].slice(start, end);
    slides
      .reverse()
      .forEach((slide) => slidesContainer.prepend(slide.cloneNode(true)));
  };

  const removeClonedSlides = () => {
    const slidesToRemove = [...slidesContainer.children].slice(
      -initialChildren
    );
    slidesToRemove.forEach((slide) => slidesContainer.removeChild(slide));
  };

  const handleButtonStates = () => {
    const isAtStart = currentIndex === 0;
    const isAtBoundary = currentIndex % initialChildren === 0;

    nextButton.disabled = isAtBoundary;
    prevButton.disabled = !isAtStart && isAtBoundary;

    nextButton.classList.toggle(
      "carousel__button--disabled",
      nextButton.disabled
    );
    nextButton.classList.toggle(
      "carousel__button--inactive",
      nextButton.disabled
    );

    if (prevButton.disabled) {
      prevButton.classList.add("carousel__button--disabled");
      cloneSlides(0, slidesContainer.childElementCount - slidesToShow);

      setTimeout(() => {
        removeClonedSlides();
        slidesContainer.style.transition = "none";
        slidesContainer.style.transform = "translateX(0px)";
        currentIndex = 0;
        setTimeout(() => {
          slidesContainer.style.transition = "";
          prevButton.disabled = false;
          prevButton.classList.remove("carousel__button--disabled");
        }, 100);
      }, 2000);
    }
  };

  // Slide
  const updateSlides = () => {
    const slideWidth = slidesContainer.firstElementChild.clientWidth;
    const offset = (slideWidth + gap) * currentIndex;
    slidesContainer.style.transform = `translateX(${offset}px)`;
    handleButtonStates();
    updateProgressBar();
    updateProgressAnimation();
  };

  const updateSlideActivation = () => {
    const slides = [...document.querySelectorAll(".carousel__image")];
    slides.forEach((slide) =>
      slide.classList.remove("carousel__image--active")
    );

    const totalSlides = slidesContainer.childElementCount;
    const activeSlideIndex = totalSlides - 1 - (currentIndex % totalSlides);
    slides[activeSlideIndex].classList.add("carousel__image--active");
  };

  // Text
  const updateRotation = (element, direction) => {
    let rotation = parseInt(element.getAttribute("data-rotation")) || 0;
    rotation += direction * -75;
    element.setAttribute("data-rotation", rotation);
    element.style.transform = `rotate(${rotation}deg)`;
  };

  const updateCircleText = (direction) => {
    const currentActiveIndex = circleTexts.findIndex(
      (circleText) => circleText.style.opacity === "1"
    );

    if (currentActiveIndex !== -1) {
      circleTexts[currentActiveIndex].style.opacity = "0";
      circleTexts[currentActiveIndex].style.visibility = "hidden";
      updateRotation(circleTexts[currentActiveIndex], direction);

      const nextActiveIndex = currentIndex % initialChildren;

      if (nextActiveIndex === 0 && direction === 1) {
        circleTexts.forEach((svg, index) => {
          if (index !== circleTexts.length - 1)
            svg.style.transform = "rotate(75deg)";
          svg.setAttribute("data-rotation", "75");
          svg.style.opacity = "0";
          svg.style.visibility = "hidden";
        });

        setTimeout(() => {
          const firstElement = circleTexts[0];
          firstElement.style.transform = "rotate(0deg)";
          firstElement.setAttribute("data-rotation", "0");
          firstElement.style.opacity = "1";
          firstElement.style.visibility = "visible";

          const lastElement = circleTexts[circleTexts.length - 1];
          lastElement.style.transform = "rotate(75deg)";
          lastElement.setAttribute("data-rotation", "75");
          lastElement.style.opacity = "0";
          lastElement.style.visibility = "hidden";
        }, 500);
      } else {
        circleTexts[nextActiveIndex].style.opacity = "1";
        circleTexts[nextActiveIndex].style.visibility = "visible";
        updateRotation(circleTexts[nextActiveIndex], direction);
      }
    }
  };

  const updateCircleGraph = () => {
    const currentActiveIndex = circles.findIndex(
      (circle) => circle.style.opacity === "1"
    );

    if (currentActiveIndex !== -1) {
      fade(circles[currentActiveIndex], 500, false);
      setTimeout(() => {
        circles[currentActiveIndex].style.opacity = "0";
        circles[currentActiveIndex].style.visibility = "hidden";
        circles[currentActiveIndex].style.transform = "scale(0)";
      }, 500);
    }

    const nextActiveIndex = currentIndex % initialChildren;
    circles[nextActiveIndex].style.opacity = "1";
    circles[nextActiveIndex].style.visibility = "visible";
    circles[nextActiveIndex].style.transform = "scale(1)";
  };

  // *Progress Bar
  const updateProgressBar = () => {
    const displayIndex = (currentIndex % initialChildren) + 1;
    fade(currProgress, 100);
    currProgress.textContent = displayIndex;
    progressBarFill.style.width = `calc(100% * ${displayIndex} / ${initialChildren})`;
    if (previousDisplayIndex !== 0) {
      prevProgress.textContent = previousDisplayIndex;
    }
    previousDisplayIndex = displayIndex;
  };

  const updateProgressAnimation = () => {
    if (currentIndex % initialChildren === initialChildren - 1) {
      currProgress.style.transition = "all 0.5s ease";
      currProgress.classList.add("progress__position-current--max");
      fade(totalProgress, 500);
      fade(prevProgress, 500, false);
    } else if (currentIndex % initialChildren === 0) {
      totalProgress.style.transition = "all 0.5s ease";
      totalProgress.classList.add("progress__position-total--min");
      fade(currProgress, 500);
      prevProgress.textContent = initialChildren;
      prevProgress.classList.add("progress__position-previous--min");
      fade(prevProgress, 500, false);
    } else {
      totalProgress.style.transition = "";
      currProgress.style.transition = "";
      prevProgress.classList.remove("progress__position-previous--min");
      currProgress.classList.remove("progress__position-current--max");
      totalProgress.classList.remove("progress__position-total--min");
      fade(prevProgress, 500, false);
    }
  };

  // *Middleware
  const transitionEnd = () => (isTransitioning = false);

  // *Activation
  const handleChange = (direction) => {
    if (!isTransitioning) {
      isTransitioning = true;
      currentIndex += direction;
      updateSlides();
      updateCircleGraph();
      updateCircleText(direction);
      updateSlideActivation();
    }
  };

  // *Event Listeners
  prevButton.addEventListener("click", () => handleChange(1));
  nextButton.addEventListener("click", () => {
    if (currentIndex % initialChildren !== 0) {
      handleChange(-1);
    }
  });
  slidesContainer.addEventListener("transitionend", transitionEnd);

  // *Initial
  cloneSlides(-slidesToShow, slidesContainer.childElementCount);
  handleButtonStates();

  circles[0].style.opacity = 1;
  circles[0].style.visibility = "visible";
  circles[0].style.transform = "scale(1)";
  circles[0].style.transition = "none";

  circleTexts.forEach((svg, index) => {
    if (index !== 0) {
      svg.style.transform = "rotate(75deg)";
      svg.setAttribute("data-rotation", "75");
      svg.style.opacity = 0;
      svg.style.visibility = "hidden";
    }
  });
  circleTexts[0].style.opacity = 1;
  circleTexts[0].style.visibility = "visible";
  circleTexts[0].style.transition = "none";

  setTimeout(() => {
    circles[0].style.transition = "";
    circleTexts[0].style.transition = "";
  }, 500);

  updateProgressBar();
});
