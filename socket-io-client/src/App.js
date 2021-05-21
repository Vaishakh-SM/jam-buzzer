import React from "react";
import {BrowserRouter,Switch,Route} from "react-router-dom";
import PlayerBase from "./Components/Player_base"
import HostGame from "./Components/Host_game"
import Home from "./Components/Home"

export default function App() {
    return(
      <BrowserRouter>
       <Switch>
        <Route exact path="/player" component = {PlayerBase}/> 
        <Route exact path="/host" component = {HostGame}/>
        <Route exact path="/" component = {Home}/>
      </Switch>
      </BrowserRouter>
    )

}