const functions = require('firebase-functions');
const {dialogflow} = require('actions-on-google');
const Datastore = require('@google-cloud/datastore');
const {
  SimpleResponse,
  BasicCard,
  Image,
  Suggestions,
  Button
} = require('actions-on-google');

const admin = require('firebase-admin');

admin.initializeApp();
//firebase = admin.database();

const app = dialogflow({debug: true});

app.middleware((conv)=>{

});

var userId = 100;
var name = "yel";
var email = "yelbenitez5@gmail.com"



function writeUserData(userId, name, email) {   //data insert
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




function tryReturn(userId,conv){ // this is not working
    var res = admin.database().ref('users/' + userId + '/email').once('value');
    conv.ask(res.snapshot.val());
}


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

//Setup contexts


app.intent('Find Project', (conv)=>{
      //  conv.ask('Hello');
      return tryReturn(userId,conv);
});










/*
app.intent(WELCOME_INTENT, (conv)=>{
    conv.ask("Welcome to Mr.Space facts generator! Ask me something about the great cosmos")
})


app.intent(FALLBACK_INTENT, (conv) =>{
    conv.ask("Sorry I didn't understand your request")
})


app.intent(ABOUT_SPACE, (conv) =>{
    const fact_type = conv.parameters[FACT_ENTITY].toLowerCase();
    if(fact_type == "space"){
        conv.ask("Space is made up of almost emptiness (Vacuum)")
    } else if(fact_type == "planet" || fact_type == "planets"){
        conv.ask("Our solar system has eight planets: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus and Neptune")        
    } else if(fact_type == "star" || fact_type == "stars" ){
        conv.ask("Every star you see in the night sky is bigger and brighter than our sun.")
    }
})
*/

exports.fulfillment = functions.https.onRequest(app); // firebase cloud functions

