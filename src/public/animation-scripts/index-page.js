document.addEventListener("DOMContentLoaded", () => {
    const { utils, stagger, animate, onScroll } = anime;

    const debug = false;

    const [$chatbot] = utils.$('#chatbot-scroll-target');
    const [$product] = utils.$('#product-scroll-target');
    const [$contact] = utils.$('#contact-scroll-target');

    animate("#main-cta-target h1, #main-cta-target h2, #main-cta-target h3, #main-cta-target #button-cta", {
        y: [-60, 0],
        opacity: [0, 1],
        duration: 1200,
        ease: 'outExpo',
        delay: stagger(500)
    });

    animate($chatbot, {
        scale: [0.8, 1],
        opacity: [0.7, 1],
        duration: 2000,
        ease: 'outQuad',
        autoplay: onScroll({
            target: $chatbot,
            sync: 0.4,
            debug
        })
    });

    animate($product, {
        scale: [0.8, 1],
        opacity: [0.7, 1],
        duration: 2000,
        ease: 'outQuad',
        autoplay: onScroll({
            target: $product,
            sync: 0.4,
            debug
        })
    });

    animate($contact, {
        scale: [0.8, 1],
        opacity: [0.7, 1],
        duration: 2000,
        ease: 'outQuad',
        autoplay: onScroll({
            target: $contact,
            sync: 0.4,
            debug
        })
    });
});