<script>
  import Menu from "../Components/Menu.svelte";
  import { Router, Route, navigate } from "svelte-routing";
  import Surveys from "./Surveys.svelte";
  import Researchers from "./Researchers.svelte";
  import InviteResearcher from "./InviteResearcher.svelte";
  import CreateSurvey from "./CreateSurvey.svelte";
  import RawSurveyData from "./RawSurveyData.svelte";
  import LoginPage from "./LoginPage.svelte";
  import Profile from "./Profile.svelte";
  
  export let userInfo;
  export let allowLeavePageWithoutWarning;
  export let warningOnLeaveFunc;

  $: userInfo;
</script>

<Router url="admin_board/">
  <main class="d-flex flex-row">
    {#if userInfo != null && userInfo != undefined && userInfo.email != null}
      <div id="menuWrapper">
        <Menu {userInfo} bind:allowLeavePageWithoutWarning={allowLeavePageWithoutWarning} bind:warningOnLeaveFunc={warningOnLeaveFunc}/>
      </div>
      <div class="contentWrapper flex-grow-1">
        <Route path="profile">
          <Profile bind:userInfo bind:allowLeavePageWithoutWarning/>
        </Route>
        <Route path="researchers">
          <Researchers bind:userInfo={userInfo} bind:allowLeavePageWithoutWarning/>
        </Route>

        <Route path="invite_researcher">
          <InviteResearcher bind:userInfo={userInfo} bind:allowLeavePageWithoutWarning/>
        </Route>

        <Route path="surveys">
          <Surveys bind:userInfo={userInfo} bind:allowLeavePageWithoutWarning/>
        </Route>
        <Route path="create_survey">
          <CreateSurvey bind:userInfo={userInfo} bind:allowLeavePageWithoutWarning bind:warningOnLeaveFunc/>
        </Route>
        <Route path="survey_data">
          <RawSurveyData bind:userInfo={userInfo} bind:allowLeavePageWithoutWarning/>
        </Route>
        <Route path="edit_survey">
          <CreateSurvey bind:userInfo={userInfo} editing={true} bind:allowLeavePageWithoutWarning bind:warningOnLeaveFunc/>
        </Route>
        <Route path="change_password">
          <LoginPage bind:userInfo={userInfo} changePassword={true}}/>
        </Route>
      </div>
    {:else}
      <h1 class="text-h5 align-self-center" style="text-align: center; margin:auto; padding-top: 10vh;">You do not appear to be logged in.</h1>
    {/if}
  </main>
</Router>

<style>
  main {
    width: auto;
    text-align: center;
  }

  #menuWrapper {
    width: 15vw;
  }

  .contentWrapper {
    /*
    max-width: fit-content;
    */
  }
</style>
