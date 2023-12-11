const toonDB = 'http://localhost:4000/toons';
let addToon = false;

document.addEventListener("DOMContentLoaded", () => {
  const addBtn = document.querySelector("#new-toon-btn");
  const toonFormContainer = document.querySelector(".container");

  addBtn.addEventListener("click", () => {
    addToon = !addToon;
    if (addToon) {
      toonFormContainer.style.display = "block";

      document.querySelector('.add-toon-form').addEventListener('submit', (e) => {
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
      });
    } else {
      toonFormContainer.style.display = "none";
    }
  });
});

fetch(toonDB)
  .then(r => r.json())
  .then(toons => {
    toons.sort((a, b) => b.likes - a.likes);
    const top3Toons = toons.slice(0, 3);
    top3Toons.forEach(toon => renderCard(toon));
  });

function renderCard(toon) {
  const toonCollection = document.getElementById('toon-collection');
  const cardDiv = document.createElement('div');
  cardDiv.className = 'card';
  cardDiv.setAttribute('data-toon-id', toon.id); // Added data-toon-id attribute

  const toonName = document.createElement('h2');
  toonName.textContent = toon['title'];

  const img = document.createElement('img');
  img.src = toon['image'];
  img.className = 'cardImg';

  const likeCount = document.createElement('p');
  likeCount.textContent = "Total Votes  " + toon['likes'];

  const buttonsContainer = document.createElement('div');
  buttonsContainer.className = 'buttons-container';

  const likesButton = document.createElement('button');
  likesButton.textContent = "+";
  likesButton.className = 'like-btn';
  likesButton.id = toon['likes'];

  const dislikeButton = document.createElement('button');
  dislikeButton.textContent = "-";
  dislikeButton.className = 'dislike-btn';

  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Delete';
  deleteButton.className = 'delete-btn';
  deleteButton.style.backgroundColor = 'red'; // Set background color to red
  
  buttonsContainer.append(likesButton, dislikeButton);
  cardDiv.append(toonName, img, likeCount, buttonsContainer, deleteButton);
  toonCollection.append(cardDiv);

  // Adding Like button functionality
  likesButton.addEventListener('click', () => {
    toon['likes'] = toon['likes'] + 1;
    fetch(`${toonDB}/${toon.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(toon)
    })
      .then(r => r.json())
      .then(() => likeCount.textContent = "Total Votes:  " + toon['likes']);
  });

  dislikeButton.addEventListener('click', () => {
    toon['likes'] = toon['likes'] - 1;
    fetch(`${toonDB}/${toon.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(toon)
    })
      .then(r => r.json())
      .then(() => likeCount.textContent = "Total Votes:  " + toon['likes']);
  });

  // Add event listener for delete button
  deleteButton.addEventListener('click', () => {
    deleteToon(toon.id);
  });
}

const logoHome = document.getElementById('logo');
const cnButton = document.getElementById('cartoon-network');
const nickelodeonButton = document.getElementById('nickelodeon');
const disneyButton = document.getElementById('disney');
const otherButton = document.getElementById('other');

logoHome.addEventListener('click', () => returnToLeaderboard());
cnButton.addEventListener('click', () => filterToonsByNetwork("Cartoon Network"));
nickelodeonButton.addEventListener('click', () => filterToonsByNetwork("Nickelodeon"));
disneyButton.addEventListener('click', () => filterToonsByNetwork("Disney"));
otherButton.addEventListener('click', () => filterToonsByNetwork("Other"));

function returnToLeaderboard(likes) {
  const toonCollection = document.getElementById('toon-collection');
  toonCollection.innerHTML = '';
  fetch(toonDB)
    .then(r => r.json())
    .then(toons => {
      toons.sort((a, b) => b.likes - a.likes);
      const top3Toons = toons.slice(0, 3);
      top3Toons.forEach(toon => renderCard(toon));
    });
}

function filterToonsByNetwork(network) {
  const toonCollection = document.getElementById('toon-collection');
  toonCollection.innerHTML = '';
  fetch(toonDB)
    .then(r => r.json())
    .then(toons => {
      const filteredToons = toons.filter(toon => toon.network === network);
      filteredToons.forEach(toon => renderCard(toon));
    });
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

