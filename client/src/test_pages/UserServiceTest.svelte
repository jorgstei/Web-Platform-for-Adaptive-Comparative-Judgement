<script>
    import { surveyService } from "../Services/SurveyService";
    import { surveyItemFileService } from "../Services/SurveyItemFileService"
    import PDFView from "../Components/SurveyComponents/PDFView.svelte"
    import PDFObject from "pdfobject"
    import { nodeBufferToBlobURL } from "../Utility/nodeBufferToBlobURL";

    let file = null;
    let fileFromServer = null;
    let fileId = null;
    let fileToDisplay = null

    let testf = null

    const removeUnwantedToolbars = (iframe) => {
        console.log("Ready")
        iframe = iframe.target
        console.log(iframe)
        console.log(iframe.contentWindow)
        console.log(iframe.contentWindow.document)
        iframe.contentWindow.document.querySelector("#sidebarContainer").hidden = true
        iframe.contentWindow.document.querySelector("#secondaryToolbar").hidden = true
        iframe.contentWindow.document.querySelector("#sidebarToggle").hidden = true
        iframe.contentWindow.document.querySelector("#print").hidden = true
        iframe.contentWindow.document.querySelector("#download").hidden = true
        iframe.contentWindow.document.querySelector("#viewBookmark").hidden = true
        iframe.contentWindow.document.querySelector("#secondaryToolbarToggle").hidden = true
        iframe.contentWindow.document.querySelector("#toolbarViewerRight").hidden = true
    }

    const embedPDF = async () => {
        console.log("testing3")
        let iframe = document.getElementById("iframe")
        iframe.addEventListener("load", (e) => removeUnwantedToolbars(e))
        iframe.setAttribute("title", "PDF")
        iframe.setAttribute("src", "/pdf-js/web/viewer.html?file="+fileToDisplay)
        iframe.setAttribute("height", "100%")
        iframe.setAttribute("width", "100%")
    }   

    const inputOnChange = (e) => {
        console.log("testing3")
        file = e?.target?.files[0]
        //base64OfFile = URL.createObjectURL(file);
    }
    /*
    Keeping this around just in case
    const fromNodeBufferToBase64 = (buffer) => {
        return btoa(buffer.data.map((e) => {
            return String.fromCharCode(e)
        }).join(''))
    }
    */

    const getFile = (e) => {
        console.log("testing3")
        surveyItemFileService.get(fileId)
        .then(res => {
            if(res.status < 300){
                fileFromServer = res.data
                //testf = new File([Uint8Array.from(fileFromServer.data.data)], "MyPdf.pdf", {type: "application/pdf"})
                //fileToDisplay = URL.createObjectURL(testf)
                fileToDisplay = nodeBufferToBlobURL(fileFromServer.data, "application/pdf")
                console.log("fileToDisplay",fileToDisplay)
            }
            else{
                console.log("Couldn't get file from server")
            }
        })
    }
    
    //$: fileToDisplay && embedPDF()

</script>

<div>
    <input type="file" name="item1" on:change={(e) => inputOnChange(e)}/>
    <button type="submit" on:click={() => surveyService.uploadFile(file).then(res => fileId = res.data.loc)}>Post</button>
</div>
<div>
    <button type="submit" on:click={() => getFile()}>Get</button>
</div>
<div id="container" style="height:100%; width:100%">
    <iframe id="iframe"></iframe>
</div>
{#if fileToDisplay != null}
    <PDFView iframeId="leftItem" height="70vh" width="70vh" src={fileToDisplay}/>
    <PDFView iframeId="rightItem" height="70vh" width="70vh" src={fileToDisplay}/>
{/if}


<style>
    main {
        padding-top: 5vh;
        width: 60%;
        margin: auto;
    }
    #welcomeWrapper {
        text-align: left;
    }
</style>