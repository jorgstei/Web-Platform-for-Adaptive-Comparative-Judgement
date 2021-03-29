<script>
    import {surveyService} from "../Services/SurveyService"
    import {userService} from "../Services/UserService"
    import Table from "../Components/Table.svelte"
    import { onMount } from 'svelte';
    export let userInfo;

    console.log("in surveys")
    let dataHeaders = ["title", "researcher", "created", "items", "active", "id", "data", "edit", "share", "delete"];
    let data2DArray;
    let userRights = [];
    let activeStatus = [];
	onMount(async () => {
        if(userInfo == null){
            return
        }
        else{
            console.log("userinfo in surveys", userInfo);
        }
        let data;
        if(userInfo.role == "admin"){
            data = await surveyService.getAllSurveys().catch(err => console.log("Admin could not fetch all surveys\n", err));
            console.log("All survey data", data)
        }
        else if(userInfo.role == "researcher"){
            data = await surveyService.getSurveyByUserID(userInfo.userid).catch(err => console.log("Scientist could not fetch their surveys\n", err));
            console.log("All researcher's survey data", data)
        }
        
        data2DArray = [];
        for (let i = 0; i < data.length; i++) {
            if (!(userInfo.role == "admin")){
                userRights.push(data[i].owners.find(e => userInfo.userid == e.ownerId).rights);
            }
            else {
                userRights.push({manageMembers: true, editSurvey: true, viewResults: true})
            }
            activeStatus.push(data[i].active);
            // add data according to tableAttributes array        
            let email = "No owner";
            //console.log("Owners:", data[i].owners)
            if(data[i].owners != undefined && data[i].owners.length > 0 && data[i].owners[0].ownerId != null){
                await userService.getUserByID(data[i].owners[0].ownerId)
                .then((userData)=>{if(userData != null && userData != undefined && userData.email != null) email = userData.email})
                .catch(err => console.log("Could not getUserByID\n", err));
            }
            const YYYY_MM_DD_Date = data[i].dateCreated.split("T")[0];
            const DD_MM_YYYY_Date = YYYY_MM_DD_Date.split('-').reverse().join('.');
            //console.log(YYYY_MM_DD_Date, " -> ", DD_MM_YYYY_Date);
            const arr = [data[i].title, email, DD_MM_YYYY_Date, data[i].items.length, data[i].active, data[i]._id]
            data2DArray.push(arr);
        }
        data2DArray = data2DArray;
        console.log("Transformed survey 2D array data:", data2DArray);

	});
    
    /*
    //Chronbachs alpha test
    //https://www.researchgate.net/post/How_do_I_compute_the_internal_consistency_of_a_scale_which_is_made_up_of_binary_coded_yes1_no0_answers
    const testArr = [1,7,3,12,6,16,5,9,8,3,2]
    const variance = (arr) => {
        let sum = 0;
        arr.forEach(e => sum += e);
        const average = sum/arr.length;
        let squareDiff = [];
        arr.forEach(e => squareDiff.push(Math.pow(e-average, 2)));
        let sumOfSquareDiff = 0;
        squareDiff.forEach(e=>sumOfSquareDiff+=e);
        return sumOfSquareDiff/arr.length;
    }
    //console.log("Variance: ", variance(testArr));
    */
</script>
{#if data2DArray}
    <Table tableTitle="Surveys" bind:tableData={data2DArray} tableAttributes={dataHeaders} userRights={userRights} surveyActivityStatus={activeStatus}
    deleteFunc = {async (id)=>{
        await surveyService.deleteSurvey(id);
    }}></Table>
{/if}    

    

<style>

</style>
