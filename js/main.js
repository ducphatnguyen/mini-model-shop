document.addEventListener("DOMContentLoaded", () => {
  // Get elements
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

  // Utility functions
  const fade = (element, duration, fadeIn = true) => {
    const steps = duration / 100;
    const deltaOpacity = 1 / steps;
    let opacity = fadeIn ? 0 : 1;

    const updateOpacity = () => {
      opacity += fadeIn ? deltaOpacity : -deltaOpacity;
      // Bug
      element.style.opacity = Math.max(0, Math.min(1, opacity));

      if ((fadeIn && opacity < 1) || (!fadeIn && opacity > 0)) {
        setTimeout(updateOpacity, 100);
      }
    };

    updateOpacity();
  };

  const cloneSlides = (start, end) => {
    const slides = Array.from(slidesContainer.children).slice(start, end);
    slides
      .reverse()
      .forEach((slide) => slidesContainer.prepend(slide.cloneNode(true)));
  };

  const removeClonedSlides = () => {
    const slidesToRemove = Array.from(slidesContainer.children).slice(
      -initialChildren
    );
    slidesToRemove.forEach((slide) => slidesContainer.removeChild(slide));
  };

  const updateProgressBar = (displayIndex) => {
    fade(currentProgressSpan, 100);
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
      cloneSlides(0, slidesContainer.childElementCount - slidesToShow);
      setTimeout(() => {
        removeClonedSlides();
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

  const updateProgressStyles = (direction) => {
    if (currentIndex % initialChildren === initialChildren - 1) {
      currentProgressSpan.classList.add("progress__position-current--max");
      fade(totalProgressSpan, 200);
      fade(previousProgressSpan, 500, false);
    } else if (
      direction === 1 &&
      currentIndex &&
      currentIndex % initialChildren === 0 
    ) {
      totalProgressSpan.classList.add("progress__position-total--min");
      fade(currentProgressSpan, 500);
      previousProgressSpan.textContent = initialChildren;
      previousProgressSpan.classList.add("progress__position-previous--min");
      fade(previousProgressSpan, 500);
      fade(previousProgressSpan, 500, false);
    } else {
      previousProgressSpan.classList.remove("progress__position-previous--min");
      currentProgressSpan.classList.remove("progress__position-current--max");
      totalProgressSpan.classList.remove("progress__position-total--min");
      fade(previousProgressSpan, 500, false);
    }
  };

  const updateSlides = (direction) => {
    const slideWidth = slidesContainer.firstElementChild.clientWidth;
    const offset = (slideWidth + gap) * currentIndex;
    slidesContainer.style.transform = `translateX(${offset}px)`;

    const displayIndex = (currentIndex % initialChildren) + 1;

    updateProgressBar(displayIndex);
    handleButtonStates();
    updateProgressStyles(direction);
  };

  const updateCircleGraph = (direction) => {
    const currentActiveIndex = circles.findIndex((circle) =>
      circle.classList.contains("shop-by-models__circle--active")
    );

    if (currentActiveIndex !== -1) {
      fade(circles[currentActiveIndex], 500, false);

      setTimeout(() => {
        circles[currentActiveIndex].classList.remove(
          "shop-by-models__circle--active"
        );
      }, 500);

      const nextActiveIndex =
        (currentActiveIndex + direction + circles.length) % circles.length;

      circles[nextActiveIndex].style.opacity = 1;
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
      updateSlides(direction);
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
  updateSlides(1); // Initialize with direction 1
  updateSlideActivation();
});
