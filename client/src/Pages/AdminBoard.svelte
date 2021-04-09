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
  export let userInfo;

  $: userInfo;
</script>

<Router url="admin_board/">
  <main>
    {#if userInfo != null && userInfo != undefined && userInfo.email != null}
      <div id="menuWrapper">
        <Menu {userInfo} />
      </div>
      <div class="contentWrapper">
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
      <p>You do not appear to be logged in.</p>
    {/if}
  </main>
</Router>

<style>
  main {
    display: grid;
    grid-template-columns: 1fr 5fr;
    grid-column-gap: 0;
    width: 100vw;
    padding-top: 5vh;
    text-align: center;
  }

  #menuWrapper {
    width: 15vw;
    padding-top: 10vh;
    padding-left: 2vw;
    padding-right: 0;
    margin-right: 0;
  }

  .contentWrapper {
    max-width: fit-content;
  }
</style>
