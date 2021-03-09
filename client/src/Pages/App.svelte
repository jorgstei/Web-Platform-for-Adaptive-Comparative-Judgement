<script>
	import queryString from "query-string";
	import { SvelteToast } from '@zerodevx/svelte-toast'
	import {surveyService} from "../Services/SurveyService"
	import {userService} from "../Services/UserService"

	import Footer from "../Components/Footer.svelte";
	import Navbar from "../Components/Navbar.svelte";
	import Survey from "./Survey.svelte";
	import { Router, Route, navigate } from "svelte-routing";
	import LoginPage from "./LoginPage.svelte"
	import LandingPage from "./Landing_page.svelte";
	import AboutProject from "./AboutProject.svelte";
	import CreateSurvey from "./CreateSurvey.svelte";
	import UserServiceTest from "../test_pages/UserServiceTest.svelte"
	import AdminBoard from "./AdminBoard.svelte";
	import RegisterAccount from "./RegisterAccount.svelte";

	export let url="";
	let userInfo = null;

	let params = queryString.parse(window.location.search);
	console.log("PARAMS: ", params)
	if(params.takeSurvey == 1){
		if(params.surveyID){
			surveyService.getSurveyToken(params.surveyID).then(data => {
				console.log("Get survey Token data: ", data)
					if(data.role === "judge"){
						userInfo = data
						navigate("/survey?surveyID="+params.surveyID)
					}
				}
			)
		}
	}
	else{
		console.log("userInfo: ", userInfo)
		console.log("1. Attempting to refresh token")
		userService.refreshToken().then(data => setUserInfo(data))
	}

	function setUserInfo(info){
		userInfo = info
		console.log("userInfo: ", userInfo)
	}


</script>

<Router url={url}>
	<Navbar bind:userInfo={userInfo}></Navbar>

	<Route path="/">
		<LandingPage studyTitle="Eksamensoppgave 3b TDAT2001 vår 2020"></LandingPage>
	</Route>

	<Route path="login">
		<LoginPage newUser="false" bind:userInfo={userInfo}></LoginPage>
	</Route>

	<Route path="survey">
		<Survey surveyID={params.surveyID} bind:userInfo={userInfo}/>
	</Route>

	<Route path="create_survey">
		<CreateSurvey userInfo={userInfo}></CreateSurvey>
	</Route>

	<Route path="about">
		<AboutProject></AboutProject>
	</Route>

	<Route path="register_account">
		<RegisterAccount></RegisterAccount>
	</Route>

	<Route path="test">
		<UserServiceTest/>
	</Route>

	<Route path="admin_board/*">
		<AdminBoard bind:userInfo={userInfo}/>
	</Route>

	

</Router>
<SvelteToast options={{ reversed: true, intro: { y: 192 } }} />


<style>
</style>