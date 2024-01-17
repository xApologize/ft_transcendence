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
    matchHistoryContainer.innerHTML = ''
    const matchHistory = await matchHistoryComponent();
    let index = 0;

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
        matchEntry.id = 'matchEntry' + index;

        matchHistoryContainer.appendChild(matchEntry);
        index++;
    });
}
