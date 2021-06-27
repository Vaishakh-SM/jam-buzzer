import React from "react";
import {Box, Button, Header, Heading, Paragraph, Footer, Text, Anchor} from "grommet";
import { useHistory } from "react-router-dom";
import {Github, Contact} from "grommet-icons";

const Head = () => {
  return (
    <Header direction="column" gap = "none" margin = {{bottom : "small"}} border={{ side: 'bottom' }}>
        <Heading alignSelf = "center" margin ={{bottom : "none"}}>
          JaMaster
        </Heading>
        <Paragraph alignSelf="center">We bestow this tool upon you, puny gods!</Paragraph>
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
      <Footer 
      tag='footer'
      wrap
      direction='row'
      pad='medium'
      border={{ side: 'top' }}
      gap='small'
      flex={false}
      justify="start">

        <Text 
        size = "large"
        textAlign = "center"
        margin ={{bottom:"small"}}>
          JaMaster by Vaishakh
        </Text>
        <Box flex = "grow"></Box>
        <Box 
        direction = "row"
        gap="medium"
        margin ={{bottom:"small"}}>

          <Anchor 
          label="Contact"
          icon = {<Contact/>}/>

          <Anchor 
          label="Github"
          icon = {<Github/>}/>
        </Box>
      </Footer>
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