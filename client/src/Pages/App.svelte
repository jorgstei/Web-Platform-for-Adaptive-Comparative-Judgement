<script>
	import { SvelteToast } from "@zerodevx/svelte-toast";
	import { userService } from "../Services/UserService";
	import Navbar from "../Components/Navbar.svelte";
	import Survey from "./Survey.svelte";
	import { Router, Route } from "svelte-routing";
	import LoginPage from "./LoginPage.svelte";
	import LandingPage from "./Landing_page.svelte";
	import AboutProject from "./AboutProject.svelte";
	import CreateSurvey from "./CreateSurvey.svelte";
	import AdminBoard from "./AdminBoard.svelte";
	import RegisterAccount from "./RegisterAccount.svelte";
	import ForgottenPassword from "./ForgottenPassword.svelte";
	import { MaterialApp } from "svelte-materialify";

	let userInfo = null;

	let allowLeavePageWithoutWarning = true;

	let refreshToken = () => {
		if(userInfo?.role == "judge"){
			userService.logoutJudge()
		}
		userService.refreshToken().then((data) => {
			if (data.status === 200) {
				userInfo = data.data;
			} else {
				console.log("RefreshToken failed");
				userInfo = null;
			}
		});
	};
	if (userInfo == null) {
		userService.refreshToken().then((data) => {
			if (data.status === 200) {
				userInfo = data.data;
			} else {
				console.log("RefreshToken failed");
			}
		});
	}

	let surveyID;
	let takingSurvey = false;
	let showJudgeOverlay = false;
	let warningOnLeaveFunc = () => {};
	let selectedMenuListValue="";
	let selectedNavbarListValue="";
	let surveyQuestionInNavBar="";

	$: userInfo;
</script>

<MaterialApp>
	<Router>
		<Navbar bind:surveyQuestionInNavBar bind:refreshToken bind:userInfo bind:takingSurvey bind:showJudgeOverlay bind:allowLeavePageWithoutWarning bind:warningOnLeaveFunc bind:selectedNavbarListValue/>
		<div class="pt-14" style="height: 100vh; overflow: auto">
			<Route path="/">
				<LandingPage bind:surveyID bind:selectedNavbarListValue/>
			</Route>

			<Route path="login">
				<LoginPage newUser="false" bind:userInfo bind:selectedNavbarListValue/>
			</Route>

			<Route path="forgotten_password">
				<ForgottenPassword bind:userInfo bind:selectedNavbarListValue/>
			</Route>

			<Route path="about">
				<AboutProject bind:selectedNavbarListValue/>
			</Route>

			<Route path="register_account" bind:selectedNavbarListValue>
				<RegisterAccount />
			</Route>

			<Route path="admin_board/*">
				<AdminBoard bind:userInfo bind:allowLeavePageWithoutWarning bind:warningOnLeaveFunc bind:selectedMenuListValue bind:selectedNavbarListValue/>
			</Route>
			<Route path="survey">
				<Survey bind:surveyQuestionInNavBar bind:surveyID bind:userInfo bind:takingSurvey bind:showJudgeOverlay/>
			</Route>
		</div>
	</Router>
	<SvelteToast options={{ reversed: false, intro: { y: 192 } }} />
</MaterialApp>

<style>
	:global(.s-list-item:focus){
		color: white;	
		background: rgba(76,76,76,0.5);
		outline-color: yellow;
		outline-style: auto;
	}
</style>
