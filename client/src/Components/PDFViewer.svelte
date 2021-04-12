<script>
    
    export let file;
    
    
    if(file.type != "application/pdf"){
        console.error(file.name, "is not a pdf file.")
    }
    
    let fileReader = new FileReader();  
    fileReader.onload = function() {
        let typedarray = new Uint8Array(this.result);
        pdfjsLib.getDocument(typedarray).then(function(pdf) {
            // you can now use *pdf* here
            console.log("the pdf has ",pdf.numPages, "page(s).")
            pdf.getPage(1).then(function(page) {
                // you can now use *page* here
                let viewport = page.getViewport(1);
                let canvas = document.createElement("canvas")
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                page.render({
                    canvasContext: canvas.getContext('2d'),
                    viewport: viewport
                });
                
                let div = document.getElementById('pdfWrapper');
                let obj = document.createElement('object');
                obj.data = canvas.toDataURL('application/pdf', .8);
                obj.type = "application/pdf";
                obj.style.width = "100px";
                obj.style.height = "100px";
                let h1 = document.createElement("h1");
                h1.innerHTML = canvas.toDataURL('image/jpeg', .8);
                div.appendChild(h1);
                div.appendChild(canvas);
            });
        });
    };
    fileReader.readAsArrayBuffer(file);
</script>

<div id="pdfWrapper">

</div>
