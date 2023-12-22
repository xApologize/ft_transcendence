import { loadHTMLComponent } from '../../api/fetchData.js';

export async function matchHistoryComponent() {
    try {
        const matchHistoryTemplate = await loadHTMLComponent(
            './js/components/matchHistory/matchHistory.html'
        );
        return matchHistoryTemplate;
    } catch (error) {
        console.error('Error fetching matchHistory:', error);
    }
}

export async function displayMatchHistory(userStatJson) {
    const matchHistoryContainer = document.getElementById('matchHistory');
    const matchHistory = await matchHistoryComponent();

    userStatJson.played_matches.forEach((matches) => {
        const matchEntry = matchHistory.cloneNode(true);

        matchEntry.querySelector('#date').textContent = matches.date_of_match;
        matchEntry.querySelector('#winner').textContent =
            matches.winner_username;
        matchEntry.querySelector('#winnerScore').textContent =
            matches.winner_score;
        matchEntry.querySelector('#loser').textContent = matches.loser_username;
        matchEntry.querySelector('#loserScore').textContent =
            matches.loser_score;
        matchEntry.classList.add('hover-row-accent');

        matchHistoryContainer.appendChild(matchEntry);
    });
    // let matchHistoryContainer = document.getElementById('matchHistory');

    // let date = document.getElementById('date');
    // let matchHistoryWinner = document.getElementById('winnerUsername');
    // let matchHistoryLoser = document.getElementById('loserUsername');
    // let matchHistoryWinScore = document.getElementById('winnerScore');
    // let matchHistoryLoseScore = document.getElementById('loserScore');

    // userStatJson.played_matches.forEach((game) => {
    //     const listElement = document.createElement('li');
    //     listElement.classList.add('bg-main-second');
    //     listElement.classList.add('list-group-item');
    //     listElement.classList.add('list-group-item-action');
    //     listElement.classList.add('bg-transparent');
    //     listElement.classList.add('border-0');
    //     listElement.classList.add('textWhite');
    //     listElement.innerHTML = game.date_of_match;
    //     date.appendChild(listElement);
    // });
    // userStatJson.played_matches.forEach((game) => {
    //     const listElement = document.createElement('li');
    //     listElement.classList.add('bg-main-second');
    //     listElement.classList.add('list-group-item');
    //     listElement.classList.add('bg-transparent');
    //     listElement.classList.add('border-0');
    //     listElement.classList.add('textWhite');
    //     listElement.innerHTML = game.winner_username;
    //     matchHistoryWinner.appendChild(listElement);
    // });
    // userStatJson.played_matches.forEach((game) => {
    //     const listElement = document.createElement('li');
    //     listElement.classList.add('bg-main-second');
    //     listElement.classList.add('list-group-item');
    //     listElement.classList.add('bg-transparent');
    //     listElement.classList.add('border-0');
    //     listElement.classList.add('textWhite');
    //     listElement.innerHTML = game.winner_score;
    //     matchHistoryWinScore.appendChild(listElement);
    // });
    // userStatJson.played_matches.forEach((game) => {
    //     const listElement = document.createElement('li');
    //     listElement.classList.add('bg-main-second');
    //     listElement.classList.add('list-group-item');
    //     listElement.classList.add('bg-transparent');
    //     listElement.classList.add('border-0');
    //     listElement.classList.add('textWhite');
    //     listElement.innerHTML = game.loser_username;
    //     matchHistoryLoser.appendChild(listElement);
    // });
    // userStatJson.played_matches.forEach((game) => {
    //     const listElement = document.createElement('li');
    //     listElement.classList.add('bg-main-second');
    //     listElement.classList.add('list-group-item');
    //     listElement.classList.add('bg-transparent');
    //     listElement.classList.add('border-0');
    //     listElement.classList.add('textWhite');
    //     listElement.innerHTML = game.loser_score;
    //     matchHistoryLoseScore.appendChild(listElement);
    // });
}
