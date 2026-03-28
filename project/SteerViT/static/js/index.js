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

function initEmbeddingSpaceDemo() {
    var root = document.getElementById('embedding-space-demo');
    if (!root) {
        return;
    }

    var promptSelect = document.getElementById('embedding-space-prompt-select');
    var canvas = document.getElementById('embedding-space-canvas');
    var legend = document.getElementById('embedding-space-legend');
    var context = canvas.getContext('2d');

    var animationFrameId = null;
    var currentPoints = [];
    var targetPointsByPrompt = {};
    var prompts = [];
    var bounds = {
        minX: 0,
        maxX: 1,
        minY: 0,
        maxY: 1
    };

    function createOption(value) {
        var option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        return option;
    }

    function setCanvasSize() {
        var rect = canvas.getBoundingClientRect();
        var dpr = window.devicePixelRatio || 1;
        canvas.width = Math.round(rect.width * dpr);
        canvas.height = Math.round(rect.height * dpr);
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function easeInOutCubic(t) {
        return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function normalizePoint(point, width, height) {
        var padding = { top: 28, right: 30, bottom: 28, left: 30 };
        var usableWidth = width - padding.left - padding.right;
        var usableHeight = height - padding.top - padding.bottom;
        var normalizedX = (point.x - bounds.minX) / (bounds.maxX - bounds.minX || 1);
        var normalizedY = (point.y - bounds.minY) / (bounds.maxY - bounds.minY || 1);

        return {
            x: padding.left + normalizedX * usableWidth,
            y: height - padding.bottom - normalizedY * usableHeight
        };
    }

    function drawBackdrop(width, height) {
        context.clearRect(0, 0, width, height);
        context.save();
        context.strokeStyle = 'rgba(68, 96, 140, 0.10)';
        context.lineWidth = 1;

        for (var i = 1; i < 5; i += 1) {
            var x = (width / 5) * i;
            var y = (height / 5) * i;
            context.beginPath();
            context.moveTo(x, 18);
            context.lineTo(x, height - 18);
            context.stroke();
            context.beginPath();
            context.moveTo(18, y);
            context.lineTo(width - 18, y);
            context.stroke();
        }

        context.restore();
    }

    function render(points) {
        var width = canvas.getBoundingClientRect().width;
        var height = canvas.getBoundingClientRect().height;
        drawBackdrop(width, height);

        var emojiSize = Math.max(18, Math.min(30, width / 20));
        context.save();
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.font = emojiSize + 'px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';

        points.forEach(function(point) {
            var position = normalizePoint(point, width, height);
            context.save();
            context.shadowColor = 'rgba(17, 24, 39, 0.18)';
            context.shadowBlur = 10;
            context.fillText(point.emoji, position.x, position.y);
            context.restore();
        });

        context.restore();
    }

    function animateToPrompt(prompt) {
        var nextPoints = targetPointsByPrompt[prompt];
        if (!nextPoints) {
            return;
        }

        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }

        if (!currentPoints.length) {
            currentPoints = nextPoints.map(function(point) {
                return Object.assign({}, point);
            });
            render(currentPoints);
            return;
        }

        var startPointsById = {};
        currentPoints.forEach(function(point) {
            startPointsById[point.id] = point;
        });

        var startTime = null;

        function step(timestamp) {
            if (!startTime) {
                startTime = timestamp;
            }

            var progress = Math.min((timestamp - startTime) / 520, 1);
            var easedProgress = easeInOutCubic(progress);

            currentPoints = nextPoints.map(function(point) {
                var startPoint = startPointsById[point.id] || point;
                return {
                    id: point.id,
                    emoji: point.emoji,
                    x: startPoint.x + (point.x - startPoint.x) * easedProgress,
                    y: startPoint.y + (point.y - startPoint.y) * easedProgress
                };
            });

            render(currentPoints);

            if (progress < 1) {
                animationFrameId = requestAnimationFrame(step);
            }
        }

        animationFrameId = requestAnimationFrame(step);
    }

    function populateLegend(classOrder, emojiMap) {
        legend.innerHTML = '';
        classOrder.forEach(function(className) {
            var item = document.createElement('div');
            item.className = 'embedding-demo__legend-item';
            item.innerHTML =
                '<span class="embedding-demo__legend-emoji">' + (emojiMap[className] || '•') + '</span>' +
                '<span>' + className.replace(/_/g, ' ') + '</span>';
            legend.appendChild(item);
        });
    }

    Promise.all([
        fetch('static/demo/embedding_space/embedding_space.json').then(function(response) {
            return response.json();
        }),
        fetch('static/demo/embedding_space/class2emoji.json').then(function(response) {
            return response.json();
        })
    ]).then(function(results) {
        var embeddingSpace = results[0];
        var emojiMap = results[1];

        prompts = Object.keys(embeddingSpace);
        prompts.forEach(function(prompt) {
            promptSelect.appendChild(createOption(prompt));
        });

        var classOrder = Object.keys(embeddingSpace[prompts[0]]);
        populateLegend(classOrder, emojiMap);

        prompts.forEach(function(prompt) {
            var promptPoints = [];
            Object.keys(embeddingSpace[prompt]).forEach(function(className) {
                embeddingSpace[prompt][className].forEach(function(coordinates, index) {
                    promptPoints.push({
                        id: className + '-' + index,
                        emoji: emojiMap[className] || '•',
                        x: coordinates[0],
                        y: coordinates[1]
                    });

                    bounds.minX = Math.min(bounds.minX, coordinates[0]);
                    bounds.maxX = Math.max(bounds.maxX, coordinates[0]);
                    bounds.minY = Math.min(bounds.minY, coordinates[1]);
                    bounds.maxY = Math.max(bounds.maxY, coordinates[1]);
                });
            });

            targetPointsByPrompt[prompt] = promptPoints;
        });

        var marginX = (bounds.maxX - bounds.minX) * 0.08;
        var marginY = (bounds.maxY - bounds.minY) * 0.08;
        bounds.minX -= marginX;
        bounds.maxX += marginX;
        bounds.minY -= marginY;
        bounds.maxY += marginY;

        setCanvasSize();
        promptSelect.value = prompts[0];
        animateToPrompt(prompts[0]);

        promptSelect.addEventListener('change', function() {
            animateToPrompt(promptSelect.value);
        });

        window.addEventListener('resize', function() {
            setCanvasSize();
            render(currentPoints);
        });
    }).catch(function() {
        root.innerHTML = '<p class="embedding-demo__copy">The embedding demo could not be loaded.</p>';
    });
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
    initEmbeddingSpaceDemo();

})
