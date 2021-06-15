import React from "react";
import {Box, Button, Header, Heading, Paragraph, Footer, Text, Anchor} from "grommet";
import { useHistory } from "react-router-dom";
import {Github, Contact} from "grommet-icons";

const Head = () => {
  return (
    <Header direction="column" gap = "none" margin = {{bottom : "small"}} border={{ side: 'bottom' }}>
        <Heading alignSelf = "center" margin ={{bottom : "none"}}>
          JAM
        </Heading>
        <Paragraph alignSelf="center">We make it easy for the JAM gods!</Paragraph>
    </Header>
  )
};

const Body = () => {

  let history = useHistory();

  const handleJoin = () =>{
    history.push("/player");
  }

  const handleHost = () =>{
    history.push("/host");
  }

  return (
    <Box direction = "column" as = "main" flex = "grow" justify = "start"> 

      <Box align ="center" justify = "between" pad = "medium" gap ="medium">
          <Button primary label = "Join Game" size = "large" onClick = {handleJoin}/>
          <Button secondary label = "Host Game" size="large" onClick = {handleHost}/>
      </Box>

    </Box>  
  )
};

const Foot = () => {
  return (
    <Box>

      <Footer 
      tag='footer'
      direction='row'
      pad='medium'
      border={{ side: 'top' }}
      gap='small'
      flex={false}
      justify="start">

        <Text size = "large">JAM</Text>
        <Box flex = "grow"></Box>
        
        <Anchor 
        label="Contact"
        icon = {<Contact/>}/>

        <Anchor 
        label="Github"
        icon = {<Github/>}/>
      </Footer>

    </Box>
  )
};

export default function Home() {
  
  return (
        <Box fill = "true" direction = "column">
          <Head/>
          <Body/>
          <Foot/>
        </Box>
        );
}