<script>
    import { onMount } from "svelte";
    import { surveyService } from "../Services/SurveyService";
    import { toast } from "@zerodevx/svelte-toast";
    import {userService} from "../Services/UserService";

    export let loadingData = false;
    export let userInfo = undefined;
    export let limit = 10;
    export let currentPage = 0;
    export let filterBy = {filterName: "", counter: 0};
    let oldFilterBy = {filterName: "", counter: 0};
    export let filterFunction = undefined;
    export let countFunction = undefined;
    export let count = 0;
    export let direction = 1;
    export let data = undefined;
    import {Select} from 'svelte-materialify';
    import { mdiChevronDown } from "@mdi/js";
    import swal from "sweetalert";


    onMount(() => {
        countFunction().then(res => {
            if(res.status < 300){
                count = res.data
            }
            else{
                swal(
                    "Error",
                    "Unable to fetch count.\n"+res.data.message,
                    "error"
                )
            }
        })
        let table = document.getElementsByClassName("main_table")[0];
        if(table){
            console.log("Table width: ", table.style);
        }
    })

    function filter(){
        loadingData = true;
        filterFunction(filterBy.filterName, currentPage*limit, limit, direction).then(res => 
        {
            if(res == undefined) return;
            if(res.status < 300){
                console.log(res.data)
                data = res.data;
            }
            else{
                toast.push("Something went wrong during filtering, please try to refresh.", {duration: 4000});
            }
            //data = data
            loadingData = false;
        })
        userService.refreshToken().then(res => res?.status == 200 ? userInfo = res.data : userInfo = null)
        console.trace()
    }

    function updatedFilterBy(){
        if(oldFilterBy.filterName === filterBy.filterName){
            direction = (direction == 1) ? -1 : 1;
            direction = direction;
        }
        oldFilterBy.filterName = filterBy.filterName;
        oldFilterBy.counter = filterBy.counter;
        filter()
    }

    function setLimit(e){
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

    let limitItems = [
        {name:"5", value:5},
        {name:"10", value:10},
        {name:"25", value:25},
        {name:"50", value:50},
        {name:"100", value:100}
    ];

    $:filterBy && updatedFilterBy()
</script>

<div class="table-filter-container">
    <ul>
        <li style="width:15%;" on:click={() => setTimeout(() => window.scrollTo(0, document.body.scrollHeight), 100)}>
            <Select items={limitItems} bind:value={limit} mandatory on:change={setLimit}>Limit</Select>
        </li>

        <li>
            <img class="navigate-image" on:click={gotoFirstPage} src="/img/arrow-end-left.svg" alt="Go to first page" title="Go to first page">
        </li>
        <li>
            <img class="navigate-image" on:click={goBackOnePage} src="/img/triangle-left-arrow.svg" alt="Go back one page" title="Go back one page">
        </li>
        <li>
            <input class="goto-page-input" type="text" placeholder={currentPage} on:input={validateGotoPageInput} bind:value={currentPage} style={"width:" + 1.5*currentPage.toString().length + "vw"} title="Page number">
        </li>
        <li>
            <img class="navigate-image" on:click={goForwardOnePage} src="/img/triangle-right-arrow.svg" alt="Go forward one page" title="Go forward one page">
        </li>
        <li>
            <img class="navigate-image" on:click={gotoLastPage} src="/img/arrow-end-right.svg" alt="Go to last page" title="Go to last page">
        </li>
    </ul>
</div>

<style>
.table-filter-container{
    /*border:2px solid #95A5A6 ;*/
    margin:1.5vh auto 0 auto;
    padding: 0;
    max-width: 60vw;
}
.goto-page-input{
    
    margin-top:0;
    padding-top:0;
    text-align: center;
}
.navigate-image{
    width: 1.5vw;
    height: 3vh;
    cursor: pointer;
}
li{
    display: inline-block;
    margin-right: 1vw;
    height: 5vh;
    vertical-align: middle;
}
li > select {
    vertical-align: top;
}
ul{
    list-style-type: none;
    padding: 0;
}

</style>