// Constants
const toonDB = 'http://localhost:4000/toons';

// State
let addToon = false;

// DOM Elements
const addBtn = document.querySelector("#new-toon-btn");
const toonFormContainer = document.querySelector(".container");
const toonCollection = document.getElementById('toon-collection');
const logoHome = document.getElementById('logo');
const cnButton = document.getElementById('cartoon-network');
const nickelodeonButton = document.getElementById('nickelodeon');
const disneyButton = document.getElementById('disney');
const otherButton = document.getElementById('other');

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  addBtn.addEventListener("click", toggleToonForm);
  fetchToons();
});

logoHome.addEventListener('click', returnToLeaderboard);
cnButton.addEventListener('click', () => filterToonsByNetwork("Cartoon Network"));
nickelodeonButton.addEventListener('click', () => filterToonsByNetwork("Nickelodeon"));
disneyButton.addEventListener('click', () => filterToonsByNetwork("Disney"));
otherButton.addEventListener('click', () => filterToonsByNetwork("Other"));

// Functions
function toggleToonForm() {
  addToon = !addToon;
  if (addToon) {
    toonFormContainer.style.display = "block";
    document.querySelector('.add-toon-form').addEventListener('submit', handleToonFormSubmit);
  } else {
    toonFormContainer.style.display = "none";
  }
}

function handleToonFormSubmit(e) {
  e.preventDefault();
  const newName = e.target.name.value;
  const newImg = e.target.image.value;
  const newNetwork = e.target.network.value;
  document.querySelector('.add-toon-form').reset();

  fetch(toonDB, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      "title": newName,
      "network": newNetwork,
      "image": newImg,
      "likes": 0
    })
  })
    .then(r => r.json());
}

function fetchToons() {
  fetch(toonDB)
    .then(r => r.json())
    .then(toons => {
      toons.sort((a, b) => b.likes - a.likes);
      const top3Toons = toons.slice(0, 3);
      top3Toons.forEach(renderCard);
    });
}

function renderCard(toon) {
  const cardDiv = document.createElement('div');
  cardDiv.className = 'card';
  cardDiv.setAttribute('data-toon-id', toon.id);

  const toonName = document.createElement('h2');
  toonName.textContent = toon['title'];

  const img = document.createElement('img');
  img.src = toon['image'];
  img.className = 'cardImg';

  const likeCount = document.createElement('p');
  likeCount.textContent = "Total Votes  " + toon['likes'];

  const buttonsContainer = document.createElement('div');
  buttonsContainer.className = 'buttons-container';

  const likesButton = createButton("+", 'like-btn', () => handleVoteButtonClick(toon, 1));
  const spaceBetweenButtons = document.createTextNode('\u00A0\u00A0'); // Non-breaking space
  const dislikeButton = createButton("-", 'dislike-btn', () => handleVoteButtonClick(toon, -1));

  const deleteButton = createButton("Delete", 'delete-btn', () => deleteToon(toon.id));
  deleteButton.style.backgroundColor = 'red'; // Set background color to red

  buttonsContainer.append(likesButton, spaceBetweenButtons, dislikeButton);
  cardDiv.append(toonName, img, likeCount, buttonsContainer, deleteButton);
  toonCollection.append(cardDiv);
}

function createButton(text, className, clickHandler) {
  const button = document.createElement('button');
  button.textContent = text;
  button.className = className;
  button.addEventListener('click', clickHandler);
  return button;
}

function handleVoteButtonClick(toon, voteValue) {
  toon['likes'] += voteValue;
  fetch(`${toonDB}/${toon.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify(toon)
  })
    .then(r => r.json())
    .then(() => renderCard(toon)); // Update like count on the card
}

function deleteToon(toonId) {
  fetch(`${toonDB}/${toonId}`, {
    method: 'DELETE',
  })
    .then(response => {
      if (response.ok) {
        const cardToRemove = document.querySelector(`.card[data-toon-id="${toonId}"]`);
        if (cardToRemove) {
          cardToRemove.remove();
        }
      } else {
        console.error('Error deleting toon:', response.statusText);
      }
    })
    .catch(error => {
      console.error('Error deleting toon:', error.message);
    });
}

function returnToLeaderboard() {
  toonCollection.innerHTML = '';
  fetchToons();
}

function filterToonsByNetwork(network) {
  toonCollection.innerHTML = '';
  fetch(toonDB)
    .then(r => r.json())
    .then(toons => {
      const filteredToons = toons.filter(toon => toon.network === network);
      filteredToons.forEach(renderCard);
    });
}
