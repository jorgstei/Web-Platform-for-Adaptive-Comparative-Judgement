<script>
    import { onMount } from "svelte";
    import {surveyItemFileService} from "../Services/SurveyItemFileService";

    export let textID;
    export let headerSizeNumber;

    let textContent = "";

    onMount(()=>{
        surveyItemFileService.get(textID).then((result) => {
            console.log("From textview res", result);
            if (result.status < 300) {
                textContent = String.fromCharCode.apply(null, result.data.data.data);
            }
            else{
                textContent = "Couldn't load answer..";
            }
        })
    })
</script>

<h1 class="text--primary text-h{headerSizeNumber}">
    {textContent}
</h1>