<script>
</script>
<main>
  <h1>About this project</h1>
  <div id="about1" class="textbox">
      <h2 class="text-h4 mb-4">What is adaptive comparative judgement?</h2>
      <p>
        Comparative judgement is a method derived from L.L. Thurstone's conceived "Law of comparative judgement". 
        This law essentially states that we generally rank things more accurately when asked to compare it to other similar things, as opposed to ranking it by itself on an absolute scale.
      </p>
      <p>
        For example, guessing how many kilograms a dumbbell weighs is much harder than telling which of 2 dumbbells is heavier.
        In comparative judgement a judge is asked to choose between a pair of options several times. These answers are then used to generate a linear ranking of the options.
      </p>
      <p>
        The "adaptive" in adaptive comparative judgement comes from the algorithm that chooses which pair the judge should compare next.
        This algorithm can help cut down on the amount of comparisons the judge has to evaluate, and is therefore integral to the user experience.
      </p>
      
  </div>

  <div id="about2" class="textbox">
      <div class="quote">
          <blockquote>
            <p>"There is no such thing as <br>absolute judgement"</p>
            <cite>- Donald Laming</cite>
          </blockquote>
        </div>
  </div>

  <div id="about3" class="textbox">
    <h2 class="text-h4 mb-4">About us</h2>
      <p>
        This project is the result of a bachelor thesis in computer engineering at the Norwegian University of Science and Technology (NTNU).
        The students who authored the code for this project are Lasse Ivar Seivaag and Jørgen Steig, under supervision from Olav Skundberg.
        The bachelor thesis was submitted in spring of 2021.
      </p>
      <p>
        The project is done on behalf of the Institue of Teacher Education at NTNU. The main purpose of the project is currently to serve as a tool for scientists to use in their studies. 
        The platform is being hosted and further developed by NTNU.
      </p>
      <p>There are aspirations for this project to later serve as a (hopefully) better way for professors to grade their students.</p>
  </div>
  <div id="about4" class="textbox">
    <h2 class="text-h4 mb-4">Can we use your product?</h2>
    <p>
      Although initially built with the purpose of assisting scientists at NTNU to do their research, we gladly welcome anyone else who would like to utilize the product!
      The source code is avaliable fully open-source on <a href="https://github.com/jorgstei/Web-Platform-for-Adaptive-Comparative-Judgement">GitHub</a>, distributed under the Creative Commons by-nc-sa license.
    </p>
    <p>

    </p>
  </div>
    
</main>

<style >
  h1{
    grid-area: title;
    text-align: center;
    font-size: 2.5rem;
  }
  #about1{
    grid-area: whatIsACJ;
  }
  #about2{
    grid-area: quote;
  }
  #about3{
    grid-area: aboutUs;
  }
  #about4{
    grid-area: license;
  }
  main{
    width:80%;
    margin:auto;
    padding: 2vw;
    padding-top: 10vh;
    display:grid;
    grid-row-gap: 2vh;
    grid-column-gap: 5vw;
    grid-template: 
          'title title'
          'quote aboutUs'
          'whatIsACJ aboutUs'
          'whatIsACJ license';
  }
  blockquote {
    font-weight: 100;
    font-size: 1.5rem;
    max-width: 400px;
    line-height: 1.4;
    position: relative;
    margin: auto;
    padding: .5rem;
}

blockquote:before,
blockquote:after {
	position: absolute;
	color: #aaaaaa;
	font-size: 4rem;
	width: 3rem;
	height: 3rem;
}

blockquote:before {
	content: '“';
	left: -1rem;
	top: -1rem;
}

blockquote:after {
	content: '”';
}

cite {
	line-height: 3;
	text-align: right;
}
</style>