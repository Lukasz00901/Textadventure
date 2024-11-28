// HTML-Elemente auswählen
const cards = document.querySelectorAll('.memory-card');
const resetButton = document.getElementById('reset-button'); // Reset-Button auswählen
const timerDisplay = document.getElementById('timer'); // Timer-Anzeige auswählen

// Modal-Elemente auswählen
const modal = document.getElementById('custom-text-modal');
const closeButton = document.querySelector('.close-button');
const playAgainButton = document.getElementById('play-again-button');
const modalMessage = document.getElementById('modal-message');
const modalTitle = document.getElementById('modal-title');

let hasFlippedCard = false;
let firstCard, secondCard;
let lockBoard = false;
let timer; // Variable für den Timer
let timeLeft = 120; // 120 Sekunden

let matchedPairs = 0;
const totalPairs = cards.length / 2;

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

    if (isMatch) {
        disableCards();
        matchedPairs++;
        if (matchedPairs === totalPairs) {
            endGame('win');
        }
    } else {
        unflipCards();
    }
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
    matchedPairs = 0;
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
    timerDisplay.textContent = `Zeit: ${timeLeft}s`;

    timer = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = `Zeit: ${timeLeft}s`;

        if (timeLeft <= 0) {
            clearInterval(timer);
            endGame('time-up');
        }
    }, 1000);
}

// Funktion zum Beenden des Spiels
function endGame(reason) {
    clearInterval(timer);
    lockBoard = true; // Verhindert weitere Klicks

    let message;
    let title;

    if (reason === 'win') {
        title = 'Herzlichen Glückwunsch!';
        message = 'Du hast alle Paare gefunden.';
    } else if (reason === 'time-up') {
        title = 'Zeit abgelaufen!';
        message = 'Du hast nicht alle Paare gefunden.';
    }

    // Aktualisiere den Modal-Inhalt
    modalTitle.textContent = title;
    modalMessage.textContent = message;

    // Zeige das Modal an
    modal.style.display = 'block';
}

// Funktion zum Schließen des Modals
function closeModal() {
    modal.style.display = 'none';
    // Optional: Spiel zurücksetzen nach Schließen des Modals
    resetGame();
}

// Funktion zum erneuten Spielen
function playAgain() {
    closeModal();
}

// Event Listener für jede Karte
cards.forEach(card => card.addEventListener('click', flipCard));

// Event Listener für den Reset-Button
resetButton.addEventListener('click', resetGame);

// Event Listener für das Schließen des Modals über das "X"
closeButton.addEventListener('click', closeModal);

// Event Listener für den "Nochmal spielen"-Button
playAgainButton.addEventListener('click', playAgain);

// Optional: Modal schließen, wenn außerhalb des Modal-Inhalts geklickt wird
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        closeModal();
    }
});

// Sofortige Kartenmischung und Timer-Start beim Laden des Spiels
shuffle();
startTimer();
