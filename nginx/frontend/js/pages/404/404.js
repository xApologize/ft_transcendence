export function show404() {
    const contentContainer = document.getElementById('contentContainer');
    contentContainer.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-size: 2em;">404 Page not found</div>';
}