<script>
    import {Link} from "svelte-routing";
</script>

<div id="navWrapper">
    <nav id="navbar">
        <img id="logo" src="img/logo.png" alt="ASD">
        <img id="name" src="img/name.png" alt="ASD">
        <ul>
            <Link to="/"><li>Home</li></Link>
            <Link to="login"><li>Log in</li></Link>
            <Link to="about"><li>About</li></Link>
            <Link to="create_quiz"><li>Create Quiz</li></Link>
            <Link to="test"><li>Test</li></Link>
        </ul>
    </nav>
</div>


<style>
    #navWrapper{
        margin-bottom: 5vh;
    }
    nav {
        margin: 0;
        padding: 0;
        overflow: hidden;
        /*background-color: #333;*/
        background-color: rgb(18, 73, 144);
        position: fixed;
        display: grid;
        grid-template-columns: 3fr 5fr 3fr;
        grid-column-gap: 20vw;
        top: 0;
        width: 100vw;
        height: 5vh;
        font-size: 1.5vh;
        border-bottom: 2px solid #333;
    }
    ul {
        list-style-type: none;
        margin: 0;
        padding: 0;
        overflow: hidden;
        /*background-color: #333;*/
        background-color: rgb(18, 73, 144);
        height: 5vh;
        top: 0;
        position: fixed;
        right:0;
    }

    li {
        float: left;
        display: block;
        color: white;
        text-align: center;
        padding: 1vw 1vh;
        text-decoration: none;
    }

    li:hover {
        background-color: #111;
    }

    #logo {
        margin:auto;
        margin-left: 3vw;
        height: 5vh;
        
    }
    #name {
        max-height: 5vh;
        margin: auto;

    }
</style>