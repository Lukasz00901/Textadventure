// HTML-Elemente
const cards = document.querySelectorAll('.memory-card');
const resetButton = document.getElementById('reset-button'); // Reset-Button auswählen
const timerDisplay = document.getElementById('timer'); // Timer-Anzeige auswählen (z. B. <div id="timer"></div>)

let hasFlippedCard = false;
let firstCard, secondCard;
let lockBoard = false;
let timer; // Variable für den Timer
let timeLeft = 120; // 120 Sekunden

// Funktion zum Umdrehen der Karten
function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;

    this.classList.add('flip');

    if (!hasFlippedCard) {
        hasFlippedCard = true;
        firstCard = this;
        return;
    }

    secondCard = this;
    checkForMatch();
}

// Funktion zur Überprüfung von Übereinstimmungen
function checkForMatch() {
    let isMatch = firstCard.dataset.framework === secondCard.dataset.framework;

    isMatch ? disableCards() : unflipCards();
}

// Funktion zum Deaktivieren gefundener Karten
function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);

    resetBoard();
}

// Funktion zum Umdrehen nicht übereinstimmender Karten
function unflipCards() {
    lockBoard = true;

    setTimeout(() => {
        firstCard.classList.remove('flip');
        secondCard.classList.remove('flip');

        resetBoard();
    }, 1500);
}

// Funktion zum Zurücksetzen des Spielzustands
function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

// Funktion zum Mischen der Karten
function shuffle() {
    cards.forEach(card => {
        let randomPos = Math.floor(Math.random() * cards.length);
        card.style.order = randomPos;
    });
}

// Funktion zum Zurücksetzen des Spiels
function resetGame() {
    // Timer zurücksetzen
    clearInterval(timer);
    timeLeft = 120;
    startTimer();

    // Alle Karten umdrehen, falls sie umgedreht sind
    cards.forEach(card => {
        card.classList.remove('flip');
        card.addEventListener('click', flipCard);
    });

    resetBoard();
    shuffle();
}

// Funktion zum Starten des Timers
function startTimer() {
    timerDisplay.textContent = `Time left: ${timeLeft}s`;

    timer = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = `Time left: ${timeLeft}s`;

        if (timeLeft <= 0) {
            clearInterval(timer);
            alert('Time is up! Resetting the game.');
            resetGame();
        }
    }, 1000);
}

// Sofortige Kartenmischung und Timer-Start beim Laden des Spiels
shuffle();
startTimer();

// Event Listener für jede Karte
cards.forEach(card => card.addEventListener('click', flipCard));

// Event Listener für den Reset-Button
resetButton.addEventListener('click', resetGame);
