<div align = "center">
<img src = "https://github.com/Vaishakh-SM/jam-buzzer/blob/main/client/public/images/android-chrome-192x192.png?raw=true">
<h1> JaMaster </h1>
</div>

<div>
JaMaster is a game management system for the popular speaking event JAM, based on the 
BBC Radio 4 show "Just a minute". It is designed to make point management easier for the JAM Master.
<br/>
<br/>
<strong>Try it out!</strong> <br/>
Check out our <a href = "https://jam-master.netlify.app"> website</a>.<br/>
You are also free to <a href = "https://github.com/Vaishakh-SM/jam-buzzer/new/main?readme=1#setting-up-locally">host this system on your local network</a> for faster performance.
</div>

<div>
<h2>Features</h2>
<ul>
<li>Synchronized buzzers and timers</li>
<li>Timer stops when a player buzzes, and the speaker gets the required points automatically</li>
<li>Easily add challenge points or give penalties</li>
<li>Set the amount of time after which a speaker should start getting points</li>
<li>Hide timers for all participants on will</li>
</ul>
</div>

<div>
<h2>Setting up locally</h2>
<ul>
<li>Set up git, Node.js (12.18.2 or above), npm (7.13.0 or above) </li>
<li>Clone the repository (use git or download zip) </li>
<li>Move to client directory on command line and run the command <code> npm install </code> </li>
<li>Move to server directory on command line and run the command <code> npm install </code> </li>
<li>In client directory, move to <code>src</code> directory and open the file <code>socket.js</code>, you will see: <br/>
<code>const ENDPOINT = "https://jam-buzzer.herokuapp.com/"</code>, change this to <code>const ENDPOINT = "http://#your network ip address#:4001/";</code> and save the changes.
<br/>Your app will still work if you do not do this, but it will not increase performance since you will still be using our backend</li>
<li>Move to server directory on command line and run the command <code> node index.js </code> </li>
<li>Move to client directory on command line and run the command <code> npm run start </code>. <br/>
You will get a message on command line with the link on which others should join, it will be something along the lines of <code>On your network: #Network ip#:#port# </code> </li>
<li>Enjoy Jamming with your friends!</li>
</ul>
</div>

<div>
<h2>Author</h2>
<p>Vaishakh Sreekanth menon, feel free to contact me through <a href ="mailto:vaishakhsm@gmail.com">email</a>.<p>
</div>
