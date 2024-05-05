// animations.js
const fadeIn = (element) => {
    element.style.opacity = 0;
    const tick = () => {
        element.style.opacity = +element.style.opacity + 0.01;

        if (+element.style.opacity < 1) {
            (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16);
        }
    };
    tick();
}

const slideIn = (element) => {
    // Animation logic for sliding in element
}

const animateOnScroll = (element) => {
    // Animation logic for triggering animations when element comes into view
}
