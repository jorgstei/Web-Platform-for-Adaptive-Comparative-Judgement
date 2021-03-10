<script>
    import {surveyService} from "../Services/SurveyService"
    import {userService} from "../Services/UserService"
    import Table from "../Components/Table.svelte"
    import { saveAs } from 'file-saver';
    import { onMount } from 'svelte';
    export let userInfo;

    console.log("in surveys")
    let data2DArray;
	onMount(async () => {
        let data;
        if(userInfo.role == "admin"){
            data = await surveyService.getAllSurveys();
            console.log("All survey data", data)
        }
        else if(userInfo.role == "scientist"){
            data = await surveyService.getSurveyByUserID(userInfo.userid);
        }
        
        data2DArray = [];
        for (let i = 0; i < data.length; i++) {
            // add data according to tableAttributes array
            let email = "No owner";
            console.log("Owners:", data[i].owners)
            if(data[i].owners != undefined && data[i].owners.length > 0 && data[i].owners[0].owner_id != null){
                await userService.getUserByID(data[i].owners[0].owner_id).then((data)=>{ if(data != null && data != undefined && data.email != null) email = data.email});
            }
            let arr = [data[i].title, email, data[i].dateCreated.split("T")[0], data[i].items.length, data[i].active, data[i]._id]
            data2DArray.push(arr);
        }
        data2DArray = data2DArray;
        console.log("Transformed survey 2D array data:", data2DArray);
	});

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


</script>
{#if data2DArray}
    <Table tableTitle="Surveys" bind:tableData={data2DArray} tableAttributes={["title", "researcher", "created", "items", "active", "id", "data", "edit", "share", "delete"]}
    deleteFunc = {async (id)=>{
        await surveyService.deleteSurvey(id);
    }}></Table>
{/if}    

    

<style>

</style>
