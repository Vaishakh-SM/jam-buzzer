import React from "react";
import {Link} from "react-router-dom";

export default function Home() {
  return (
         <div>
            <ul>
                <li>
                    <Link to = "/player">Join an existing game</Link>
                </li>
                
                <li>
                <Link to = "/host">Creat a room</Link>
                </li>
            </ul>
          </div>
        );
}