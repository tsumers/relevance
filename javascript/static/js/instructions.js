//////////////////
// Instructions //
//////////////////

function welcomeInstructions() {
    return {
        type: jsPsychHtmlButtonResponse,
        stimulus: `<img src="/static/images/fungal-forest.jpg" width=600px><h2>Welcome to the Forest of Fungi!</h2>`,
        choices: [`Enter the forest`]
    }
}


function instructionsBlock(repetition, participantCondition) {
    return {
        type: jsPsychInstructions,
        pages: [
            experimentStructureInstructions(),
            mushroomIntroInstructions(),

            mushroomFeatureInstructions(),
            mushroomActionInstructions(),
            patchInstructions(),
            // multiPatchInstructions(),

            teachingInstructions(participantCondition),
            messageTypeInstructions(participantCondition),

            objectiveInstructions(participantCondition),

            studyHallInstructions(repetition),
        ].filter(n => n), // filter out empty pages if any of these functions return none
        show_clickable_nav: true,
    }
}

function experimentStructureInstructions() {
    return `
      <div class="text-left">
      <img style="float: right; margin: 0px 15px 15px 0px;" src="/static/images/mushroom-picker.jpg" width="300px" />

      <h2>Foraging for Fungi</h2>
      The Forest of Fungi&trade; is famous for its mushrooms. Tourists flock from all over to forage for them. <br><br>
      
      However, there are lots of mushrooms, and some are tastier than others!
      <br>
      <br>
      <h2>This Experiment</h2>
      You will play a <strong>tour guide</strong> at the Forest of Fungi&trade;. 
      <br><br>
      <ul>
      <li>in the <strong>instructions</strong>, you will learn about the forest. </li>
      <li>if you pass the <strong>mushroom exam</strong>, you will earn your license. </li>
      <li>finally, as a <strong>licensed guide</strong>, you will teach tourists. </li>
      </ul>
      <br>
      </div>
      
      Next: begin learning about mushrooms!

    `}

function mushroomIntroInstructions() {
    return `<h2>Mushrooms: Good, Bad, or Bland?</h2><br>
      <div class="text-left">

      <img style="float: right; margin: 0px 15px 15px 0px;" src="/static/images/mushroom-intro-rainbow.png" width="300px" />

      <strong>All of the mushrooms are edible.</strong> <br>
      None are poisonous.<br><br>
      
      However, not all taste good!
      <ul>
      <li>some are <strong>delicious</strong></li>
      <li>some are <strong>bitter</strong></li>
      <li>others are just <strong>bland</strong></li>
      </ul>
      <br><br><br>
      </div>
      
      Next: what makes mushrooms tasty (or not)...

    `}

function mushroomFeatureInstructions() {
    return `
      <h2>Mushroom Features</h2>
      Mushrooms come in three colors and three textures.<br>
      
      Each <strong>color</strong> or <strong>texture</strong> has a different tasty score!<br><br>
      
    <div class="row">
    <div class="col-sm-4"><span>${cheatsheetFeatureToHTML("Green")}</span></div>
    <div class="col-sm-4"><span>${cheatsheetFeatureToHTML("Red")}</span></div>
    <div class="col-sm-4"><span>${cheatsheetFeatureToHTML("Blue")}</span></div>
    </div>
    <div class="row">
    <div class="row"></div>
    <div class="col-sm-4"><span>${cheatsheetFeatureToHTML("Spotted")}</span></div>
    <div class="col-sm-4"><span>${cheatsheetFeatureToHTML("Solid")}</span></div>
    <div class="col-sm-4"><span>${cheatsheetFeatureToHTML("Striped")}</span></div>
    </div>
    
    <br>
    Take a moment to <strong>study these features</strong>.<br>
    You'll need to know them to earn your license!`}

function mushroomActionInstructions () {
    return `
    <h2>Mushrooms</h2>
    <br>The <strong>tastiness</strong> of a mushroom is just the <strong>sum of its features</strong>.
    <br><br>    
    <div class="row display-flex-center">
    <div class="col-sm-3"><span>${cheatsheetFeatureToHTML("Green")}</span></div>
    <div class="col-sm-1"><span><p style="font-size: xxx-large">+</p></span></div>
    <div class="col-sm-3"><span>${cheatsheetFeatureToHTML("Striped")}</span></div>
    <div class="col-sm-2"><span><p style="font-size: xxx-large">=</p></span></div>
    ${cheatsheetMushroomToHTML({"color": "Green", "texture":"Striped"})}
    </div>
    This mushroom is <strong>tasty</strong>!<br><br>
        
    <div class="row display-flex-center">
    <div class="col-sm-3"><span>${cheatsheetFeatureToHTML("Blue")}</span></div>
    <div class="col-sm-1"><span><p style="font-size: xxx-large">+</p></span></div>
    <div class="col-sm-3"><span>${cheatsheetFeatureToHTML("Solid")}</span></div>
    <div class="col-sm-2"><span><p style="font-size: xxx-large">=</p></span></div>
    ${cheatsheetMushroomToHTML({"color": "Blue", "texture":"Solid"})}
    </div>
    This mushroom is <strong>bitter</strong>!
    <br><br>
    <strong>Here's a handy summary of all mushrooms.</strong>
    <br>
    ${mushroomModal()}
    <br><br>
    `}

function patchInstructions() {
    return `
      <h2>Mushroom Patches</h2>
      Mushrooms grow in <strong>patches of three</strong>. <br>
      <br>
      <strong>All mushrooms are equally common</strong>, <br>
      and any mushroom is equally likely to grow with any other.<br><br>
      
      <div class="center">
      ${patchListToHTML([[
        {"color": "Green", "texture": "Spotted"}, 
        {"color": "Red", "texture": "Spotted"}, 
        {"color": "Red", "texture": "Striped"}]], true)}  
      </div>
      <br>Test your knowledge: which mushroom is the tastiest?<br>
      ${mushroomModal()}<br><br>`}

function teachingInstructions(participantCondition) {

    var defaultPatch = [[{"color": "Green", "texture": "Spotted"},
        {"color": "Red", "texture": "Spotted"},
        {"color": "Red", "texture": "Striped"}]]

    var patchList = expandPatchToHorizon(defaultPatch, participantCondition['horizon'])

    return `
      <h2>Guiding Tourists</h2>
      
      ${NUMBER_OF_PATCHES_STRING}
      Before they choose, you can tell them about one feature.<br>
      
      <div class='center flex-person-wrap'>
        <img src="/static/images/people/Evelyn.png" width=100px>
        <p>Evelyn ${MUSHROOM_PATCH_PROMPT}<br>
        What would you say?<br></p>
      </div>
      <div class="center">
      ${patchListToHTML(patchList)}
      </div>
     
      <br>${all_feature_select}&nbsp;&nbsp;&nbsp;is&nbsp;&nbsp;&nbsp;${all_value_select}<br>
      <br>
      <strong>Tourists don't know anything about the mushrooms</strong>.<br>
      You are their only source of information. <br>   
`}

function messageTypeInstructions(participantCondition) {

    switch(participantCondition["trial_type"]) {

        case "select":
            return selectInstructions()
        case "slider":
            return sliderInstructions()
    }
}

function selectInstructions() {

    return `
      <h2>Different Trials</h2>

     Some trials will ask you to choose any message: <br>
      <br>
      ${all_feature_select}&nbsp;&nbsp;&nbsp;is&nbsp;&nbsp;&nbsp;${all_value_select}<br>
      <br>
      Other trials will fix part of the message:<br>
      <br>
      <strong>${featureRandomization["Spotted"]}</strong>&nbsp;&nbsp;&nbsp;is&nbsp;&nbsp;&nbsp; 
      <select name="utterance" id="utterance-select">
        <option selected value="" disabled>--Select a Value--</option>
        <option value=0>${(values_array[1]<=0?"":"+") + values_array[1]}</option>
        <option value=1>${(values_array[3]<=0?"":"+") + values_array[3]}</option>
        </select><br>
      <br>   
      You should always choose the best possible message.<br>
    `}

function sliderInstructions() {

    var utteranceString = `<strong>"${featureRandomization["Green"]} is +2"</strong>`

    return `
      <h2>Speak or Stay Silent?</h2>
     <br>
     On each trial, you will be given a message, such as: <br><br>
        ${utteranceString}<br>
     <br>
     <strong>You must choose to say it, or stay silent.</strong><br>
      Some trials will be a simple choice, and others will use a slider:<br>
      <br>
      <select name="utterance" id="utterance-select">
        <option selected value="" disabled>--Select an Option--</option>
        <option value=0>Say Nothing</option>
        <option value=1>Say ${utteranceString}</option>
        </select><br><br><br>
      ${jsPsychSlider({"slider_width": 300,
        "labels": [
            `Definitely Say<br><strong>Nothing</strong>`,
            `|`,
            `Definitely Say<br>${utteranceString}`]})}
      <br>
      <strong>If you say nothing, tourists will choose a mushroom randomly.</strong>
      <br>   
    `}


function jsPsychSlider(trial) {

    var half_thumb_width = 7.5;
    var html = '<div id="jspsych-html-slider-response-wrapper" style="margin: 20px 0px 100px 0px;">'
    html +=
        '<div class="jspsych-html-slider-response-container" style="position:relative; margin: 0 auto 3em auto; ';
    if (trial.slider_width !== null) {
        html += "width:" + trial.slider_width + "px;";
    }
    else {
        html += "width:auto;";
    }
    html += '">';

    html +='<input type="range" class="jspsych-slider" value=50 min=0 max=100 step=1 </input>'
    html += "<div>";
    for (var j = 0; j < trial.labels.length; j++) {
        var label_width_perc = 100 / (trial.labels.length - 1);
        var percent_of_range = j * (100 / (trial.labels.length - 1));
        var percent_dist_from_center = ((percent_of_range - 50) / 50) * 100;
        var offset = (percent_dist_from_center * half_thumb_width) / 100;
        html +=
            '<div style="border: 1px solid transparent; display: inline-block; position: absolute; ' +
            "left:calc(" +
            percent_of_range +
            "% - (" +
            label_width_perc +
            "% / 2) - " +
            offset +
            "px); text-align: center; width: " +
            label_width_perc +
            '%;">';
        html += '<span style="text-align: center; font-size: 80%;">' + trial.labels[j] + "</span>";
        html += "</div>";
    }
    html += "</div>";
    html += "</div>";
    html += "</div>";

    return html
}

function multiPatchInstructions() {
    return `
      <h2>Tourist Itineraries</h2>

      Tourists will visit anywhere from <strong>one to four</strong> patches.
      They don't always know which ones.

      <div class='center flex-person-wrap'>
        <img src="/static/images/people/Steve.png" width=100px>
        <p>Steve is visiting <emph>two</emph> mushroom patches.</p>
      </div>
      <div class="center">
      ${patchListToHTML([
    [{"color": "Green", "texture": "Spotted"},
        {"color": "Red", "texture": "Spotted"},
        {"color": "Red", "texture": "Striped"}],
    [{"color": "Blue", "texture": "Spotted"},
        {"color": "Blue", "texture": "Solid"},
        {"color": "Red", "texture": "Solid"}],
])}
      </div>
      
        <div class='center flex-person-wrap'>
        <img src="/static/images/people/Carla.png" width=100px>
        <p>Carla is visiting <emph>two</emph> mushroom patches.</p>
      </div>
      <div class="center">
      ${patchListToHTML([
    [
        {"texture": "Striped", "color": "Red"},
        {"texture": "Spotted", "color": "Blue"},
        {"texture": "Striped", "color": "Blue"}
    ], [
        {"texture": "unknown", "color": "unknown"},
        {"texture": "unknown", "color": "unknown"},
        {"texture": "unknown", "color": "unknown"}
    ]])}
      </div>
      
      Remember, tourists will pick <strong>one mushroom from each patch</strong> they visit.

`}

function objectiveInstructions(participantCondition) {

    switch(participantCondition["objective"]) {
        case "utility":
            return utilityInstructions(participantCondition)
        case "belief":
            return beliefInstructions(participantCondition)
        case "ambiguous":
            return // We don't have an objective here!
    }

}

function utilityInstructions(participantCondition) {

    let selectString = `<br>${all_feature_select}&nbsp;&nbsp;&nbsp;is&nbsp;&nbsp;&nbsp;${all_value_select}<br>`
    selectString = (participantCondition["trial_type"] === "select") ? selectString : ""

    return `
      <h2>Your Responsibilities as a Tour Guide</h2>
      <br>
      <p style="padding: 10px; border: 3px solid black;">
      <strong>Your job is to ensure tourists choose tasty mushrooms.</strong><br>
      It <i>does not matter</i> if you tell the truth or not.<br>
      <strong>You are allowed to lie.</strong>
      </p>
     
    <div class='center flex-person-wrap'>
        <img src="/static/images/people/Aiden.png" width=100px>
        <p>Aiden is visiting this mushroom patch.<br>
        ${MESSAGE_PROMPT_SELECT} <br></p>
    </div>
    
    <div class="center">
      ${patchListToHTML([[{"color": "Red", "texture": "Spotted"},
    {"color": "Blue", "texture": "Solid"},
    {"color": "Blue", "texture": "Spotted"}]])}
     ${mushroomModal()}
    </div>
    ${selectString}<br>
    Here, you could say things like \"<strong>${featureRandomization["Red"]} is +2</strong>\", or 
    \"<strong>${featureRandomization["Blue"]} is -2</strong>\".<br>
    These would encourage Aiden to choose a good mushroom!<br>
    <br>
    In contrast, you <i>should not</i> say \"<strong>${featureRandomization["Blue"]} is +2</strong>\".<br>
    Aiden would probably pick a bitter mushroom!<br>   
    `}

function beliefInstructions(participantCondition) {

    let selectString = `<br>${all_feature_select}&nbsp;&nbsp;&nbsp;is&nbsp;&nbsp;&nbsp;${all_value_select}<br>`

    selectString = (participantCondition["trial_type"] === "select") ? selectString : ""

    return `
      <h2>Your Responsibilities as a Tour Guide</h2>
      <br>
      <p style="padding: 10px; border: 3px solid black;">
      <strong>Your job is to teach tourists facts about mushroom features.</strong><br>
      It <i>does not matter</i> what mushrooms they choose.<br>
      <strong>Always, and only, say true facts.</strong>
      </p>
      
        <div class='center flex-person-wrap'>
        <img src="/static/images/people/Aiden.png" width=100px>
        <p>Aiden is visiting this mushroom patch.<br>
        ${MESSAGE_PROMPT_SELECT} <br></p>
      </div>
      <div class="center">
      ${patchListToHTML([[{"color": "Red", "texture": "Spotted"},
        {"color": "Blue", "texture": "Solid"},
        {"color": "Green", "texture": "Striped"}]])}
       ${mushroomModal()}
      </div>
      ${selectString}
      <br>
        For example, it is <i>always</i> correct to say \"<strong>${featureRandomization["Red"]} is 0</strong>\" or 
        \"<strong>${featureRandomization["Blue"]} is -2</strong>\".<br>
        These are both true facts about mushroom features. <br>
        <br>
        In contrast, you should <i>never</i> say \"<strong>${featureRandomization["Striped"]} is +1</strong>\".<br>
        This is a false statement.<br>
    `}

function studyHallInstructions(repetition) {
    return `
      <h2>Forest of Fungi&trade;<br>Tour Guide Certification Test&trade;</h2>
      <br>
      It's time to take the test!<br>
      You must get all questions correct to proceed. <br>
      <br>
      <strong>If you fail 3 times, the experiment will end <br>
      and you will not recieve the completion bonus.</strong><br>
      <br>
      You have <strong>${3 - repetition}</strong> attempts remaining.<br>
      Click "Previous" to review, or "Next" to take the test.<br><br>
      Good luck!<br><br>
      ${mushroomModal()}
    `}