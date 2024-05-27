document.addEventListener("DOMContentLoaded", () => {
  // Get documents
  const circles = Array.from(
    document.querySelectorAll(".shop-by-models__circle")
  );

  const slidesContainer = document.querySelector(".carousel__slides");
  const prevButton = document.querySelector(".carousel__button--prev");
  const nextButton = document.querySelector(".carousel__button--next");

  const previousProgressSpan = document.querySelector(
    ".progress__position-previous"
  );
  const currentProgressSpan = document.querySelector(
    ".progress__position-current"
  );
  const totalProgressSpan = document.querySelector(".progress__position-total");
  const progressBarFill = document.querySelector(".progress-bar__fill");

  // Data
  const initialChildren = slidesContainer.childElementCount;
  const slidesToShow = 2;
  const gap = parseInt(getComputedStyle(slidesContainer).gap);
  totalProgressSpan.textContent = initialChildren;

  let currentIndex = 0;
  let isTransitioning = false;
  let previousDisplayIndex = 0;
  let isTheFirstRendering = true;

  // Animations
  const fadeIn = (element, duration) => {
    const interval = 100;
    const steps = duration / interval;
    const deltaOpacity = 1 / steps;

    let opacity = 0;
    let step = 0;

    const fade = () => {
      if (step < steps) {
        opacity += deltaOpacity;
        element.style.opacity = opacity;
        step++;
        setTimeout(fade, interval);
      } else {
        element.style.opacity = 1;
      }
    };

    fade();
  };

  const fadeOut = (element, duration) => {
    const interval = 100;
    const steps = duration / interval;
    const deltaOpacity = 1 / steps;

    let opacity = 1;
    let step = 0;

    const fade = () => {
      if (step < steps) {
        opacity -= deltaOpacity;
        element.style.opacity = opacity;
        step++;
        setTimeout(fade, interval);
      } else {
        element.style.opacity = 0;
      }
    };
    fade();
  };

  // Methods
  const cloneSlides = (start, end) => {
    const slides = Array.from(slidesContainer.children).slice(start, end);
    slides
      .reverse()
      .forEach((slide) => slidesContainer.prepend(slide.cloneNode(true)));
  };

  const handleSlideCloning = () => {
    cloneSlides(0, slidesContainer.childElementCount - slidesToShow);
  };

  const removeLastSlides = () => {
    const slidesToRemove = Array.from(slidesContainer.children).slice(
      -initialChildren
    );
    slidesToRemove.forEach((slide) => {
      slidesContainer.removeChild(slide);
    });
  };

  const updateProgressBar = (displayIndex) => {
    fadeIn(currentProgressSpan, 100);
    currentProgressSpan.textContent = displayIndex;
    progressBarFill.style.width = `calc(100% * ${displayIndex} / ${initialChildren})`;

    if (previousDisplayIndex !== 0) {
      previousProgressSpan.textContent = previousDisplayIndex;
    }
    previousDisplayIndex = displayIndex;
  };

  const handleButtonStates = () => {
    nextButton.disabled = currentIndex === 0;
    prevButton.disabled =
      currentIndex !== 0 && currentIndex % initialChildren === 0;

    if (prevButton.disabled) {
      isTheFirstRendering = false;
      handleSlideCloning();
      setTimeout(() => {
        removeLastSlides();
        slidesContainer.style.transition = "none";
        slidesContainer.style.transform = "translateX(0px)";
        currentIndex = 0;
        setTimeout(() => {
          slidesContainer.style.transition = "";
          slidesContainer.classList.remove("carousel__slides--active");
          prevButton.disabled = false;
          slidesContainer.classList.add("carousel__slides--active");
        }, 100);
      }, 2000);
    }
  };

  const updateProgressStyles = () => {
    if (currentIndex % initialChildren === initialChildren - 1) {
      currentProgressSpan.classList.add("progress__position-current--max");
      fadeIn(totalProgressSpan, 200);
      fadeOut(previousProgressSpan, 500);
    } else if (currentIndex % initialChildren === 0 && isTheFirstRendering === false) {
      totalProgressSpan.classList.add("progress__position-total--min");
      fadeIn(currentProgressSpan, 500);
      previousProgressSpan.classList.add("progress__position-previous--min");
      fadeIn(previousProgressSpan, 500);
      fadeOut(previousProgressSpan, 500);
    } else {
      previousProgressSpan.classList.remove("progress__position-previous--min");
      currentProgressSpan.classList.remove("progress__position-current--max");
      totalProgressSpan.classList.remove("progress__position-total--min");
      fadeOut(previousProgressSpan, 500);
      // Reset
      totalProgressSpan.style.transform = "";
      previousProgressSpan.style.transform = "";
    }
  };

  const updateSlides = () => {
    const slideWidth = slidesContainer.firstElementChild.clientWidth;
    const offset = (slideWidth + gap) * currentIndex;
    slidesContainer.style.transform = `translateX(${offset}px)`;

    const displayIndex = (currentIndex % initialChildren) + 1;

    updateProgressBar(displayIndex);
    handleButtonStates();
    updateProgressStyles();
  };

  const updateCircleGraph = (direction) => {
    const currentActiveIndex = circles.findIndex((circle) =>
      circle.classList.contains("shop-by-models__circle--active")
    );
    if (currentActiveIndex !== -1) {
      circles[currentActiveIndex].classList.remove(
        "shop-by-models__circle--active"
      );
      const nextActiveIndex =
        (currentActiveIndex + direction + circles.length) % circles.length;
      circles[nextActiveIndex].classList.add("shop-by-models__circle--active");
    }
  };

  const updateSlideActivation = () => {
    const slides = Array.from(slidesContainer.children);
    slides.forEach((slide) =>
      slide.classList.remove("carousel__image--active")
    );

    const totalSlides = slidesContainer.childElementCount;
    const activeSlideIndex = totalSlides - 1 - (currentIndex % totalSlides);
    slides[activeSlideIndex].classList.add("carousel__image--active");
  };

  const handleTransitionEnd = () => {
    isTransitioning = false;
  };

  const changeSlide = (direction) => {
    if (!isTransitioning) {
      isTransitioning = true;
      currentIndex += direction;
      updateSlides();
      updateCircleGraph(direction);
      updateSlideActivation();
    }
  };

  // Event Listeners
  prevButton.addEventListener("click", () => changeSlide(1));
  nextButton.addEventListener("click", () => {
    if (currentIndex % initialChildren !== 0) {
      changeSlide(-1);
    }
  });
  slidesContainer.addEventListener("transitionend", handleTransitionEnd);

  // Initialize Carousel
  slidesContainer.classList.add("carousel__slides--active");
  cloneSlides(-slidesToShow, slidesContainer.childElementCount);
  updateSlides();
  updateSlideActivation();
});
