document.addEventListener("DOMContentLoaded", () => {
  // Circle Graph
  const circles = Array.from(
    document.querySelectorAll(".shop-by-models__circle")
  );

  // Carousel
  const slidesContainer = document.querySelector(".carousel__slides");
  const prevButton = document.querySelector(".carousel__button--prev");
  const nextButton = document.querySelector(".carousel__button--next");

  // Progress Bar
  const currentProgressSpan = document.querySelector(
    ".progress__position--current"
  );

  // Data
  const initialChildren = slidesContainer.childElementCount;
  const slidesToShow = 2;
  const gap = parseInt(getComputedStyle(slidesContainer).gap);

  let currentIndex = 0;
  let isTransitioning = false;

  // Methods
  const cloneSlides = (start, end) => {
    const slides = Array.from(slidesContainer.children).slice(start, end);
    slides
      .reverse()
      .forEach((slide) => slidesContainer.prepend(slide.cloneNode(true)));
  };

  const updateSlides = () => {
    const slideWidth = slidesContainer.firstElementChild.clientWidth;
    const offset = (slideWidth + gap) * currentIndex;
    slidesContainer.style.transform = `translateX(${offset}px)`;

    const displayIndex = (currentIndex % initialChildren) + 1;
    currentProgressSpan.textContent = displayIndex;

    nextButton.disabled = currentIndex === 0;
    prevButton.disabled =
      currentIndex !== 0 && currentIndex % initialChildren === 0;

    if (prevButton.disabled) {
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
