<script>
	import CostumInput from "../Components/CostumInput.svelte";
	import queryString from "query-string";
	import {navigate} from "svelte-routing";
	import { surveyService } from "../Services/SurveyService";
	import {navigateWithRefreshToken} from "../Utility/naviagte";

	export let surveyID;

	let validate = async () => {
		let code = document.getElementsByClassName("bigInput")[0].value;
		surveyID = code;
		navigate("/survey");
	}
</script>

<main>
	<div id="welcomeWrapper">
		<h1>Welcome</h1>
		<h2>If you are here to take judge a survey, please enter your access code into the field below and press "Start reviewing"</h2>
		<CostumInput onClickFunc={validate} fieldTitle="Your access code:" buttonTitle="Start reviewing"></CostumInput>
	</div>
	<!--
	<Card title="Yo" w="400px" h="400px" alt="Pillars of creation" img="https://www.nasa.gov/sites/default/files/styles/full_width_feature/public/thumbnails/image/pillars_of_creation.jpg"></Card>
	<Card title="Yo" w="400px" h="400px" alt="Førersete" img="https://toonclips.com/600/cartoon-guy-in-a-tireless-car-on-blocks-by-toonaday-538.jpg"></Card>
	-->
</main>


<style>
	main {
		text-align: center;
		background-color: #aaaaaa;
		margin:auto;
		display:grid;
	}
	#welcomeWrapper{
		top:0;
		background-image: url("https://i.pinimg.com/originals/63/7f/d0/637fd0330e2674544e549dbef188e993.jpg");
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