<script>
	import queryString from "query-string";
	import { SvelteToast } from '@zerodevx/svelte-toast'
	import {surveyService} from "../Services/SurveyService"
	import {userService} from "../Services/UserService"
	import Footer from "../Components/Footer.svelte";
	import Navbar from "../Components/Navbar.svelte";
	import Survey from "./Survey.svelte";
	import { Router, Route } from "svelte-routing";
	import LoginPage from "./LoginPage.svelte"
	import LandingPage from "./Landing_page.svelte";
	import AboutProject from "./AboutProject.svelte";
	import CreateSurvey from "./CreateSurvey.svelte";
	import UserServiceTest from "../test_pages/UserServiceTest.svelte"
	import AdminBoard from "./AdminBoard.svelte";
	import RegisterAccount from "./RegisterAccount.svelte";
	import ForgottenPassword from "./ForgottenPassword.svelte";
	import IntroductionToSurvey from "./IntroductionToSurvey.svelte";
	import { navigateWithRefreshToken } from "../Utility/naviagte";
	import { navigate }from "svelte-routing"
	import { MaterialApp } from 'svelte-materialify';

	export let url="";
	let userInfo = null;

	if(userInfo == undefined || userInfo == null){
		userService.refreshToken().then(data => userInfo = data)
	}
	let surveyID;
	/*
	let goToSurvey = () => {
				
	
		else{
			console.log("userInfo: ", userInfo)
			console.log("1. Attempting to refresh token")
			userService.refreshToken().then(data => setUserInfo(data))
		}
	}
	
	

	function setUserInfo(info){
		userInfo = info
		console.log("userInfo: ", userInfo)
	}
	*/

	$: userInfo
</script>
<MaterialApp>
	<Router url={url}>
		<Navbar bind:userInfo={userInfo}></Navbar>
	
		<Route path="/">
			<LandingPage bind:surveyID={surveyID}></LandingPage>
		</Route>
	
		<Route path="login">
			<LoginPage newUser="false" bind:userInfo={userInfo}></LoginPage>
		</Route>
	
		<Route path="forgotten_password">
			<ForgottenPassword bind:userInfo={userInfo}></ForgottenPassword>
		</Route>
	
		<Route path="survey">
			<IntroductionToSurvey bind:surveyID={surveyID} bind:userInfo={userInfo}/>
		</Route>
		
		<Route path="take_survey">
			<Survey bind:surveyID={surveyID} bind:userInfo={userInfo}/>
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
</MaterialApp>



<style>
</style>