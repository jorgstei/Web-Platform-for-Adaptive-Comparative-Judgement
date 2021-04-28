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
	import UserServiceTest from "../test_pages/UserServiceTest.svelte";
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
				userInfo = null;
			}
		});
	}
	let surveyID;
	let takingSurvey = false;
	let showJudgeOverlay;

	$: userInfo;
</script>

<MaterialApp>
	<Router>
		<Navbar bind:refreshToken bind:userInfo bind:takingSurvey bind:showJudgeOverlay bind:allowLeavePageWithoutWarning/>
		<div class="pt-14" style="height: 100vh">
			<Route path="/">
				<LandingPage bind:surveyID />
			</Route>

			<Route path="login">
				<LoginPage newUser="false" bind:userInfo />
			</Route>

			<Route path="forgotten_password">
				<ForgottenPassword bind:userInfo />
			</Route>

			<Route path="about">
				<AboutProject />
			</Route>

			<Route path="register_account">
				<RegisterAccount />
			</Route>

			<Route path="admin_board/*">
				<AdminBoard bind:userInfo bind:allowLeavePageWithoutWarning/>
			</Route>
			<Route path="survey">
				<Survey bind:surveyID bind:userInfo bind:takingSurvey bind:showJudgeOverlay/>
			</Route>
		</div>
	</Router>
	<SvelteToast options={{ reversed: true, intro: { y: 192 } }} />
</MaterialApp>

<style>
	:global(.s-list-item:focus){
		color: white;	
		background: rgba(76,76,76,0.5);
		outline-color: yellow;
		outline-style: auto;
	}
</style>
