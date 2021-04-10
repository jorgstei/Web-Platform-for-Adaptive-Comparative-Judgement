<script>
	import queryString from "query-string";
	import { SvelteToast } from "@zerodevx/svelte-toast";
	import { surveyService } from "../Services/SurveyService";
	import { userService } from "../Services/UserService";
	import Footer from "../Components/Footer.svelte";
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
	import IntroductionToSurvey from "./IntroductionToSurvey.svelte";
	import { navigateWithRefreshToken } from "../Utility/naviagte";
	import { navigate } from "svelte-routing";
	import { MaterialApp } from "svelte-materialify";

	export let url = "";
	let userInfo = null;

	let refreshToken = () => {
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

	$: userInfo;
</script>

<MaterialApp>
	<Router {url}>
		<Navbar bind:refreshToken bind:userInfo />
		<div class="pt-14">
			<Route path="/">
				<LandingPage bind:surveyID />
			</Route>

			<Route path="login">
				<LoginPage newUser="false" bind:userInfo />
			</Route>

			<Route path="forgotten_password">
				<ForgottenPassword bind:userInfo />
			</Route>

			<Route path="create_survey">
				<CreateSurvey bind:userInfo />
			</Route>

			<Route path="about">
				<AboutProject />
			</Route>

			<Route path="register_account">
				<RegisterAccount />
			</Route>

			<Route path="test">
				<UserServiceTest />
			</Route>

			<Route path="admin_board/*">
				<AdminBoard bind:userInfo />
			</Route>
		</div>
	</Router>
	<Router {url}>
		<Route path="survey">
			<IntroductionToSurvey bind:surveyID bind:userInfo />
		</Route>

		<Route path="take_survey">
			<Survey bind:surveyID bind:userInfo />
		</Route>
	</Router>
	<SvelteToast options={{ reversed: true, intro: { y: 192 } }} />
</MaterialApp>

<style>
</style>
