<script>
    import Menu from "../Components/Menu.svelte"
    import Table from "../Components/Table.svelte"
    import {userService} from "../Services/UserService";
    import { Router, Route, navigate } from "svelte-routing";
    import Surveys from "./Surveys.svelte"
    import Researchers from "./Researchers.svelte";
    import InviteResearcher from "./InviteResearcher.svelte"
    import CreateSurvey from "./CreateSurvey.svelte";
    import RawSurveyData from "./RawSurveyData.svelte";
    import LoginPage from "./LoginPage.svelte";
    export let userInfo;

    
    
    $: userInfo
</script>
<Router url="admin_board/">
    <main>
        {#if userInfo != null && userInfo != undefined && userInfo.email != null}
            <div id="menuWrapper">
                <Menu userInfo={userInfo}/>
            </div>
        {:else}
            <p>You do not appear to be logged in.</p>
        {/if}
        <div class="contentWrapper">

            <Route path="researchers">
                <Researchers userInfo={userInfo}/>
            </Route>

            <Route path="invite_researcher">
                <InviteResearcher userInfo={userInfo}/>
            </Route>
            
            <Route path="*surveys">
                <Surveys userInfo={userInfo}/>
            </Route>
            <Route path="create_survey">
                <CreateSurvey userInfo={userInfo}/>
            </Route>
            <Route path="survey_data">
                <RawSurveyData userInfo={userInfo}/>
            </Route>
            <Route path="edit_survey">
                <CreateSurvey userInfo={userInfo} editing={true}/>
            </Route>
            <Route path="change_password">
                <LoginPage userInfo={userInfo} changePassword={true}/>
            </Route>
        </div>
    </main>
</Router>


<style>
    main {
        display: grid;
        grid-template-areas:
        "menu contentWrapper contentWrapper contentWrapper contentWrapper contentWrapper";
        width: 100vw;
        height: 95vh;
        grid-column-gap: 1vw;
        padding-top: 5vh;
        text-align: center;
        
    }

    #menuWrapper {
        width: 15vw;
        padding-top: 10vh;
        padding-left: 2vw;
        grid-area: menu;
    }
    .contentWrapper {
        grid-area: contentWrapper;
        margin-left: 0;
        justify-content:center;
        max-width: fit-content;
    }
    


</style>