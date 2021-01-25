<script>
	import Footer from "./Footer.svelte";
	import Navbar from "./Navbar.svelte";
	import LoginFields from "./LoginFields.svelte";
</script>
<Navbar></Navbar>
<main>
    <h1>Welcome to ACJ!</h1>
    <h2>Please register below to join us</h2>
    <LoginFields></LoginFields>
</main>
<Footer></Footer>



<style>
	main {
		text-align: center;
		background-color: #aaaaaa;
		margin: auto;
		top:0;
        display:grid;
        grid-template-rows: 2fr 1fr 8fr;
        width: 100vw;
        height: 90vh;
        margin-top: 5vh;
	}
	h1 {
		color: #000000;
		font-size: 3em;
		font-weight: 100;
        margin-top: 5vh;
        
	}
	h2 {
		color: #000000;
		font-size: 1.2em;
		font-weight: 100;
	}
	
</style>