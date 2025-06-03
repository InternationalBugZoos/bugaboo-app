// Wait for the entire HTML document to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', function() {
    // Get references to the different screen elements
    const welcomeScreen = document.getElementById('welcome-screen');
    const selectionScreen = document.getElementById('selection-screen');
    const quoteScreen = document.getElementById('quote-screen');

    // Get references to buttons and containers
    const startButton = document.getElementById('start-button');
    const bugabooOptionsContainer = document.getElementById('bugaboo-options-container');
    const scrambleButton = document.getElementById('scramble-button');
    const wisdomButton = document.getElementById('wisdom-button');
    const quotesContainer = document.getElementById('quotes-container');
    const backToWelcomeButton = document.getElementById('back-to-welcome-button');
    const startOverButton = document.getElementById('start-over-button');
    const shareToXButton = document.getElementById('share-to-x-button');

    // --- Sound Effects ---
    const wisdomRevealSound = new Audio('sounds/applause-105579.mp3');
    wisdomRevealSound.preload = 'auto';

    const randomQuoteSoundFiles = [
        'sounds/chime-sound-7143.mp3',
        'sounds/cricket-chirp-56209.mp3',
        'sounds/cricket-chirp-101026.mp3',
        'sounds/happy-humming-6202.mp3',
        'sounds/happy-noisesmp3-14568.mp3',
        'sounds/harp-flourish-6251.mp3',
        'sounds/oh-really-96805.mp3',
        'sounds/what-the-hell-86677.mp3',
        'sounds/woman-cute-silly-ya-3-185320.mp3'
    ];

    // Create Audio objects for random sounds
    const randomQuoteSounds = randomQuoteSoundFiles.map(src => {
        const audio = new Audio(src);
        audio.preload = 'auto';
        return audio;
    });

    let currentlyPlayingRandomSound = null; // Variable to keep track of the current random sound

    let selectedBugaboos = [];
    const MAX_SELECTIONS = 3;

    const APP_BASE_URL = window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);

    function displayBugabooOptions() {
        bugabooOptionsContainer.innerHTML = '';
        if (typeof bugabooInsights === 'undefined' || Object.keys(bugabooInsights).length === 0) {
            console.error("Bugaboo data (bugabooInsights) is not loaded or is empty!");
            bugabooOptionsContainer.innerHTML = "<p>Oops! Bugaboo data couldn't be loaded.</p>";
            return;
        }
        const allBugabooOrders = Object.keys(bugabooInsights);
        const shuffledOrders = allBugabooOrders.sort(() => 0.5 - Math.random());
        const subsetSize = 6;
        const selectedOrdersToDisplay = shuffledOrders.slice(0, subsetSize);

        selectedOrdersToDisplay.forEach(orderName => {
            const bugaboo = bugabooInsights[orderName];
            if (!bugaboo) {
                console.warn(`Data for ${orderName} not found.`);
                return;
            }
            const optionElement = document.createElement('div');
            optionElement.classList.add('bugaboo-option');
            optionElement.dataset.orderName = orderName;
            optionElement.innerHTML = `
                <img src="images/${orderName}.png" alt="${bugaboo.commonName || orderName}" class="bugaboo-image">
                <h4 class="bugaboo-name">${bugaboo.commonName || 'Unknown Bugaboo'}</h4>
                <p class="bugaboo-vibe">${bugaboo.vibe || 'Hover for vibe!'}</p>
            `;
            optionElement.addEventListener('click', function() {
                toggleSelection(optionElement, orderName);
            });
            if (selectedBugaboos.includes(orderName)) {
                optionElement.classList.add('selected');
            }
            bugabooOptionsContainer.appendChild(optionElement);
        });
        updateWisdomButtonState();
    }

    function toggleSelection(optionElement, orderName) {
        if (selectedBugaboos.includes(orderName)) {
            optionElement.classList.remove('selected');
            selectedBugaboos = selectedBugaboos.filter(name => name !== orderName);
        } else {
            if (selectedBugaboos.length < MAX_SELECTIONS) {
                optionElement.classList.add('selected');
                selectedBugaboos.push(orderName);
            } else {
                alert("You can only pick up to " + MAX_SELECTIONS + " Bugaboos!");
            }
        }
        updateWisdomButtonState();
    }

    function updateWisdomButtonState() {
        if (selectedBugaboos.length > 0 && selectedBugaboos.length <= MAX_SELECTIONS) {
            wisdomButton.disabled = false;
            wisdomButton.textContent = `Release the Bug-oracle wisdom! (${selectedBugaboos.length} selected)`;
        } else {
            wisdomButton.disabled = true;
            wisdomButton.textContent = 'Release the Bug-oracle wisdom!';
        }
    }

    function playRandomQuoteSound() {
        // If a random sound is already playing, stop it
        if (currentlyPlayingRandomSound && !currentlyPlayingRandomSound.paused) {
            currentlyPlayingRandomSound.pause();
            currentlyPlayingRandomSound.currentTime = 0;
        }

        if (randomQuoteSounds.length > 0) {
            const randomIndex = Math.floor(Math.random() * randomQuoteSounds.length);
            const soundToPlay = randomQuoteSounds[randomIndex];
            
            soundToPlay.currentTime = 0; // Ensure it plays from the start
            soundToPlay.play().catch(error => console.error("Error playing random quote sound:", error));
            currentlyPlayingRandomSound = soundToPlay; // Update the currently playing sound
        }
    }

    function displayQuotes() {
        quotesContainer.innerHTML = '';
        if (selectedBugaboos.length === 0) {
            quotesContainer.innerHTML = '<p>No Bugaboos selected. Go back and pick some!</p>';
            selectionScreen.style.display = 'none';
            quoteScreen.style.display = 'block';
            return;
        }

        wisdomRevealSound.currentTime = 0;
        wisdomRevealSound.play().catch(error => console.error("Error playing wisdom reveal sound:", error));

        selectedBugaboos.forEach(orderName => {
            const bugabooData = bugabooInsights[orderName];
            if (bugabooData && bugabooData.quotes && bugabooData.quotes.length > 0) {
                const randomIndex = Math.floor(Math.random() * bugabooData.quotes.length);
                const randomQuote = bugabooData.quotes[randomIndex];
                const quoteCard = document.createElement('div');
                quoteCard.classList.add('quote-card');
                quoteCard.innerHTML = `
                    <h3>${bugabooData.commonName || orderName} say:</h3>
                    <p>"${randomQuote}"</p>
                    <span class="quote-sound-icon">🔊</span>
                `;
                quotesContainer.appendChild(quoteCard);

                const soundIcon = quoteCard.querySelector('.quote-sound-icon');
                if (soundIcon) {
                    soundIcon.addEventListener('click', function(event) {
                        event.stopPropagation();
                        playRandomQuoteSound();
                    });
                }
            } else {
                console.warn(`Quote data missing for ${orderName}`);
                const errorCard = document.createElement('div');
                errorCard.classList.add('quote-card');
                errorCard.innerHTML = `<h3>${bugabooData.commonName || orderName} say:</h3><p>Hmm, this Bugaboo is feeling a bit quiet today!</p>`;
                quotesContainer.appendChild(errorCard);
            }
        });
        selectionScreen.style.display = 'none';
        quoteScreen.style.display = 'block';
    }

    function handleShareToX() {
        if (selectedBugaboos.length === 0) {
            alert("Select some Bugaboos first to share their wisdom!");
            return;
        }
        let shareText = "🔮 My Bugaboo Oracle revealed wisdom for: ";
        const bugNames = selectedBugaboos.map(orderName => bugabooInsights[orderName]?.commonName || orderName);
        shareText += bugNames.join(', ') + "! ";
        const firstBugabooData = bugabooInsights[selectedBugaboos[0]];
        if (firstBugabooData && firstBugabooData.quotes && firstBugabooData.quotes.length > 0) {
            let quoteSnippet = firstBugabooData.quotes[Math.floor(Math.random() * firstBugabooData.quotes.length)];
            if (quoteSnippet.length > 80) {
                quoteSnippet = quoteSnippet.substring(0, 80) + "...";
            }
            shareText += `It said, "${quoteSnippet}" ✨ `;
        }
        shareText += "What's your Bugaboo?";
        const parameterizedAppUrl = `${APP_BASE_URL}index.html?bugs=${encodeURIComponent(selectedBugaboos.join(','))}`;
        const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(parameterizedAppUrl)}`;
        window.open(tweetUrl, '_blank');
    }

    // --- Event Listeners ---
    if (startButton) {
        startButton.addEventListener('click', function() {
            welcomeScreen.style.display = 'none';
            selectionScreen.style.display = 'block';
            selectedBugaboos = [];
            displayBugabooOptions();
        });
    } else { console.error("Start button not found!"); }

    if (scrambleButton) {
        scrambleButton.addEventListener('click', function() {
            displayBugabooOptions();
        });
    } else { console.error("Scramble button not found!"); }

    if (wisdomButton) {
        wisdomButton.addEventListener('click', function() {
            if (!wisdomButton.disabled) {
                displayQuotes();
            }
        });
    } else { console.error("Wisdom button not found!"); }

    if (backToWelcomeButton) {
        backToWelcomeButton.addEventListener('click', function() {
            selectionScreen.style.display = 'none';
            welcomeScreen.style.display = 'block';
            selectedBugaboos = [];
            updateWisdomButtonState();
        });
    } else { console.error("Back to welcome button not found on selection screen!"); }

    if (startOverButton) {
        startOverButton.addEventListener('click', function() {
            quoteScreen.style.display = 'none';
            welcomeScreen.style.display = 'block';
            selectedBugaboos = [];
            updateWisdomButtonState();
        });
    } else { console.error("Start over button not found on quote screen!"); }

    if (shareToXButton) {
        shareToXButton.addEventListener('click', handleShareToX);
    } else { console.error("Share to X button not found!"); }
});