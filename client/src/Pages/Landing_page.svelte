<script>
	import CostumInput from "../Components/CostumInput.svelte";
	import {navigate} from "svelte-routing";
	import { surveyService } from "../Services/SurveyService";
	import { onDestroy, onMount } from "svelte";
	import swal from "sweetalert";

	export let surveyID;
	export let selectedNavbarListValue;

	let validate = async () => {
		let code = document.getElementsByClassName("bigInput")[0].value;
		if(code.length === 6){
			let codeCheck = await surveyService.getPinIsValid(code);
			if(codeCheck.status == 200){
				console.log("Code is valid")
				surveyID = code;
				navigate("/survey");
			}
			else if(codeCheck.status == 500){
				swal(
					"Could not reach server.",
					"We could not contact the server. Please try again, or contact an administrator if the problem persists.",
					"error"
				)
			}
			else{
				swal(
					"Code is not valid.",
					"We could not find a survey that matches that code.\nPlease double check that you entered the right one.",
					"warning"
				)
			}
		}
		else{
			swal(
				"Error in user input.",
				"Codes must be 6 characters long.",
				"error"
			)
		}
	}
	onMount(()=>{
        document.getElementsByTagName("body")[0].style.overflowY = "hidden";
		document.getElementsByTagName("body")[0].style.overflowX = "hidden";
		selectedNavbarListValue = "Home";
    })
    onDestroy(()=>{
        document.getElementsByTagName("body")[0].style.overflowY = "scroll";
		document.getElementsByTagName("body")[0].style.overflowX = "scroll";
    })
	$:selectedNavbarListValue;
</script>

<main>
	<div id="welcomeWrapper">
		<div id="welcome-text">
			<h1>Welcome</h1>
			<h2>If you are here to take a survey,<br/>please enter your PIN code in the field below and press "Start reviewing"</h2>
		</div>
		<CostumInput onClickFunc={validate} fieldTitle="Your PIN code:" buttonTitle="Start reviewing"></CostumInput>
	</div>
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
		background-image: url("/img/triangles1.png");
		width: 100vw;
        height: 100vh;
        background-size:100% 100%;
	}
	#welcome-text {
		color: white
	}
	h1 {
		padding-top: 10vh;
		font-size: 3em;
		font-weight: 100;
	}
	h2 {
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