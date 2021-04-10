<script>
  import Menu from "../Components/Menu.svelte";
  import Table from "../Components/Table.svelte";
  import { userService } from "../Services/UserService";
  import { Router, Route, navigate } from "svelte-routing";
  import Surveys from "./Surveys.svelte";
  import Researchers from "./Researchers.svelte";
  import InviteResearcher from "./InviteResearcher.svelte";
  import CreateSurvey from "./CreateSurvey.svelte";
  import RawSurveyData from "./RawSurveyData.svelte";
  import LoginPage from "./LoginPage.svelte";
import Profile from "./Profile.svelte";
  export let userInfo;

  $: userInfo;
</script>

<Router url="admin_board/">
  <main class="d-flex flex-row">
    {#if userInfo != null && userInfo != undefined && userInfo.email != null}
      <div id="menuWrapper">
        <Menu {userInfo} />
      </div>
      <div class="contentWrapper flex-grow-1">
        <Route path="profile">
          <Profile bind:userInfo></Profile>
        </Route>
        <Route path="researchers">
          <Researchers bind:userInfo={userInfo} />
        </Route>

        <Route path="invite_researcher">
          <InviteResearcher bind:userInfo={userInfo} />
        </Route>

        <Route path="surveys">
          <Surveys bind:userInfo={userInfo} />
        </Route>
        <Route path="create_survey">
          <CreateSurvey bind:userInfo={userInfo} />
        </Route>
        <Route path="survey_data">
          <RawSurveyData bind:userInfo={userInfo} />
        </Route>
        <Route path="edit_survey">
          <CreateSurvey bind:userInfo={userInfo} editing={true} />
        </Route>
        <Route path="change_password">
          <LoginPage bind:userInfo={userInfo} changePassword={true} />
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
