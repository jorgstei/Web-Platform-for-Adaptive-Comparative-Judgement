import App from './App.svelte';
import Landing_page from './Landing_page.svelte'
import LoginPage from './LoginPage.svelte'

const app = new LoginPage({
	target: document.body,
	props: {
		studyTitle: "Eksamensoppgave 3b"
	}
});

export default app;