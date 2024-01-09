/**
 * Setup
 */
const debugEl = document.getElementById('debug');
const iconMap = ["banana", "seven", "cherry", "plum", "orange", "bell", "bar", "lemon", "melon"];
const icon_width = 79;
const icon_height = 79;
const num_icons = 9;
const time_per_icon = 100;
let indexes = [0, 0, 0];



const resetAll = () => {
    document.getElementById("spinner").classList.add("disabled-style");
    document.getElementById("submitter").classList.remove("disabled-style");
    document.getElementById("bet").value = "";
    document.getElementById("deposit").value = "";

    const cols = document.getElementsByClassName('reel');

    // Reset background position and animation for all reels
    Array.from(cols).forEach((reel) => {
        reel.style.backgroundPositionY = 0;
        reel.style.animation = 'none';
    });

    // Set indexes to bananas for all reels
    indexes.fill(0);
    debugEl.textContent = indexes.map((i) => iconMap[i]).join(' - ');
};

document.querySelector('#reseter').addEventListener('click', resetAll);

// Add transitionend listener for each reel
document.querySelectorAll('.reel').forEach((reel, i) => {
    reel.addEventListener('transitionend', () => {
        // After the animation, update the debug field
        debugEl.textContent = indexes.map((i) => iconMap[i]).join(' - ');
    }, { once: true });
});

const collectData = () => {
    const betInput = parseFloat(document.getElementById("bet").value);
    let deposit = parseInt(document.getElementById("deposit").value);
    deposit = betInput;
    document.getElementById("deposit").value = deposit;

    if (deposit < 0 || isNaN(betInput)) {
        return;
    }

    document.getElementById("spinner").classList.remove("disabled-style");
    document.getElementById("submitter").classList.add("disabled-style");
};

document.querySelector('#submitter').addEventListener('click', collectData);

/**
 * Roll one reel
 */
const roll = (reel, offset = 0) => {
    const delta = (offset + 2) * num_icons + Math.round(Math.random() * num_icons);

    return new Promise((resolve, reject) => {
        const style = getComputedStyle(reel);
        const backgroundPositionY = parseFloat(style["background-position-y"]);
        const targetBackgroundPositionY = backgroundPositionY + delta * icon_height;
        const normTargetBackgroundPositionY = targetBackgroundPositionY % (num_icons * icon_height);

        setTimeout(() => {
            reel.style.transition = `background-position-y ${(8 + 1 * delta) * time_per_icon}ms cubic-bezier(.41,-0.01,.63,1.09)`;
            reel.style.backgroundPositionY = `${backgroundPositionY + delta * icon_height}px`;
        }, offset * 150);

        setTimeout(() => {
            reel.style.transition = `none`;
            reel.style.backgroundPositionY = `${normTargetBackgroundPositionY}px`;
            resolve(delta % num_icons);
        }, (8 + 1 * delta) * time_per_icon + offset * 150);
    });
};

/**
 * Roll all reels, calculate scores, and update deposit
 */
function rollAll() {
    money = parseFloat(document.getElementById("deposit").value);

    debugEl.textContent = 'rolling...';

    const reelsList = document.querySelectorAll('.slots > .reel');

    Promise
        // Activate each reel
        .all([...reelsList].map((reel, i) => roll(reel, i)))

        // When all reels done animating (all promises solve)
        .then((deltas) => {
            // add up indexes
            deltas.forEach((delta, i) => indexes[i] = (indexes[i] + delta) % num_icons);
            debugEl.textContent = indexes.map((i) => iconMap[i]).join(' - ');

            // Calculate and add scores to deposit
            calculateScore();

            // Optionally, you can add additional logic or actions after scores are calculated.
            if (parseFloat(document.getElementById("deposit").value) <= 0) {
                document.getElementById("spinner").style.visibility = "hidden";
                document.getElementById("submitter").style.visibility = "visible";
            }

            // Win lights
            function startLightsFlashing() {
                const slots = document.querySelector('.slots');
                slots.classList.add('win1');
            
                const animationDuration = 1500;
                setTimeout(() => {
                    slots.classList.remove('win1');
                }, animationDuration);
            }
            
            if (indexes[0] === indexes[1] || indexes[1] === indexes[2] || indexes[0] === indexes[2] || (indexes[0] === indexes[1] && indexes[1] === indexes[2])) {
                startLightsFlashing();
            }
        });
}

/**
 * Calculate and add scores to deposit
 */
const calculateScore = () => {
    const scoreMap = [6, 5, 4, 3, 2, 1, 9, 8, 7];

    if (indexes[0] === indexes[1] && indexes[1] === indexes[2]) {
        const points = 2 * (scoreMap[indexes[0]] + scoreMap[indexes[1]] + scoreMap[indexes[2]]);
        document.getElementById("deposit").value = parseFloat(document.getElementById("deposit").value) + points;
        updatePointsDisplay(points);
    } else if (indexes[0] === indexes[1] || indexes[1] === indexes[2]) {
        const points = 2 * scoreMap[indexes[1]];
        document.getElementById("deposit").value = parseFloat(document.getElementById("deposit").value) + points;
        updatePointsDisplay(points);
    } else if (indexes[0] === indexes[2]) {
        const points = (2 * scoreMap[indexes[0]] - 1);
        document.getElementById("deposit").value = parseFloat(document.getElementById("deposit").value) + points;
        updatePointsDisplay(points);
    } else {
        const points = -5;
        document.getElementById("deposit").value = parseFloat(document.getElementById("deposit").value) - 5;
        updatePointsDisplay(points);
    }
};

/**
 * Update the points display
 */
const updatePointsDisplay = (points) => {
    const pointsDisplay = document.getElementById("pointsDisplay");
    pointsDisplay.textContent = `Prev. score: ${points}`;
};

document.querySelector('#spinner').addEventListener('click', rollAll);
document.getElementById("spinner").classList.remove("disabled-style");

