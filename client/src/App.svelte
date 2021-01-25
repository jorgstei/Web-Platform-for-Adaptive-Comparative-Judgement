<script>
	import Card from "./Card.svelte";
	import CostumInput from "./CostumInput.svelte";
import Footer from "./Footer.svelte";
	import GridContainer from "./GridContainer.svelte";
	import Navbar from "./Navbar.svelte";
import Quiz from "./Quiz.svelte";
	export let studyTitle;
	let points = 100;
	let showControls = true;
	const addPoint = () => {points +=1}
	const removePoint = () => {points -=1}
	const toggleControls = () => {
		let btn = document.getElementById("toggle");
		if(btn.innerHTML == "Hide"){
			showControls = false;
			btn.innerHTML = "Show";
		}
		else{
			console.log("Changing")
			btn.innerHTML = "Hide";
			showControls = true;
		}
	}
	let validate = (id, actualCode) => {
		let code = document.getElementById(id);
		if(code == actualCode){

		}
	}
	let params = []
</script>
<Navbar></Navbar>
<Quiz></Quiz>
<Footer></Footer>
<!--
<main>
	
	<div id="welcomeWrapper">
		<h1>Welcome</h1>
		<h2>You've been asked to participate in the judgement of "{studyTitle}"</h2>
	<CostumInput onClickFunc={validate} funcParams={params} fieldTitle="Your access code:" buttonTitle="Start reviewing"></CostumInput>
	
	</div>
	
	<h2>You have {points} points!</h2>
	{#if showControls}
		<button on:click={addPoint}>+1</button>
		<button on:click={removePoint}>-1</button>
		<br>
	{/if}
	<button id="toggle" on:click={toggleControls}>Hide</button>
	<Card title="Yo" w="400px" h="400px" alt="Pillars of creation" img="https://www.nasa.gov/sites/default/files/styles/full_width_feature/public/thumbnails/image/pillars_of_creation.jpg"></Card>
	<Card title="Yo" w="400px" h="400px" alt="Førersete" img="https://toonclips.com/600/cartoon-guy-in-a-tireless-car-on-blocks-by-toonaday-538.jpg"></Card>
	
</main>
-->

<style>
	main {
		text-align: center;
		max-width: 240px;
		background-color: #aaaaaa;
		margin:0;
		top:0;
	}
	#welcomeWrapper{
		margin:0;
		background-image: url("https://wallpaperaccess.com/full/1251284.jpg");
		width: 100%;
		height: 100vh;
        background-size:100% 100%;
	}
	h1 {
		padding-top: 10vh;
		color: #000000;
		font-size: 4em;
		font-weight: 100;
	}
	h2 {
		color: #000000;
		font-size: 3em;
		font-weight: 100;
		margin-bottom: 15vh;
	}
	

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>