import App from './App.svelte';
import Landing_page from './Landing_page.svelte'
import LoginPage from './LoginPage.svelte'
import AboutProject from './AboutProject.svelte'

const app = new App({
	target: document.body,
	props: {
		studyTitle: "Eksamensoppgave 3b"
	}
});

export default app;