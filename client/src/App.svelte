<script>
	import Footer from "./Footer.svelte";
	import Navbar from "./Navbar.svelte";
	import Quiz from "./Quiz.svelte";
	import { Router, Route } from "svelte-routing";
	import LoginFields from "./LoginFields.svelte"
	import LandingPage from "./Landing_page.svelte";
	import AboutProject from "./AboutProject.svelte";
	import CreateQuiz from "./CreateQuiz.svelte";
	
	export let url=""
</script>

<Router url={url}>
	<Navbar></Navbar>

	<Route path="/">
		<LandingPage></LandingPage>
	</Route>

	<Route path="register">
		<LoginFields newUser=true></LoginFields>
	</Route>

	<Route path="login">
		<LoginFields newUser=false></LoginFields>
	</Route>

	<Route path="quiz">
		<Quiz></Quiz>
	</Route>

	<Route path="create_quiz">
		<CreateQuiz></CreateQuiz>
	</Route>

	<Route path="about">
		<AboutProject></AboutProject>
	</Route>

	<Footer></Footer>
</Router>



<style>
</style>