/**
 * Utilities for noUiSlider sliders, to make all the slider of the site consistent
 */

/**
 * Make pips clickable, for each slider with class 'noUi-clickable-pips'
 */
const clickablePipsSliders = document.querySelectorAll('.noUi-target.noUi-clickable-pips');
clickablePipsSliders.forEach((slider) => {
    const sliderNUS = slider.noUiSlider;
    const pips = slider.querySelectorAll('.noUi-value');

    function clickOnPip() {
        const value = Number(this.getAttribute('data-value'));
        sliderNUS.set(value);
    }

    pips.forEach((pip) => {
        pip.style.cursor = 'pointer';
        pip.addEventListener('click', clickOnPip);
    });
});

/**
 * For each slider with class 'noUi-active-pips', add an 'active-pip' class to the active pip
 */
const activePipsSliders = document.querySelectorAll('.noUi-target.noUi-active-pips');
activePipsSliders.forEach((slider) => {
    const sliderNUS = slider.noUiSlider;
    const handlesNumber = sliderNUS.options.start.length;

    // save the active pips (to be able to recall them when we have to remove the 'active-pip' class
    const activePips = Array(handlesNumber);

    sliderNUS.on('update', function (values, handle) {
        // Remove the active class from the current pip
        if (activePips[handle]) {
            activePips[handle].classList.remove('active-pip');
        }

        // Match the formatting for the pip
        const dataValue = Math.round(values[handle]);

        // Find the pip matching the value
        activePips[handle] = slider.querySelector(`.noUi-value[data-value="${dataValue}"]`);

        // Add the active class
        if (activePips[handle]) {
            activePips[handle].classList.add('active-pip');
        }
    });
});


