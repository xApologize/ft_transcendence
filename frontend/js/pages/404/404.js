
export async function show404() {
    try {
        const contentContainer = document.getElementById('contentContainer');
        if (!contentContainer) return;
        contentContainer.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-size: 2em;">404 Page not found</div>';
    } catch (error) {
        console.error('Error fetching 404.html:', error);
    }

}