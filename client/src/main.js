import App from './Pages/App.svelte';
import Landing_page from './Pages/Landing_page.svelte'
import LoginPage from './Pages/LoginPage.svelte'
import AboutProject from './Pages/AboutProject.svelte'

const app = new App({
	target: document.body,
	props: {
		studyTitle: "Eksamensoppgave 3b"
	}
});

export default app;