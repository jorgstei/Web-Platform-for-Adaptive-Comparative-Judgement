<nav id="navbar">
    <img id="logo" src="img/logo.png" alt="ASD">
    <img id="name" src="img/name.png" alt="ASD">
    <ul>
        <li><a class="active" href="#home">Home</a></li>
        <li><a href="#news">News</a></li>
        <li><a href="#about">About</a></li>
    </ul>
    <!--
    <div id="logoWrapper">
        <img id="logo" src="img/logo.png" alt="ASD"> 
    </div>
    <ul>
        <li><a class="active" href="#home">Home</a></li>
        <li><a href="#news">News</a></li>
        <li><a href="#contact">Contact</a></li>
        <li><a href="#about">About</a></li>
    </ul>
    -->

</nav>

<style>
    nav {
        margin: 0;
        padding: 0;
        overflow: hidden;
        background-color: #333;
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
        background-color: #333;
        height: 5vh;
        top: 0;
    }

    li {
        float: left;
    }

    li a {
        display: block;
        color: white;
        text-align: center;
        padding: 1vw 1vh;
        text-decoration: none;
    }

    li a:hover {
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