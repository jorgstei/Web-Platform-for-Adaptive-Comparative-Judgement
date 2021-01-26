import App from './App.svelte';
import Landing_page from './Landing_page.svelte'
import LoginPage from './LoginPage.svelte'
import ComparisonObjectServiceTest from "./ComparisonObjectServiceTest.svelte"

const app = new ComparisonObjectServiceTest({
	target: document.body,
	props: {
		studyTitle: "Eksamensoppgave 3b"
	}
});

export default app;