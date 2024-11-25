// script.js
const cards = document.querySelectorAll('.memory-card');
const resetButton = document.getElementById('reset-button'); // Reset-Button auswählen

let hasFlippedCard = false;
let firstCard, secondCard;
let lockBoard = false;

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
    // Alle Karten umdrehen, falls sie umgedreht sind
    cards.forEach(card => {
        card.classList.remove('flip');
        card.addEventListener('click', flipCard);
    });

    resetBoard();
    shuffle();
}

// Sofortige Kartenmischung beim Laden des Spiels
shuffle();

// Event Listener für jede Karte
cards.forEach(card => card.addEventListener('click', flipCard));

// Event Listener für den Reset-Button
resetButton.addEventListener('click', resetGame);
