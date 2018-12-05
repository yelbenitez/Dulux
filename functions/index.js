const functions = require('firebase-functions');
const {dialogflow} = require('actions-on-google');
const Datastore = require('@google-cloud/datastore');
const {WebhookClient} = require('dialogflow-fulfillment');
const admin = require('firebase-admin');
const {
  SimpleResponse,
  BasicCard,
  Image,
  Suggestions,
  Button
} = require('actions-on-google');

admin.initializeApp();
//firebase = admin.database();
//const app = dialogflow();
/*
app.middleware((conv)=>{

});*/

exports.fulfillment = functions.https.onRequest((request,response)=>{
    const agent = new WebhookClient({request,response});

    //Backend functions ///////////////////////////////////////////

    function readData(project,agent){
        return admin.database().ref( project + '/validation').once('value').then(function(snapshot){// working get
            agent.add(JSON.stringify(snapshot.val()));
        });
    }

    // Intent ////////////////////////////////////////////////////

    function Welcome(agent) {
        const initMessage = `Welcome to the Dulux Genie.
        I’m here to help you take on your 
        project, although you’ll have to 
        take on the painting yourself.
        To start off, what project do you 
        need help with`;   
        agent.add(initMessage);
    }

    function Start_project(agent) {
        const param_project = agent.parameters.Project;
         const param_descrption = agent.parameters.Description
        
        const project_type = request.body.queryResult.outputContexts[1].parameters["Project.original"]; // getting the context from JSON request of dflow 
        return readData(project_type,agent)
      //  agent.add("Nice, a " + project_type + ". Is your " + project_type + " Indoor or outdoor?"); 
        
        /*
        if(param_description == ""){
          //      const context = agent.setContext('Project_type');
                agent.add("Nice a " + param_project);
       //      return Validation(agent);
         }else{
             agent.add("oops");
         }*/

    }

    function Validation(agent) {
     //   const context = agent.getContext('Project_type');
     //   agent.add();
    }


    let intentMap = new Map();
    intentMap.set('Default Welcome Intent', Welcome);
    intentMap.set('Find Project', Start_project);
    intentMap.set('Validation', Validation)

    agent.handleRequest(intentMap);
});


/*
app.intent('Default Welcome Intent', (conv)=> {
       // conv.contexts.set(Context.PROJECT,5);
        const initMessage = `Welcome to the Dulux Genie.
        I’m here to help you take on your 
        project, although you’ll have to 
        take on the painting yourself.
        To start off, what project do you 
        need help with`;
   //     conv.ask(initMessage);
        return readData(userId,conv);
});


app.intent('Find Project', (conv)=>{
        return readRequest(conv);
});
*/

function writeUserData(userId, name, email) {   //data insert working
    admin.database().ref('users/' + userId).set({
      username: name,
      email: email
    });
}


function readData(userId,conv){
    return admin.database().ref('users/' + userId + '/email').once('value').then(function(snapshot){// working get
         //   conv.ask(snapshot.val());
         return messagePost(snapshot.val(),conv);
    });
}

    function messagePost(message,conv){// working get
        return conv.ask('reached '+message);
    }


//exports.fulfillment = functions.https.onRequest(app); // firebase cloud functions
