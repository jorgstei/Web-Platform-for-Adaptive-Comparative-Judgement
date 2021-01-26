<script>
	import CostumInput from "./CostumInput.svelte";
	import queryString from "query-string";
	import {navigate} from "svelte-routing";

	export let studyTitle;
	let params = queryString.parse(window.location.search);
	let page_id = params.id;

	let validate = (id, actualCode) => {
		let code = document.getElementById(id);
		if(code == actualCode){

		}
		navigate("/quiz");
	}
</script>



<main>
	<div id="welcomeWrapper">
		<h1>Welcome</h1>
		<h2>You've been asked to participate in the judgement of "{studyTitle}"</h2>
		<CostumInput onClickFunc={validate} funcParams={params} fieldTitle="Your access code:" buttonTitle="Start reviewing"></CostumInput>
	</div>
	<!--
	<Card title="Yo" w="400px" h="400px" alt="Pillars of creation" img="https://www.nasa.gov/sites/default/files/styles/full_width_feature/public/thumbnails/image/pillars_of_creation.jpg"></Card>
	<Card title="Yo" w="400px" h="400px" alt="Førersete" img="https://toonclips.com/600/cartoon-guy-in-a-tireless-car-on-blocks-by-toonaday-538.jpg"></Card>
	-->
</main>


<style>
	main {
		text-align: center;
		max-width: 240px;
		background-color: #aaaaaa;
		margin:0;
		top:0;
        display:grid;
	}
	#welcomeWrapper{
		top:0;
		background-image: url("https://wallpaperaccess.com/full/1251284.jpg");
		width: 100vw;
        height: 100vh;
        background-size:100% 100%;
	}
	h1 {
		padding-top: 10vh;
		color: #000000;
		font-size: 3em;
		font-weight: 100;
	}
	h2 {
		color: #000000;
		font-size: 1.5em;
		font-weight: 100;
		margin-bottom: 15vh;
	}
	

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>