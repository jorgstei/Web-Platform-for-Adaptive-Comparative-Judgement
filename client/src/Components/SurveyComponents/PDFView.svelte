<script>    
    import { onMount } from "svelte";

    /*
        src should be a blob or base64 representation of the pdf
        width is set on the outer div, while the iframe gets 100%
        height is set on the outer div, while the iframe gets 100%
    */
    export let src;
    export let width;
    export let height;

    export let iframeId = undefined

    const removeUnwantedToolbars = (iframe) => {
        console.log("Ready")
        iframe = iframe.target
        iframe.contentWindow.document.querySelector("#sidebarContainer").hidden = true
        iframe.contentWindow.document.querySelector("#secondaryToolbar").hidden = true
        iframe.contentWindow.document.querySelector("#sidebarToggle").hidden = true
        iframe.contentWindow.document.querySelector("#print").hidden = true
        iframe.contentWindow.document.querySelector("#download").hidden = true
        iframe.contentWindow.document.querySelector("#viewBookmark").hidden = true
        iframe.contentWindow.document.querySelector("#secondaryToolbarToggle").hidden = true
        iframe.contentWindow.document.querySelector("#toolbarViewerRight").hidden = true
    }

    onMount(() => {
        iframeId = iframeId == undefined ? "PDFView"+src : iframeId
        let iframe = document.getElementById(iframeId)
        iframe.addEventListener("load", (e) => removeUnwantedToolbars(e))
        iframe.setAttribute("title", "PDF")
        iframe.setAttribute("src", "/pdf-js/web/viewer.html?file="+src)
        iframe.setAttribute("height", "100%")
        iframe.setAttribute("width", "100%")
    })
</script>

<div style={"width:"+width+";height:"+height+";"}>
    <iframe width="100%" height="100%" id={iframeId}></iframe>
</div>