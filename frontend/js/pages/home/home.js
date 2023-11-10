import { fetchUser } from '../../api/fetchData.js';


// Function to show the home page content
export async function showHome() {
  try {
    // Fetch the content of home.html
    const response = await fetch('./js/pages/home/home.html');
    const html = await response.text();

    // Inject the HTML content into the contentContainer
    document.getElementById('contentContainer').innerHTML = html;

    // Add event listeners for the buttons within the loaded content
    document.getElementById('createUser').addEventListener('click', () => {
      // Perform actions related to creating a new user
      createUser();
    });

    document.getElementById('getUser').addEventListener('click', () => {
      // Perform actions related to getting a specific user
      fetchUser('GET', 'Dave')
    });

    document.getElementById('getUsers').addEventListener('click', () => {
      // Perform actions related to getting all users
      fetchUser('GET')
    });

    document.getElementById('reset').addEventListener('click', () => {
      // Perform actions related to resetting the page
      resetPage();
    });
  } catch (error) {
    console.error('Error fetching home.html:', error);
  }
}
