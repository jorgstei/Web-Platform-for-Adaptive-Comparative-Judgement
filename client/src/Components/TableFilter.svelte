<script>
import { onMount } from "svelte";
import { surveyService } from "../Services/SurveyService";
import { toast } from "@zerodevx/svelte-toast";
import {userService} from "../Services/UserService";

    export let userInfo = undefined;
    export let limit = 5;
    export let currentPage = 0;
    export let filterBy = {filterName: "", counter: 0};
    let oldFilterBy = {filterName: "", counter: 0};
    export let filterFunction = undefined;
    export let countFunction = undefined;
    export let count = 0;
    export let direction = 1;
    export let data = undefined;

    onMount(() => {
        countFunction().then(res => count = res)
    })

    function filter(){
        filterFunction(filterBy.filterName, currentPage*limit, limit, direction).then(res => 
        {
            if(res == undefined) return;
            if(res.status === 200){
                console.log(res.data)
                data = res.data;
            }
            else{
                toast.push("Something went wrong during filtering, please try to refresh.", {duration: 4000});
            }
            //data = data
        })
        userService.refreshToken().then(res => userInfo = res)
        console.trace()
    }

    function updatedFilterBy(){
        if(oldFilterBy.filterName === filterBy.filterName){
            direction = (direction == 1) ? -1 : 1
        }
        oldFilterBy.filterName = filterBy.filterName;
        oldFilterBy.counter = filterBy.counter;
        filter()
    }

    function setLimit(e){
        limit = e.target.value;
        console.log(limit);
        currentPage = (currentPage > Math.floor((count/limit))) ? Math.floor(count/limit) : currentPage
        filter()
    }
    function gotoFirstPage(e){
        currentPage = 0;
        filter()
        console.log(count)
        console.log("gotoFirstPage:",currentPage)
    }
    function gotoLastPage(e){
        currentPage = Math.floor(count/limit)
        filter()
        console.log("gotoLastPage:",currentPage)
    }
    function goBackOnePage(e){
        if(currentPage-1 < 0){
            console.log("goBackOnePage, already at page 0")
            return
        }
        currentPage--;
        currentPage = (currentPage > Math.floor((count/limit))) ? Math.floor(count/limit) : currentPage
        filter()
        console.log("goBackOnePage", currentPage)
    }
    function goForwardOnePage(e){
        if(currentPage+1 >= 1000){
            console.log("goForwardOnePage, already at page 0")
            return
        }
        currentPage++;
        currentPage = (currentPage > Math.floor((count/limit))) ? Math.floor(count/limit) : currentPage
        filter()
        console.log("goForwardOnePage", currentPage)
    }

    function validateGotoPageInput(e){
        const input = e.target.value;
        const parsed = parseInt(input, 10)
        if(isNaN(parsed) && input !== ""){
            console.log("validateGotoPageInput invalid input:", input)
            e.target.value = currentPage
            return
        }
        else if(typeof(parsed) == "number" && !isNaN(parsed)){
            console.log(parsed)
            currentPage = (parsed > Math.floor((count/limit))) ? Math.floor(count/limit) : parsed
            e.target.value = currentPage
            filter()
            console.log("validateGotoPageInput parsed:", parsed)
        }
        else{
            e.target.value = ""
        }
    }

    $:filterBy && updatedFilterBy()
</script>

<div class="table-filter-container">
    <ul>
        <li>
            <label class="label-hori" for="dropdown-limit">Limit:</label>
        </li>
        <li>
            <select name="limit" id="dropdown-limit" on:change={setLimit}>
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
            </select>
        </li>
        <li>
            <img class="navigate-image" on:click={gotoFirstPage} src="/img/arrow-end-left.svg" alt="Go to first page">
        </li>
        <li>
            <img class="navigate-image" on:click={goBackOnePage} src="/img/triangle-left-arrow.svg" alt="Go back one page">
        </li>
        <li>
            <input class="goto-page-input" type="text" placeholder={currentPage} on:input={validateGotoPageInput} value={currentPage} maxlength=5>
        </li>
        <li>
            <img class="navigate-image" on:click={goForwardOnePage} src="/img/triangle-right-arrow.svg" alt="Go forward one page">
        </li>
        <li>
            <img class="navigate-image" on:click={gotoLastPage} src="/img/arrow-end-right.svg" alt="Go to last page">
        </li>
        
    </ul>
</div>

<style>
.table-filter-container{
    border:black;
    border-style: solid;
    justify-content: center;
    justify-items: center;
    flex-direction: column;
}
.goto-page-input{
    max-width: 3vh;
}
.label-hori{
    float:left;
}
.navigate-image{
    display:block;
    width: 1vh;
    height: 1vh;
    cursor: pointer;
}
li{
    float: left;
    display: block;
    margin: 1vh
}
ul{
    overflow:auto;
    list-style-type: none;
    flex-direction: column;
    margin: 0;
    padding: 0;
    justify-content: center;
    justify-items: center;
    align-items: baseline;
}
</style>