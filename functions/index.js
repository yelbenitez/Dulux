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

exports.fulfillment = functions.https.onRequest((request,response)=>{
    const agent = new WebhookClient({request,response});
    const bodyParser = request.body.queryResult;
    const db = admin.database();
  
    //Backend functions ///////////////////////////////////////////

    function getOptions(project,agent){
        return admin.database().ref( project + '/validation/0').once('value').then(function(snapshot){// working get
            agent.add("Nice, a " + project + ". Is your " + project + " " + snapshot.val().option_1 + " or " +snapshot.val().option_2 + " ?"); // good
        });
    }

    function getChoiceValidation(choice,agent){ //testing
        const ch1_selected = bodyParser.outputContexts[0].parameters["Option_1.original"];
        const ch2_selected = bodyParser.outputContexts[0].parameters["Option_2.original"];
        const db = admin.database();

        if(ch1_selected != ""){
            return db.ref('validations/choice_1/' + ch1_selected).once('value').then(function(snapshot){// good
                    return confirmationRespond(snapshot.val(),agent);
            });
         }else if(ch2_selected != ""){
            return db.ref('validations/choice_2/' + ch2_selected).once('value').then(function(snapshot){// good
                     return confirmationRespond(snapshot.val(),agent);
            });
         }
    }

    function confirmationRespond(respond,agent){
        const project_type = bodyParser.outputContexts[1].parameters["Project.original"]; // getting the context from JSON request of dflow 
 
        return db.ref('val_response/' + respond).once('value').then(function(snapshot){// good
        const message = snapshot.val().first_line+" "+project_type+" "+snapshot.val().second_line+" "+project_type+" to dry. "+snapshot.val().third_line
        
        agent.add(message+" Are you ready?");
        });
    }

    // Intents ////////////////////////////////////////////////////

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
        const project_type = bodyParser.outputContexts[1].parameters["Project.original"]; // getting the context from JSON request of dflow 
        return getOptions(project_type,agent)
    }

    function Validation(agent) {
        const choice_1 = bodyParser.parameters["Option_1"]; //Good
        const choice_2 = bodyParser.parameters["Option_2"];

        if(choice_1 != ""){ //Good
            return getChoiceValidation(choice_1,agent);
        }else if(choice_2 != ""){
            return getChoiceValidation(choice_2,agent);
        }else{
            agent.add("I think we are not on the same page ?");
        }
    }   

    function Confirmation(agent) {
     /*   return db.ref('validations/choice_2/' + ch2_selected).once('value').then(function(snapshot){// good
            return confirmationRespond(snapshot.val(),agent);
         });*/
    }

    let intentMap = new Map();
    intentMap.set('Default Welcome Intent', Welcome);
    intentMap.set('Find Project', Start_project);
    intentMap.set('Validation', Validation);
    intentMap.set('Confirmation', Confirmation);

    agent.handleRequest(intentMap);
});