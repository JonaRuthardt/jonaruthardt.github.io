window.HELP_IMPROVE_VIDEOJS = false;

function initSteerabilityDemo() {
    var root = document.getElementById('steer-knob-demo');
    if (!root) {
        return;
    }

    var baseSelect = document.getElementById('steer-demo-base-select');
    var promptSelect = document.getElementById('steer-demo-prompt-select');
    var slider = document.getElementById('steer-demo-slider');
    var value = document.getElementById('steer-demo-slider-value');
    var frameImage = document.getElementById('steer-demo-frame-image');
    var leftEndpoint = document.getElementById('steer-demo-endpoint-left');
    var rightEndpoint = document.getElementById('steer-demo-endpoint-right');

    var demoConfig = {
        baseImages: [
            {
                id: 'Kitchen',
                label: 'Kitchen',
                prompts: [
                    { id: 'curtain', label: 'curtain' },
                    { id: 'lamp', label: 'lamp' },
                    { id: 'pan', label: 'pan' }
                ]
            },
            {
                id: 'Room',
                label: 'Room',
                prompts: [
                    { id: 'cat', label: 'cat' },
                    { id: 'remote_control', label: 'remote control' },
                    { id: 'shelf_full_of_books', label: 'shelf full of books' }
                ]
            },
            {
                id: 'Skiing',
                label: 'Skiing',
                prompts: [
                    { id: 'left_person', label: 'left person' },
                    { id: 'mountains', label: 'mountains' },
                    { id: 'snowboard', label: 'snowboard' }
                ]
            },
            {
                id: 'Street',
                label: 'Street',
                prompts: [
                    { id: 'car', label: 'car' },
                    { id: 'orange', label: 'orange' },
                    { id: 'tree', label: 'tree' }
                ]
            }
        ]
    };

    function createOption(item) {
        var option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.label;
        return option;
    }

    demoConfig.baseImages.forEach(function(item) {
        baseSelect.appendChild(createOption(item));
    });

    function getSelectedBase() {
        return demoConfig.baseImages.find(function(item) {
            return item.id === baseSelect.value;
        }) || demoConfig.baseImages[0];
    }

    function populatePromptOptions(base, selectedPromptId) {
        promptSelect.innerHTML = '';
        base.prompts.forEach(function(item) {
            promptSelect.appendChild(createOption(item));
        });

        var preferredPromptId = selectedPromptId || (base.prompts[0] && base.prompts[0].id);
        var matchingPrompt = base.prompts.find(function(item) {
            return item.id === preferredPromptId;
        });
        promptSelect.value = matchingPrompt ? matchingPrompt.id : base.prompts[0].id;
    }

    function getSelectedPrompt() {
        return getSelectedBase().prompts.find(function(item) {
            return item.id === promptSelect.value;
        }) || getSelectedBase().prompts[0];
    }

    function getFactorLabel() {
        return (Number(slider.value) / 10).toFixed(1);
    }

    function getImagePath(baseId, promptId, factorLabel) {
        return 'static/demo/gate_steering/' + baseId + '/' + promptId + '+' + factorLabel.replace('.', 'p') + '.jpg';
    }

    function updateEndpoints() {
        var factor = Number(slider.value);
        var leftStrength = (10 - factor) / 10;
        var rightStrength = factor / 10;

        leftEndpoint.classList.toggle('is-active', factor <= 2);
        rightEndpoint.classList.toggle('is-active', factor >= 8);
        leftEndpoint.classList.toggle('steer-demo__endpoint--soft', factor > 2 && factor < 8);
        rightEndpoint.classList.toggle('steer-demo__endpoint--soft', factor > 2 && factor < 8);
        leftEndpoint.style.opacity = String(0.35 + leftStrength * 0.65);
        rightEndpoint.style.opacity = String(0.35 + rightStrength * 0.65);
    }

    function updateDemo() {
        var base = getSelectedBase();
        var prompt = getSelectedPrompt();
        var factorLabel = getFactorLabel();
        var imagePath = getImagePath(base.id, prompt.id, factorLabel);

        value.textContent = factorLabel;
        updateEndpoints();
        frameImage.alt = base.label + ' example with prompt "' + prompt.label + '" at steering factor ' + factorLabel;
        frameImage.onerror = null;
        frameImage.src = imagePath;
    }

    baseSelect.addEventListener('change', function() {
        populatePromptOptions(getSelectedBase());
        updateDemo();
    });
    baseSelect.value = demoConfig.baseImages[0].id;
    populatePromptOptions(getSelectedBase());

    promptSelect.addEventListener('change', updateDemo);
    slider.addEventListener('input', updateDemo);
    leftEndpoint.addEventListener('click', function() {
        slider.value = 0;
        updateDemo();
    });
    rightEndpoint.addEventListener('click', function() {
        slider.value = 10;
        updateDemo();
    });

    updateDemo();
}

$(document).ready(function() {
    // Check for click events on the navbar burger icon

    var options = {
			slidesToScroll: 1,
			slidesToShow: 1,
			loop: true,
			infinite: true,
			autoplay: true,
			autoplaySpeed: 5000,
    }

		// Initialize all div with carousel class
    var carousels = bulmaCarousel.attach('.carousel', options);
	
    bulmaSlider.attach();
    initSteerabilityDemo();

})
